import Joi from "joi";
import { userInfos } from "sc-base-database";
import { logger } from "sc-common";
import { emitEvents, getSockets, mongoEmitter } from "../../adapters/socket-adapter";
import * as currencyRepository from "./currency-repository";
import { getExchangeRates } from "./exchange-rate-repository";
import * as jackpotRepository from "./jackpot-repository";
import * as partnerConfigRepository from "./partner-config-repository";

const jackpotGames = [29];

const validateParams = (params) => {
    const schema = Joi.object({
        gameId: Joi.number().required(),
        pool: Joi.number().required(),
        winnerName: Joi.string().required(),
        amount: Joi.number().required(),
    });

    const { error } = schema.validate(params);
    const valid = error == null;

    if (params && valid) {
        return true;
    }

    logger.logCritical(`The jackpot winner information is invalid, details: ${JSON.stringify(params)}`);

    return false;
};

export const sendAllUserExceptExclusionSite = async (payload) => {
    const sockets = getSockets();
    const { gameId } = payload;
    
    if (gameId === jackpotGames[0]) {
        await updateFourGuardianRecords([payload]);
    }
    
    await Promise.all(sockets.map((socket) => sendJackpotWinnerWhenNotExcluded(socket, payload)));
};

const sendJackpotWinnerWhenNotExcluded = async (socket, payload) => {
    const { session } = socket.data;
    const { gameId } = payload;
    
    if (session && !session.disableJackpotGames) {
        const offeredGames = await getOfferedGames(session);
        const isOffered = offeredGames.some((game) => game.gameId === gameId);

        isOffered && socket.emit("jackpotWinner", payload);
    }
};

export const getOfferedGames = async (session) => {
    const currencyGroup = await currencyRepository.getCurrencyGroup(session.currencyGroupId);
    const currency = await currencyRepository.getCurrency(session.currencyName, session.partnerId);

    if (currency?.enabled && currencyGroup?.enabled) {
        const groupOfferGames = await currencyRepository.getOfferedGames(session.currencyGroupId);
        const gamesExcludedBySite = await getGamesExcludedByPartnerSite(session.partnerId, session.siteName);
        const gamesExcludedBySession = session.disableJackpotGames ? jackpotGames : [];
        const excludedGames = [...gamesExcludedBySite, ...gamesExcludedBySession];
        return groupOfferGames?.filter((game) => !excludedGames.includes(game.gameId)) ?? [];
    }

    return [];
};

const getGamesExcludedByPartnerSite = async (partnerId, siteName) => {
    const gameSiteExclusions = await partnerConfigRepository.getSiteExclusionByPartner(partnerId);

    return Object.keys(gameSiteExclusions?.value ?? {}).reduce((result, gameId) => {
        const exclusionSites = gameSiteExclusions.value[gameId]?.map((site) => site?.toLowerCase());
        if (exclusionSites.includes(siteName?.toLowerCase())) {
            result.push(+gameId);
        }

        return result;
    }, []);
};

const getJackpotWinnersMapAvatar = async (jackpotWinners) => {
    const winnerNames = jackpotWinners.map((winner) => winner.winnerName);
    const avatarsFilter = { name: { $in: winnerNames } };
    const avatarsProjection = {
        _id: false,
        name: true,
        avatarId: true,
    };
    const avatars = await userInfos.find(avatarsFilter, avatarsProjection).lean().exec();

    return jackpotWinners.map((winner) => {
        const avatarId = avatars.find((avatar) => avatar.name === winner.winnerName)?.avatarId ?? 0;
        const winningAmount = winner.amount * winner.winningRatio;

        return {
            gameId: winner.gameId,
            pool: winner.pool,
            amount: winningAmount,
            winnerName: winner.winnerName,
            avatarId,
            exchangeRateId: winner.exchangeRateId,
        };
    });
};

const updateFourGuardianRecords = async (records) => {
    const fourGuardiansRecords = records.filter((x) => x.gameId === jackpotGames[0]);

    if (fourGuardiansRecords.length > 0) {
        const currency = await currencyRepository.getCurrency("INH", "ONEworksVGCash");
        if (currency) {
            for (const record of fourGuardiansRecords) {
                record.amount *= currency.multiplier;
            }
        }
    }

    return records;
};

export const getWinners = async (socket, { limit }) => {
    const { session } = socket.data;
    if (!session.disableJackpotGames) {
        const jackpotWinners = await queryJackpotWinners(session, limit);
        const winnersWithAvatars = await getJackpotWinnersMapAvatar(jackpotWinners);
        const result = await updateExchangeRateCode(session, winnersWithAvatars);

        socket.emit("jackpotWinners", result);
    } else {
        socket.emit("jackpotWinners", []);
    }
};

async function queryJackpotWinners(session, limit) {
    const offeredGames = await getOfferedGames(session);

    const jackpotWinners = await jackpotRepository.getJackPotWinners(
        offeredGames.filter((game) => game.stakeLevels?.length > 0).map((game) => game.gameId),
        limit
    );

    return updateFourGuardianRecords(jackpotWinners);
}

async function updateExchangeRateCode(session, winners) {
    const { currencyCode } = session;
    const exchangeRates = (await getExchangeRates(winners.filter((x) => x.exchangeRateId).map((x) => x.exchangeRateId))).map((rate) => {
        rate.code[currencyCode] = parseFloat(rate.code[currencyCode]);
        return rate;
    });

    for (const winner of winners) {
        winner.exchangeRateCode = {
            [currencyCode]: exchangeRates.find((er) => winner.exchangeRateId === er.exId)?.code[currencyCode],
        };
    }

    return winners;
}

export const getPools = async (socket, payload) => {
    const { session } = socket.data;
    const offeredGames = await getOfferedGames(session);

    const jackpotPools = session.disableJackpotGames
        ? []
        : await jackpotRepository.getRunningPools(
              offeredGames
                  .filter((game) => game.stakeLevels?.length > 0 && (!payload?.gameId || game.gameId === payload.gameId))
                  .map((game) => game.gameId)
          );

    const result = await updateFourGuardianRecords(jackpotPools);

    socket.emit(payload?.gameId ? "jackpotPoolsOnGame" : "jackpotPools", result);
};

export const notifyJackpotWinner = (req, res) => {
    const isValidParams = validateParams(req.body);

    if (isValidParams) {
        mongoEmitter.serverSideEmit(emitEvents.jackpotWinner, req.body);
        res.send({ received: true });
    } else {
        res.send({ error: true });
    }
};
