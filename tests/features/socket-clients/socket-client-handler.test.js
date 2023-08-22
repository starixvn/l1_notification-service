import * as handler from "../../../src/features/socket-clients/socket-client-handler";
import { getConnectedClients } from "../../../src/features/socket-server/socket-server-handler";

jest.mock("../../../src/features/socket-server/socket-server-handler", () => ({
    getConnectedClients: jest.fn(),
}));

describe("socketClientHandler", () => {
    describe("getTotalClients", () => {
        it("should return total of clients", async () => {
            // Arrange
            const res = { send: jest.fn() };
            getConnectedClients.mockReturnValueOnce([{}]);

            // Act
            await handler.getTotalClients({}, res);

            // Assert
            expect(res.send).toBeCalledWith(200, 1);
        });
    });
});
