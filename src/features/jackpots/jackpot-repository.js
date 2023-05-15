import jackpots from "./jackpot";

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
            const repository = jackpots(game);

            return repository
                .aggregate([
                    {
                        $match: winnersFilter,
                    },
                    { $sort: sort },
                    { $limit: limit },
                    {
                        $project: { ...jackpotWinnersProjection, gameId: game.gameId },
                    },
                ])
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
            const repository = jackpots(game);
            console.log(repository);
            return repository
                .aggregate([
                    {
                        $match: runningPoolsFilter,
                    },
                    {
                        $project: { ...projection, gameId: game.gameId },
                    },
                ])
                .exec();
        })
    );

    return result.flat();
};

export { getJackPotWinners, getRunningPools };

