import * as handler from "../../../src/features/socket-server/socket-server-handler";
import Chance from "chance";

describe("socketServerHandler", () => {
    const chance = new Chance();
    const io = {
        sockets: {
            emit: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        __rewire_reset_all__();
    });

    describe("init", () => {
        it("should assign io.sockets to socketServer", () => {
            // Act
            handler.init(io);

            // Assert
            expect(handler.default.__get__("socketServer")).toStrictEqual(io.sockets);
        });
    });

    describe("broadcastAll", () => {
        const emitEvent = chance.string();
        const data = { message: chance.string() };

        it("should call socketServer.emit", () => {
            // Arrange
            handler.default.__set__("socketServer", io.sockets);

            // Act
            handler.broadcastAll(emitEvent, data);

            // Assert
            expect(io.sockets.emit).toBeCalledWith(emitEvent, data);
        });
    });
});
