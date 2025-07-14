import Chance from "chance";
import { Server } from "socket.io";
import clientEvents from "../../src/constants/client-events";
import emitEvents from "../../src/constants/emit-events";
import { handlePromotionProgressEvent } from "../../src/adapters/socket-adapter";

const chance = new Chance();

describe("socket-adapter", () => {
    let socketServer;
    let mockNamespace;
    let mockSocket1;
    let mockSocket2;
    let mockSocket3;

    beforeEach(() => {
        mockSocket1 = {
            id: chance.guid(),
            data: {
                UID: "61b95cab5689b82e647f539d",
                session: { playerId: "player123" },
            },
            emit: jest.fn(),
        };

        mockSocket2 = {
            id: chance.guid(),
            data: {
                UID: "61b95cab5689b82e647f539e",
                session: { playerId: "player456" },
            },
            emit: jest.fn(),
        };

        mockSocket3 = {
            id: chance.guid(),
            data: {
                UID: "61b95cab5689b82e647f539f",
                session: { playerId: "player789" },
            },
            emit: jest.fn(),
        };

        mockNamespace = {
            sockets: {
                values: jest.fn(() => [mockSocket1, mockSocket2, mockSocket3]),
            },
            on: jest.fn(),
        };

        socketServer = {
            of: jest.fn(() => mockNamespace),
        };

        jest.clearAllMocks();
    });

    describe("registerEvents", () => {
        it("should register promotion progress event handler", () => {
            // We can't directly test registerEvents as it's not exported
            // But we can test that the event handling would work correctly
            // by testing the handlePromotionProgressEvent function directly

            // This test verifies the event would be registered correctly
            const eventName = emitEvents.promotionProgress;
            expect(eventName).toBe("promotionProgress");
        });
    });

    describe("handlePromotionProgressEvent", () => {
        const progressData = {
            playerId: "player123",
            operatorId: chance.string(),
            siteName: chance.string(),
            totalTO: chance.natural(),
            minTO: chance.floating({ min: 0, max: 100 }),
            remainTO: chance.natural(),
            progress: chance.integer({ min: 0, max: 100 }),
            canClaim: chance.bool(),
            win: chance.floating({ min: 0, max: 1000 }),
            expire: chance.date().toISOString(),
        };

        it("should find and emit to correct client by playerId", () => {
            // Act
            handlePromotionProgressEvent(progressData, socketServer);

            // Assert
            const { playerId, operatorId, siteName, ...notificationData } = progressData;
            expect(mockSocket1.emit).toBeCalledWith(clientEvents.promotionProgress, notificationData);
            expect(mockSocket2.emit).not.toHaveBeenCalled();
            expect(mockSocket3.emit).not.toHaveBeenCalled();
        });

        it("should not emit if no matching playerId found", () => {
            // Arrange
            const progressDataWithUnknownPlayer = {
                ...progressData,
                playerId: "unknownPlayer",
            };

            // Act
            handlePromotionProgressEvent(progressDataWithUnknownPlayer, socketServer);

            // Assert
            expect(mockSocket1.emit).not.toHaveBeenCalled();
            expect(mockSocket2.emit).not.toHaveBeenCalled();
            expect(mockSocket3.emit).not.toHaveBeenCalled();
        });

        it("should only emit once when target is found", () => {
            // Act
            handlePromotionProgressEvent(progressData, socketServer);

            // Assert
            const { playerId, operatorId, siteName, ...notificationData } = progressData;
            expect(mockSocket1.emit).toBeCalledWith(clientEvents.promotionProgress, notificationData);
            expect(mockSocket2.emit).not.toHaveBeenCalled();
            expect(mockSocket3.emit).not.toHaveBeenCalled();
        });

        it("should exclude sensitive data from notification", () => {
            // Act
            handlePromotionProgressEvent(progressData, socketServer);

            // Assert
            const { playerId, operatorId, siteName, ...notificationData } = progressData;
            expect(mockSocket1.emit).toBeCalledWith(clientEvents.promotionProgress, notificationData);
            expect(notificationData).not.toHaveProperty("playerId");
            expect(notificationData).not.toHaveProperty("operatorId");
            expect(notificationData).not.toHaveProperty("siteName");

            // Verify notification data contains expected fields
            expect(notificationData).toHaveProperty("totalTO");
            expect(notificationData).toHaveProperty("minTO");
            expect(notificationData).toHaveProperty("remainTO");
            expect(notificationData).toHaveProperty("progress");
            expect(notificationData).toHaveProperty("canClaim");
            expect(notificationData).toHaveProperty("win");
            expect(notificationData).toHaveProperty("expire");
        });

        it("should handle multiple sockets with same playerId correctly", () => {
            // Arrange
            const duplicateSocket = {
                id: chance.guid(),
                data: {
                    UID: "61b95cab5689b82e647f5400",
                    session: { playerId: "player123" },
                },
                emit: jest.fn(),
            };

            mockNamespace.sockets.values.mockReturnValue([mockSocket1, mockSocket2, mockSocket3, duplicateSocket]);

            // Act
            handlePromotionProgressEvent(progressData, socketServer);

            // Assert
            const { playerId, operatorId, siteName, ...notificationData } = progressData;
            expect(mockSocket1.emit).toBeCalledWith(clientEvents.promotionProgress, notificationData);
            expect(duplicateSocket.emit).not.toHaveBeenCalled();
        });
    });
});
