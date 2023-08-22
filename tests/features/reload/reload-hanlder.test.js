import { mongoEmitter } from "../../../src/adapters/socket-adapter";
import emitEvents from "../../../src/constants/emit-events";
import * as handler from "../../../src/features/reload/reload-handler";
import * as socketServerHandler from "../../../src/features/socket-server/socket-server-handler";

jest.mock("../../../src/adapters/socket-adapter", () => ({
    mongoEmitter: {
        emit: jest.fn(),
    },
}));

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
            expect(mongoEmitter.emit).toBeCalledWith(emitEvents.reload, true);
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
