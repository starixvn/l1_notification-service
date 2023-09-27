import jackpots from "./jackpot";

const getJackPotWinners = async (gameIds, limit) => {
    const winnersFilter = {
        winnerName: { $exists: true },
        gameId: { $in: gameIds },
    };
    const jackpotWinnersProjection = {
        _id: false,
        gameId: true,
        pool: true,
        winnerName: true,
        amount: true,
        winningRatio: true,
        exchangeRateId: true,
    };
    const sort = {
        hitTime: -1,
    };

    return jackpots.find(winnersFilter, jackpotWinnersProjection, { sort, limit }).lean().exec();
};

const getRunningPools = async (gameIds) => {
    const runningPoolsFilter = {
        winnerName: { $exists: false },
        gameId: { $in: gameIds },
    };

    const projection = {
        _id: false,
        gameId: true,
        pool: true,
        amount: true,
    };

    return jackpots
        .find(runningPoolsFilter, projection, { sort: { gameId: 1, pool: 1 } })
        .lean()
        .exec();
};

export { getJackPotWinners, getRunningPools };

