import axios from "axios";
import { broadcastAll } from "../socket-server/socket-server-handler";
import appConfigs from "../../app-configs";
import { logger } from "sc-common";
import * as jackpotHandler from "../jackpots/jackpot-handler";
import * as lobbyRepository from "../lobby/lobby-repository";
import * as partnerConfigRepository from "../jackpots/partner-config-repository";

let gamesOffered = [];
let roundTimerGame = {};
let sessionClient = {};
let siteExclusions = {};

const getRoundTimerLatestData = async (socketClient) => {
    try {
        const currentTime = new Date(new Date().toUTCString());
        const latestData = (await axios.get(`${appConfigs.roundWatcherService.url}api/lastResult`)).data;

        const games = Object.keys(latestData);
        for await (const game of games) {
            const enableRoundTimer = await isGameOfferedRoundTimer(parseInt(game));
            if (enableRoundTimer) {
                latestData[game].timeFromStart = (currentTime - new Date(latestData[game].time)) / 1000;
            } else {
                delete latestData[game];
            }
        }

        socketClient.emit("latestRoundTimer", latestData);
    } catch (err) {
        logger.logError(err);
    }
};

const handleRoundTimerWatcherData = async (req, res) => {
    try {
        const miniCounter = req.body;
        const gameIds = Object.keys(miniCounter);
        const isBroadCastRoundTimer = await isGameOfferedRoundTimer(parseInt(gameIds[0]));
        isBroadCastRoundTimer && broadcastAll("roundTimer", miniCounter);

        res.send({ received: true });
    } catch (err) {
        logger.logError(err);
    }
};

const initDataBySession = async (session) => {
    sessionClient = session;
    const [fetchedSiteExclusions, fetchedGamesOffered, fetchedLobby] = await Promise.all([
        partnerConfigRepository.getSiteExclusions(),
        jackpotHandler.getOfferedGames(session),
        lobbyRepository.getLobbyConfigs(session),
    ]);

    siteExclusions = fetchedSiteExclusions;
    gamesOffered = fetchedGamesOffered;
    if (fetchedLobby) {
        roundTimerGame = fetchedLobby.roundTimerGame;
    }
};

const isGameOfferedRoundTimer = async (gameId) => {
    if (!sessionClient) {
        return false;
    }

    const isExcludeOnGame = jackpotHandler.isExcludeOnGame(sessionClient, gameId, siteExclusions);

    if (isExcludeOnGame) {
        return false;
    }

    const isOffered = gamesOffered.includes(gameId);
    const enableRoundTimer = roundTimerGame?.games?.some((game) => game.id === gameId);

    return isOffered && enableRoundTimer;
};

export { handleRoundTimerWatcherData, getRoundTimerLatestData, initDataBySession };
