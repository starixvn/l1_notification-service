import jackpots from "./jackpot";

const getJackPotWinners = async (gameIds, limit, operatorId, siteName) => {
    const winnersFilter = {
        winnerName: { $exists: true },
        gameId: { $in: gameIds },
        operatorId,
        $or: [{ siteNames: { $elemMatch: { $eq: siteName } } }, { siteNames: { $size: 0 } }],
    };
    const jackpotWinnersProjection = {
        _id: false,
        gameId: true,
        pool: "$prize",
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

const getRunningPools = async (gameIds, operatorId, siteName) => {
    const runningPoolsFilter = {
        winnerName: { $exists: false },
        gameId: { $in: gameIds },
        operatorId,
        $or: [{ siteNames: { $elemMatch: { $eq: siteName } } }, { siteNames: { $size: 0 } }],
    };

    const projection = {
        _id: false,
        gameId: true,
        pool: "$prize",
        p: "$pool",
        amount: true,
    };

    return jackpots
        .find(runningPoolsFilter, projection, { sort: { gameId: 1, pool: 1 } })
        .lean()
        .exec();
};

export { getJackPotWinners, getRunningPools };

