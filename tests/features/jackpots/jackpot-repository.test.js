import Chance from "chance";
import { stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { getJackpotConfigs } from "../../../src/features/jackpots/jackpot-configs";
import jackpot_pools_notification from "../../../src/features/jackpots/jackpot-pools-notifications";
import {
    getJackPotWinners,
    getRunningPools,
    insertJackpotWinners,
    updateJackpotPools,
} from "../../../src/features/jackpots/jackpot-repository";
import jackpot_winners_notification from "../../../src/features/jackpots/jackpot-winners-notifications";

jest.mock("../../../src/features/jackpots/jackpot-configs");
jest.mock("../../../src/features/jackpots/jackpot-pools-notifications");
jest.mock("../../../src/features/jackpots/jackpot-winners-notifications");

jackpot_pools_notification.find = stubMongoose(mongoose.Model).find;
jackpot_pools_notification.deleteMany = jest.fn();
jackpot_pools_notification.insertMany = jest.fn();
jackpot_winners_notification.find = stubMongoose(mongoose.Model).find;
jackpot_winners_notification.create = jest.fn();

const chance = new Chance();

describe("jackpotRepository", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getJackPotWinners", () => {
        it("should call getJackpotConfigs with correct parameters", async () => {
            // Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 1, max: 5 }));
            const limit = chance.integer({ min: 1, max: 500 });
            const operatorId = chance.string();
            const siteName = chance.string();
            const mockConfigs = [{ _id: chance.string() }, { _id: chance.string() }];
            getJackpotConfigs.mockResolvedValue(mockConfigs);

            // Act
            await getJackPotWinners(gameIds, limit, operatorId, siteName);

            // Assert
            expect(getJackpotConfigs).toHaveBeenCalledWith(gameIds, operatorId, siteName);
        });

        it("should call jackpot_winners_notification.find with correct filter", async () => {
            // Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 1, max: 5 }));
            const limit = chance.integer({ min: 1, max: 500 });
            const operatorId = chance.string();
            const siteName = chance.string();
            const mockConfigs = [{ _id: chance.string() }, { _id: chance.string() }];
            getJackpotConfigs.mockResolvedValue(mockConfigs);
            const expectedFilter = {
                winnerName: { $exists: true },
                gameId: { $in: gameIds },
                jackpotConfigId: { $in: mockConfigs.map((config) => config._id) },
            };

            // Act
            await getJackPotWinners(gameIds, limit, operatorId, siteName);

            // Assert
            expect(jackpot_winners_notification.find).toHaveBeenCalledWith(expectedFilter, expect.any(Object), expect.any(Object));
        });

        it("should call jackpot_winners_notification.find with correct projection", async () => {
            // Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 1, max: 5 }));
            const limit = chance.integer({ min: 1, max: 500 });
            const operatorId = chance.string();
            const siteName = chance.string();
            const mockConfigs = [{ _id: chance.string() }];
            getJackpotConfigs.mockResolvedValue(mockConfigs);
            const expectedProjection = {
                _id: false,
                gameId: true,
                pool: "$prize",
                winnerName: true,
                amount: true,
                exchangeRateId: true,
            };

            // Act
            await getJackPotWinners(gameIds, limit, operatorId, siteName);

            // Assert
            expect(jackpot_winners_notification.find).toHaveBeenCalledWith(expect.any(Object), expectedProjection, expect.any(Object));
        });

        it("should call jackpot_winners_notification.find with correct options", async () => {
            // Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 1, max: 5 }));
            const limit = chance.integer({ min: 1, max: 500 });
            const operatorId = chance.string();
            const siteName = chance.string();
            const mockConfigs = [{ _id: chance.string() }];
            getJackpotConfigs.mockResolvedValue(mockConfigs);
            const expectedOptions = {
                sort: { hitTime: -1 },
                limit,
            };

            // Act
            await getJackPotWinners(gameIds, limit, operatorId, siteName);

            // Assert
            expect(jackpot_winners_notification.find).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), expectedOptions);
        });
    });

    describe("getRunningPools", () => {
        it("should call getJackpotConfigs with correct parameters", async () => {
            // Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 1, max: 5 }));
            const operatorId = chance.string();
            const siteName = chance.string();
            const mockConfigs = [{ _id: chance.string() }];
            getJackpotConfigs.mockResolvedValue(mockConfigs);

            // Act
            await getRunningPools(gameIds, operatorId, siteName);

            // Assert
            expect(getJackpotConfigs).toHaveBeenCalledWith(gameIds, operatorId, siteName);
        });

        it("should call jackpot_pools_notification.find with correct filter", async () => {
            // Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 1, max: 5 }));
            const operatorId = chance.string();
            const siteName = chance.string();
            const mockConfigs = [{ _id: chance.string() }, { _id: chance.string() }];
            getJackpotConfigs.mockResolvedValue(mockConfigs);
            const expectedFilter = {
                winnerName: { $exists: false },
                gameId: { $in: gameIds },
                jackpotConfigId: { $in: mockConfigs.map((config) => config._id) },
            };

            // Act
            await getRunningPools(gameIds, operatorId, siteName);

            // Assert
            expect(jackpot_pools_notification.find).toHaveBeenCalledWith(expectedFilter, expect.any(Object), expect.any(Object));
        });

        it("should call jackpot_pools_notification.find with correct projection", async () => {
            // Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 1, max: 5 }));
            const operatorId = chance.string();
            const siteName = chance.string();
            const mockConfigs = [{ _id: chance.string() }];
            getJackpotConfigs.mockResolvedValue(mockConfigs);
            const expectedProjection = {
                _id: false,
                gameId: true,
                pool: "$prize",
                amount: true,
            };

            // Act
            await getRunningPools(gameIds, operatorId, siteName);

            // Assert
            expect(jackpot_pools_notification.find).toHaveBeenCalledWith(expect.any(Object), expectedProjection, expect.any(Object));
        });

        it("should call jackpot_pools_notification.find with correct sort options", async () => {
            // Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 1, max: 5 }));
            const operatorId = chance.string();
            const siteName = chance.string();
            const mockConfigs = [{ _id: chance.string() }];
            getJackpotConfigs.mockResolvedValue(mockConfigs);
            const expectedOptions = {
                sort: { gameId: 1 },
            };

            // Act
            await getRunningPools(gameIds, operatorId, siteName);

            // Assert
            expect(jackpot_pools_notification.find).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), expectedOptions);
        });
    });

    describe("updateJackpotPools", () => {
        it("should call deleteMany with correct gameId", async () => {
            // Arrange
            const gameId = chance.integer();
            const pools = [
                { pool: chance.string(), amount: chance.integer() },
                { pool: chance.string(), amount: chance.integer() },
            ];
            jackpot_pools_notification.deleteMany.mockResolvedValue();
            jackpot_pools_notification.insertMany.mockResolvedValue();

            // Act
            await updateJackpotPools(gameId, pools);

            // Assert
            expect(jackpot_pools_notification.deleteMany).toHaveBeenCalledWith({ gameId });
        });

        it("should call insertMany with pools mapped with gameId", async () => {
            // Arrange
            const gameId = chance.integer();
            const pools = [
                { pool: chance.string(), amount: chance.integer() },
                { pool: chance.string(), amount: chance.integer() },
            ];
            const expectedPools = pools.map((pool) => ({ ...pool, gameId }));
            jackpot_pools_notification.deleteMany.mockResolvedValue();
            jackpot_pools_notification.insertMany.mockResolvedValue();

            // Act
            await updateJackpotPools(gameId, pools);

            // Assert
            expect(jackpot_pools_notification.insertMany).toHaveBeenCalledWith(expectedPools);
        });
    });

    describe("insertJackpotWinners", () => {
        it("should call create with gameId and winner data", async () => {
            // Arrange
            const gameId = chance.integer();
            const winner = {
                winnerName: chance.string(),
                amount: chance.integer(),
                exchangeRateId: chance.string(),
            };
            const expectedData = { gameId, ...winner };
            jackpot_winners_notification.create.mockResolvedValue();

            // Act
            await insertJackpotWinners(gameId, winner);

            // Assert
            expect(jackpot_winners_notification.create).toHaveBeenCalledWith(expectedData);
        });
    });
});
