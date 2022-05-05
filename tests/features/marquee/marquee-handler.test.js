import Chance from "chance";
import { setMarquee, proceed, proceedMessage } from "../../../src/features/marquee/marquee-handler";
import notifications from "../../../src/features/game-notifications/notifications";
import * as socketServerHandler from "../../../src/features/socket-server/socket-server-handler";
import { stubMongoose } from "jest-micro-auto-stub";

jest.mock("../../../src/features/socket-server/socket-server-handler");

jest.mock("../../../src/app-configs", () => {
    return {
        marqueeDurations: {
            intervalTimeInMinute: 0.25,
            timeToDisplayMessageInMinute: 0.25,
        },
    };
});

let chance = new Chance();
socketServerHandler.broadcastAll = jest.fn();
notifications.find = stubMongoose(notifications).find;

describe("MarqueeHandler", () => {
    jest.useFakeTimers();

    afterAll(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe("setMarquee", () => {
        it("should setInterval to procceed notifications", () => {
            // Arrange
            jest.spyOn(global, "setInterval");

            // Act
            setMarquee();

            // Assert
            expect(global.setInterval).toHaveBeenCalledWith(proceed, 15000);
        });
    });

    describe("proceedMessage", () => {
        it("should emit message to all sockets", () => {
            // Arrange
            const message = chance.string();

            // Act
            proceedMessage(message);

            // Assert
            expect(socketServerHandler.broadcastAll).toHaveBeenCalledWith("marquee", message);
        });
    });

    describe("proceed", () => {
        beforeEach(async () => {
            // Arrange
            jest.spyOn(global, "setTimeout").mockImplementationOnce((cb) => {
                cb();
            });
            jest.spyOn(global, "clearInterval");
            jest.spyOn(global, "setInterval");
            notifications
                .find()
                .lean()
                .exec.mockResolvedValueOnce([{ messages: chance.string() }, { messages: chance.string() }, { messages: chance.string() }]);

            // Act
            await proceed();
        });

        it("should setTimeout to emit messages", () => {
            // Assert
            expect(global.setTimeout).toHaveBeenCalledTimes(3);
        });

        it("should clear previous interval", () => {
            // Assert
            expect(global.clearInterval).toHaveBeenCalled();
        });

        it("should set new setInterval with time = notifications.length * this.timeToDisplayMessage", () => {
            // Assert
            expect(global.setInterval).toHaveBeenCalledWith(proceed, 45000);
        });
    });
});
