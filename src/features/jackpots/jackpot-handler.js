import { logger } from "sc-common";
import { userInfos } from "sc-base-database";
import Joi from "joi";
import * as socketClientHandler from "../socket-clients/socket-client-handler";
import * as currencyRepository from "./currency-repository";
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

const sendAllUserExceptExclusionSite = async (payload) => {
    const siteExclusions = await partnerConfigRepository.getSiteExclusions();
    const clients = socketClientHandler.getClients();

    Object.values(clients).forEach((client) => sendJackpotWinnerWhenNotExcluded(client, siteExclusions, payload));
};

const sendJackpotWinnerWhenNotExcluded = async (client, siteExclusions, payload) => {
    const session = client.session;
    const { gameId } = payload;

    if (session && !isExcludeOnGame(session, gameId, siteExclusions)) {
        const offeredGames = await getOfferedGames(session);
        const isOffered = offeredGames.includes(gameId);

        isOffered && client.socketClient.emit("jackpotWinner", payload);
    }
};

export const isExcludeOnGame = (session, gameId, siteExclusions) => {
    const { siteName, partnerId } = session;
    const partnerSiteExclusions = siteExclusions.find((config) => partnerId === config.partnerId && config.value[gameId]);
    return partnerSiteExclusions && partnerSiteExclusions.value[gameId].some((site) => site?.toLowerCase() === siteName?.toLowerCase());
};

export const getOfferedGames = async (session) => {
    const currencyGroup = await currencyRepository.getCurrencyGroup(session.currencyGroupId);
    const currency = await currencyRepository.getCurrency(session.currencyName, session.partnerId);

    if (currency?.enabled && currencyGroup?.enabled) {
        const groupOfferGames = await currencyRepository.getOfferedGames(session.currencyGroupId);
        const gamesExcludedBySite = await getGamesExcludedByPartnerSite(session.partnerId, session.siteName);
        const gamesExcludedBySession = session.disableJackpotGames ? jackpotGames : [];
        const excludedGames = [...gamesExcludedBySite, ...gamesExcludedBySession];
        return groupOfferGames?.filter((game) => !excludedGames.includes(game.gameId)).map((game) => game.gameId) ?? [];
    }

    return [];
};

const getGamesExcludedByPartnerSite = async (partnerId, siteName) => {
    const gameSiteExclusions = await partnerConfigRepository.getSiteExclusionByPartner(partnerId);

    return Object.keys(gameSiteExclusions?.value ?? {}).reduce((result, gameId) => {
        if (gameSiteExclusions.value[gameId].includes(siteName)) {
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

        return { gameId: winner.gameId, pool: winner.pool, amount: winningAmount, winnerName: winner.winnerName, avatarId };
    });
};

export const getWinners = async (socketClient, { limit }) => {
    const session = socketClientHandler.getClientSession(socketClient.id);
    const offeredGames = await getOfferedGames(session);
    const jackpotWinners = await jackpotRepository.getJackPotWinners(offeredGames, limit);

    const result = await getJackpotWinnersMapAvatar(jackpotWinners);

    socketClient.emit("jackpotWinners", result);
};

export const getPools = async (socketClient) => {
    const session = socketClientHandler.getClientSession(socketClient.id);
    const offeredGames = await getOfferedGames(session);

    const jackpotPools = await jackpotRepository.getRunningPools(offeredGames);

    socketClient.emit("jackpotPools", jackpotPools);
};

export const notifyJackpotWinner = (req, res) => {
    const isValidParams = validateParams(req.body);

    if (isValidParams) {
        sendAllUserExceptExclusionSite(req.body);
        res.send({ received: true });
    } else {
        res.send({ error: true });
    }
};
