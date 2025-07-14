import Chance from "chance";
import { logger } from "sc-common";
import { mongoEmitter } from "../../../src/adapters/socket-adapter";
import emitEvents from "../../../src/constants/emit-events";
import * as handler from "../../../src/features/promotion-progress/promotion-progress-handler";

jest.mock("sc-common", () => ({
    logger: {
        logError: jest.fn(),
    },
}));

jest.mock("../../../src/adapters/socket-adapter", () => ({
    mongoEmitter: {
        serverSideEmit: jest.fn(),
    },
}));

const chance = new Chance();

describe("promotionProgressHandler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("notifyPromotionProgress", () => {
        const validProgressData = {
            playerId: chance.guid(),
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

        const req = {
            body: validProgressData,
        };

        const res = {
            send: jest.fn(),
            status: jest.fn(() => res),
        };

        describe("when request is valid", () => {
            it("should emit to mongoEmitter with correct event and data", () => {
                // Act
                handler.notifyPromotionProgress(req, res);

                // Assert
                expect(mongoEmitter.serverSideEmit).toBeCalledWith(emitEvents.promotionProgress, validProgressData);
            });

            it("should respond with success", () => {
                // Act
                handler.notifyPromotionProgress(req, res);

                // Assert
                expect(res.send).toBeCalledWith({ received: true });
            });

            it("should not log error", () => {
                // Act
                handler.notifyPromotionProgress(req, res);

                // Assert
                expect(logger.logError).not.toHaveBeenCalled();
            });
        });

        describe("when playerId is missing", () => {
            it("should return 400 error", () => {
                // Arrange
                const invalidReq = {
                    body: {
                        ...validProgressData,
                        playerId: undefined,
                    },
                };

                // Act
                handler.notifyPromotionProgress(invalidReq, res);

                // Assert
                expect(res.status).toBeCalledWith(400);
                expect(res.send).toBeCalledWith({ error: "playerId is required" });
            });

            it("should not emit to mongoEmitter", () => {
                // Arrange
                const invalidReq = {
                    body: {
                        ...validProgressData,
                        playerId: undefined,
                    },
                };

                // Act
                handler.notifyPromotionProgress(invalidReq, res);

                // Assert
                expect(mongoEmitter.serverSideEmit).not.toHaveBeenCalled();
            });
        });

        describe("when playerId is empty string", () => {
            it("should return 400 error", () => {
                // Arrange
                const invalidReq = {
                    body: {
                        ...validProgressData,
                        playerId: "",
                    },
                };

                // Act
                handler.notifyPromotionProgress(invalidReq, res);

                // Assert
                expect(res.status).toBeCalledWith(400);
                expect(res.send).toBeCalledWith({ error: "playerId is required" });
            });
        });

        describe("when an error occurs", () => {
            it("should log error and return 500", () => {
                // Arrange
                const error = new Error("Test error");
                mongoEmitter.serverSideEmit.mockImplementationOnce(() => {
                    throw error;
                });

                // Act
                handler.notifyPromotionProgress(req, res);

                // Assert
                expect(logger.logError).toBeCalledWith(error);
                expect(res.status).toBeCalledWith(500);
                expect(res.send).toBeCalledWith({ error: "Internal server error" });
            });
        });
    });

    describe("handlePromotionProgressEvent", () => {
        const progressData = {
            playerId: chance.guid(),
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

        it("should return targetPlayerId and notificationData", () => {
            // Act
            const result = handler.handlePromotionProgressEvent(progressData);

            // Assert
            expect(result.targetPlayerId).toBe(progressData.playerId);
            expect(result.notificationData).toEqual({
                totalTO: progressData.totalTO,
                minTO: progressData.minTO,
                remainTO: progressData.remainTO,
                progress: progressData.progress,
                canClaim: progressData.canClaim,
                win: progressData.win,
                expire: progressData.expire,
            });
        });

        it("should exclude playerId, operatorId, and siteName from notificationData", () => {
            // Act
            const result = handler.handlePromotionProgressEvent(progressData);

            // Assert
            expect(result.notificationData).not.toHaveProperty("playerId");
            expect(result.notificationData).not.toHaveProperty("operatorId");
            expect(result.notificationData).not.toHaveProperty("siteName");
        });

        it("should handle minimal required data", () => {
            // Arrange
            const minimalData = {
                playerId: chance.guid(),
                totalTO: chance.natural(),
            };

            // Act
            const result = handler.handlePromotionProgressEvent(minimalData);

            // Assert
            expect(result.targetPlayerId).toBe(minimalData.playerId);
            expect(result.notificationData.totalTO).toBe(minimalData.totalTO);
        });
    });
});
