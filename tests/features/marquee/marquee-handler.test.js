import Chance from "chance";
import { stubMongoose } from "jest-micro-auto-stub";
import notifications from "../../../src/features/game-notifications/notifications";
import { proceed, proceedMessage, setMarquee } from "../../../src/features/marquee/marquee-handler";
import * as socketServerHandler from "../../../src/features/socket-server/socket-server-handler";

jest.mock("../../../src/features/socket-server/socket-server-handler", () => ({
    broadcastLocal: jest.fn(),
}));

jest.mock("../../../src/app-configs", () => {
    return {
        marqueeDurations: {
            timeOutInMinute: 0.25,
            timeToDisplayMessageInMinute: 0.25,
        },
    };
});

let chance = new Chance();
notifications.find = stubMongoose(notifications).find;

describe("MarqueeHandler", () => {
    jest.useFakeTimers();

    afterAll(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe("setMarquee", () => {
        it("should setTimeout to procceed notifications", () => {
            // Arrange
            jest.spyOn(global, "setTimeout");

            // Act
            setMarquee();

            // Assert
            expect(global.setTimeout).toHaveBeenCalledWith(proceed, 15000);
        });
    });

    describe("proceedMessage", () => {
        it("should emit message to all sockets", () => {
            // Arrange
            const message = chance.string();

            // Act
            proceedMessage(message);

            // Assert
            expect(socketServerHandler.broadcastLocal).toHaveBeenCalledWith("marquee", message);
        });
    });

    describe("proceed", () => {
        beforeEach(async () => {
            // Arrange
            jest.spyOn(global, "setTimeout").mockImplementationOnce((cb) => {
                cb();
            });
            jest.spyOn(global, "clearTimeout");
            jest.spyOn(global, "setTimeout");
            notifications
                .find()
                .lean()
                .exec.mockResolvedValueOnce([{ messages: chance.string() }, { messages: chance.string() }, { messages: chance.string() }]);

            // Act
            await proceed();
        });

        it("should setTimeout to emit messages", () => {
            // Assert
            expect(global.setTimeout).toHaveBeenCalledTimes(5);
        });

        it("should clear previous time out", () => {
            // Assert
            expect(global.clearTimeout).toHaveBeenCalled();
        });

        it("should set new setTimeout with time = notifications.length * this.timeToDisplayMessage", () => {
            // Assert
            expect(global.setTimeout).toHaveBeenCalledWith(proceed, 45000);
        });

        it("should reset new setTimeout with notifications.length = 0", () => {
            // Arrange
            notifications.find().lean().exec.mockResolvedValueOnce([]);

            // Act
            setMarquee();

            // Assert
            expect(global.setTimeout).toHaveBeenCalledWith(proceed, 15000);
        });
    });
});
