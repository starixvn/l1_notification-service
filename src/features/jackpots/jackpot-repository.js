import mongoose from "mongoose";
import jackpots, { schema } from "./jackpot";

const getJackPotWinners = async (games, limit) => {
    const winnersFilter = {
        winnerName: { $exists: true },
    };
    const jackpotWinnersProjection = {
        _id: false,
        pool: true,
        winnerName: true,
        amount: true,
        winningRatio: true,
    };
    const sort = {
        hitTime: -1,
    };

    const result = await Promise.all(
        games.map((game) => {
            const repository =
                game.gameId === 29
                    ? mongoose.models["jackpot"] ?? mongoose.model("jackpot", schema)
                    : mongoose.models[`${game.gameName}_jackpot`] ?? jackpots(game.gameName);
            return repository
                .find(winnersFilter, { ...jackpotWinnersProjection, gameId: game.gameId, gameName: game.gameName }, { sort, limit })
                .lean()
                .exec();
        })
    );

    return result.flat();
};

const getRunningPools = async (games) => {
    const runningPoolsFilter = {
        winnerName: { $exists: false },
    };

    const projection = {
        _id: false,
        pool: true,
        amount: true,
    };
    
    const result = await Promise.all(
        games.map((game) => {
            const repository =
                game.gameId === 29
                    ? mongoose.models["jackpot"] ?? mongoose.model("jackpot", schema)
                    : mongoose.models[`${game.gameName}_jackpot`] ?? jackpots(game.gameName);
            return repository
                .find(runningPoolsFilter, { ...projection, gameId: game.gameId, gameName: game.gameName })
                .lean()
                .exec();
        })
    );

    return result.flat();
};

export { getJackPotWinners, getRunningPools };

