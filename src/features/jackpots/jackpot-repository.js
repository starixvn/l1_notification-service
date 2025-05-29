import { getJackpotConfigs } from "./jackpot-configs";
import jackpot_pools_notification from "./jackpot-pools-notifications";
import jackpot_winners_notification from "./jackpot-winners-notifications";

const getJackPotWinners = async (gameIds, limit, operatorId, siteName) => {
    const jackpotConfigs = await getJackpotConfigs(gameIds, operatorId, siteName);

    const winnersFilter = {
        winnerName: { $exists: true },
        gameId: { $in: gameIds },
        jackpotConfigId: { $in: jackpotConfigs.map((config) => config._id) },
    };

    const jackpotWinnersProjection = {
        _id: false,
        gameId: true,
        pool: "$prize",
        winnerName: true,
        amount: true,
        exchangeRateId: true,
    };
    const sort = {
        hitTime: -1,
    };

    return jackpot_winners_notification.find(winnersFilter, jackpotWinnersProjection, { sort, limit }).lean().exec();
};

const getRunningPools = async (gameIds, operatorId, siteName) => {
    const jackpotConfigs = await getJackpotConfigs(gameIds, operatorId, siteName);

    const runningPoolsFilter = {
        winnerName: { $exists: false },
        gameId: { $in: gameIds },
        jackpotConfigId: { $in: jackpotConfigs.map((config) => config._id) },
    };

    const projection = {
        _id: false,
        gameId: true,
        pool: "$prize",
        amount: true,
    };

    return jackpot_pools_notification
        .find(runningPoolsFilter, projection, { sort: { gameId: 1 } })
        .lean()
        .exec();
};

const updateJackpotPools = async (gameId, pools) => {
    await jackpot_pools_notification.deleteMany({ gameId });
    await jackpot_pools_notification.insertMany(pools);
};

const insertJackpotWinners = async (winner) => {
    await jackpot_winners_notification.create(winner);
};

export { getJackPotWinners, getRunningPools, insertJackpotWinners, updateJackpotPools };
