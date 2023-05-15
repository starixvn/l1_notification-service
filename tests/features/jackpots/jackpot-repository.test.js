import Chance from "chance";
import jackpot from "../../../src/features/jackpots/jackpot";
import { getJackPotWinners, getRunningPools } from "../../../src/features/jackpots/jackpot-repository";

const jackpotRepository = {
    aggregate: () => ({
        exec: execMockFn,
    }),
};
const execMockFn = jest.fn();

jest.mock("../../../src/features/jackpots/jackpot", () => ({
    __esModule: true,
    default: jest.fn(),
}));
const chance = new Chance();

beforeAll(() => {
    jackpot.mockReturnValue(jackpotRepository);
});

describe("jackpotRepository", () => {
    describe("getJackPotWinners", () => {
        it("should call jackpots find", async () => {
            //Arrange
            const gameIds = [29];
            const games = gameIds.map((x) => ({ gameId: x, gameName: x.toString() }));
            const limit = chance.integer({ min: 0, max: 500 });
            execMockFn.mockReturnValueOnce([
                {
                    amount: 5001.875,
                    pool: 1,
                    winnerName: "lele60008",
                    winningRatio: 0.98,
                },
            ]);
            // Act
            const result = await getJackPotWinners(games, limit);

            // Assert
            expect(result).toContainEqual({
                amount: 5001.875,
                pool: 1,
                winnerName: "lele60008",
                winningRatio: 0.98,
            });
        });
    });

    describe("getRunningPools", () => {
        it("should call jackpots find", async () => {
            // Arrange
            const gameIds = [29];
            const expectedPools = [
                {
                    amount: 5001.875,
                    pool: 1,
                },
                {
                    amount: 50008,
                    pool: 10,
                },
                {
                    amount: 500018,
                    pool: 50,
                },
            ];
            execMockFn.mockReturnValueOnce(expectedPools);
            // Act
            const result = await getRunningPools(gameIds);

            // Assert
            expect(result).toEqual(expectedPools);
        });
    });
});
