import Chance from "chance";
import { stubMongoose } from "jest-micro-auto-stub";
import jackpots from "../../../src/features/jackpots/jackpot";
import { getJackPotWinners, getRunningPools } from "../../../src/features/jackpots/jackpot-repository";

jest.mock("../../../src/features/jackpots/jackpot");
jackpots.find = stubMongoose(jackpots).find;

const chance = new Chance();

describe("jackpotRepository", () => {
    describe("getJackPotWinners", () => {
        it("should call jackpots find", async () => {
            //Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 0, max: 100 }), { min: 0, max: 100 });
            const limit = chance.integer({ min: 0, max: 500 });

            // Act
            await getJackPotWinners(gameIds, limit);

            // Assert
            expect(jackpots.find).toBeCalledWith(
                {
                    winnerName: { $exists: true },
                    gameId: { $in: gameIds },
                },
                {
                    _id: false,
                    gameId: true,
                    pool: "$prize",
                    winnerName: true,
                    amount: true,
                    winningRatio: true,
                    exchangeRateId: true,
                },
                {
                    sort: {
                        hitTime: -1,
                    },
                    limit,
                }
            );
        });
    });

    describe("getRunningPools", () => {
        it("should call jackpots find", async () => {
            // Arrange
            const gameIds = chance.unique(chance.integer, chance.integer({ min: 0, max: 100 }), { min: 0, max: 100 });

            // Act
            await getRunningPools(gameIds);

            // Assert
            expect(jackpots.find).toBeCalledWith(
                {
                    winnerName: { $exists: false },
                    gameId: { $in: gameIds },
                },
                {
                    _id: false,
                    gameId: true,
                    pool: "$prize",
                    amount: true,
                },
                {
                    sort: {
                        gameId: 1,
                        pool: 1,
                    },
                }
            );
        });
    });
});
