import Chance from "chance";
import * as handler from "../../../src/features/socket-server/socket-server-handler";

describe("socketServerHandler", () => {
    const chance = new Chance();
    const io = {
        sockets: {
            emit: jest.fn(),
        },
        emit: jest.fn(),
        local: {
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
            expect(handler.default.__get__("socketServer")).toStrictEqual(io);
        });
    });

    describe("broadcastAll", () => {
        const emitEvent = chance.string();
        const data = { message: chance.string() };

        it("should call socketServer.emit", () => {
            // Arrange
            handler.init(io);

            // Act
            handler.broadcastAll(emitEvent, data);

            // Assert
            expect(io.emit).toBeCalledWith(emitEvent, data);
        });
    });

    describe("broadcastLocal", () => {
        const emitEvent = chance.string();
        const data = { message: chance.string() };

        it("should call socketServer.local.emit", () => {
            // Arrange
            handler.init(io);

            // Act
            handler.broadcastLocal(emitEvent, data);

            // Assert
            expect(io.local.emit).toBeCalledWith(emitEvent, data);
        });
    });
});
