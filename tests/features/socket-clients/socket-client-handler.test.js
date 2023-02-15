import * as handler from "../../../src/features/socket-clients/socket-client-handler";
import Chance from "chance";
import { UserSession } from "jest-auto-fixture/src/models";

const chance = new Chance();

describe("socketClientHandler", () => {
    describe("addClient", () => {
        const socketClient = {
            id: chance.guid(),
            disconnect: jest.fn(),
        };
        const session = UserSession({ system: 1 });

        it("should return when system is instantGame", () => {
            // arrange
            const sessionTest = UserSession({ system: 3 });
            const existingSocketClient = {
                id: chance.guid(),
            };
            const socketClientsData = handler.default.__get__("socketClients");

            // act
            handler.addClient(existingSocketClient, sessionTest);

            // assert
            expect(socketClientsData[existingSocketClient.id]).toBeUndefined();
        });

        describe("when have existing client with same UID", () => {
            const existingSocketClient = {
                id: chance.guid(),
                disconnect: jest.fn(),
                emit: jest.fn(),
            };

            beforeEach(() => {
                handler.default.__set__("socketClients", {
                    [existingSocketClient.id]: { UID: session.userId, session, socketClient: existingSocketClient },
                });
            });

            it("should emit kickedOut to existing client", () => {
                // Act
                handler.addClient(socketClient, session);

                // Assert
                expect(existingSocketClient.emit).toBeCalledWith("kickedOut", true);
            });

            it("should call disconnectUser to remove existing client", () => {
                // Arrange
                handler.default.__set__("disconnectUser", jest.fn());
                const disconnectUserFunc = handler.default.__get__("disconnectUser");

                // Act
                handler.addClient(socketClient, session);

                // Assert
                expect(disconnectUserFunc).toBeCalledWith(existingSocketClient.id);
            });
        });

        it("should add client to list", () => {
            // Arrange
            const socketClientsData = handler.default.__get__("socketClients");

            // Act
            handler.addClient(socketClient, session);

            // Assert
            expect(socketClientsData[socketClient.id]).toStrictEqual({
                UID: session.userId,
                session,
                socketClient,
            });
        });
    });

    describe("getClients", () => {
        it("should return all clients", () => {
            // Arrange
            const data = { [chance.guid()]: {} };
            handler.default.__set__("socketClients", data);

            // Act
            const actualResult = handler.getClients();

            // Assert
            expect(actualResult).toStrictEqual(data);
        });
    });

    describe("getClientSession", () => {
        it("should return user session", () => {
            // Arrange
            const socketId = chance.guid();
            const session = UserSession();
            const data = { [socketId]: { session } };
            handler.default.__set__("socketClients", data);

            // Act
            const actualResult = handler.getClientSession(socketId);

            // Assert
            expect(actualResult).toStrictEqual(session);
        });
    });

    describe("disconnectUser", () => {
        const socketId = chance.guid();
        const session = UserSession();
        const socketClient = { id: chance.guid(), disconnect: jest.fn() };
        const socketClientsData = handler.default.__get__("socketClients");

        beforeEach(() => {
            handler.default.__set__("socketClients", { [socketClient.id]: { UID: session.userId, session, socketClient } });
        });

        it("should disconnect user socket", () => {
            // Act
            handler.disconnectUser(socketClient.id);

            // Assert
            expect(socketClient.disconnect).toBeCalledWith(true);
        });

        it("should remove user on cache", () => {
            // Act
            handler.disconnectUser(socketClient.id);

            // Assert
            expect(socketClientsData[socketId]).toBe(undefined);
        });
    });

    describe("getTotalClients", () => {
        it("should return total of clients", () => {
            // Arrange
            const res = { send: jest.fn() };
            handler.default.__set__("socketClients", { ["socketClientId"]: { UID: "UserId" } });

            // Act
            handler.getTotalClients({}, res);

            // Assert
            expect(res.send).toBeCalledWith(200, 1);
        });
    });
});
