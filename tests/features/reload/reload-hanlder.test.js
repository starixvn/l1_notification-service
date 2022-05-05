import * as handler from "../../../src/features/reload/reload-handler";
import * as socketServerHandler from "../../../src/features/socket-server/socket-server-handler";

jest.mock("../../../src/features/socket-server/socket-server-handler");

describe("reloadHandler", () => {
    const req = {};
    const res = { send: jest.fn() };

    describe("broadcastReload", () => {
        it("should call socketClientHandler.broadcastAllClient", () => {
            // Arrange
            socketServerHandler.broadcastAll = jest.fn();

            // Act
            handler.broadcastReload(req, res);

            // Assert
            expect(socketServerHandler.broadcastAll).toBeCalledWith("reload", true);
        });

        it("should call res.send", () => {
            // Arrange
            socketServerHandler.broadcastAll = jest.fn();

            // Act
            handler.broadcastReload(req, res);

            // Assert
            expect(res.send).toBeCalledWith({ received: true });
        });
    });
});
