import * as handler from "../../../src/features/mini-counter/mini-counter-handler";
import * as socketServerHandler from "../../../src/features/socket-server/socket-server-handler";

jest.mock("../../../src/features/socket-server/socket-server-handler");

describe("miniCounterHandler", () => {
    const body = { xocxoc: { time: new Date() } };
    const req = { body };
    const res = { send: jest.fn() };

    describe("handleMiniCounterWatcherData", () => {
        it("should call socketClientHandler.broadcastAllClient", () => {
            // Arrange
            socketServerHandler.broadcastAll = jest.fn();

            // Act
            handler.handleMiniCounterWatcherData(req, res);

            // Assert
            expect(socketServerHandler.broadcastAll).toBeCalledWith("mini-counter", body);
        });

        it("should call res.send", () => {
            // Arrange
            socketServerHandler.broadcastAll = jest.fn();

            // Act
            handler.handleMiniCounterWatcherData(req, res);

            // Assert
            expect(res.send).toBeCalledWith({ received: true });
        });
    });

    describe("getMiniCounterLatestData", () => {
        const socketClient = {
            emit: jest.fn(),
        };

        const latestData = {
            xocxoc: { time: new Date() },
        };

        afterEach(() => {
            __rewire_reset_all__();
        });

        it("should emit latest data to client", () => {
            // Arrange
            handler.default.__set__("latestData", latestData);

            // Act
            handler.getMiniCounterLatestData(socketClient);

            // Assert
            expect(socketClient.emit).toBeCalledWith("latest-mini-counter", latestData);
        });
    });
});
