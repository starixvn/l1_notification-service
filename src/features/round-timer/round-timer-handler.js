import axios from "axios";
import { broadcastAll } from "../socket-server/socket-server-handler";
import appConfigs from "../../app-configs";
import { logger } from "sc-common";
import * as jackpotHandler from "../jackpots/jackpot-handler";
import * as lobbyRepository from "../lobby/lobby-repository";
import * as partnerConfigRepository from "../jackpots/partner-config-repository";

let gamesOffered = [];
let roundTimerGame = {};
let siteNameExclusion = "";
let partnerSiteExclusions = {};

const getRoundTimerLatestData = async (socketClient) => {
    try {
        const currentTime = new Date(new Date().toUTCString());
        const latestData = (await axios.get(`${appConfigs.roundWatcherService.url}api/lastResult`)).data;

        const enabledGames = Object.keys(latestData)
        .filter((game) => isGameOfferedRoundTimer(parseInt(game)))
        .reduce((roundTimer, game) => {
            const timeFromStart = (currentTime - new Date(latestData[game].time)) / 1000;
            roundTimer[game] = { ...latestData[game], timeFromStart };
            return roundTimer;
        }, {});   

        socketClient.emit("latestRoundTimer", enabledGames);
    } catch (err) {
        logger.logError(err);
    }
};

const handleRoundTimerWatcherData = async (req, res) => {
    try {
        const roundTimer = req.body;
        const gameId = parseInt(Object.keys(roundTimer)[0]);
        const isBroadCastRoundTimer = await isGameOfferedRoundTimer(gameId);
        isBroadCastRoundTimer && broadcastAll("roundTimer", roundTimer);

        res.send({ received: true });
    } catch (err) {
        logger.logError(err);
    }
};

const initDataBySession = async (session) => {
    const { siteName, partnerId, currencyGroupId } = session;
   
    siteNameExclusion = siteName;
    const [fetchedSiteExclusions, fetchedGamesOffered, fetchedLobby] = await Promise.all([
        partnerConfigRepository.getSiteExclusionByPartner(partnerId),
        jackpotHandler.getOfferedGames(session),
        lobbyRepository.getLobbyConfigs(currencyGroupId),
    ]);

    partnerSiteExclusions = fetchedSiteExclusions;
    gamesOffered = fetchedGamesOffered;
    roundTimerGame = fetchedLobby?.roundTimerGame;
};

const isGameOfferedRoundTimer = (gameId) => {

    const excludedSites = partnerSiteExclusions?.value[gameId] || [];
    const isExcludeOnGame = excludedSites.some((site) => site?.toLowerCase() === siteNameExclusion?.toLowerCase());

    const isOffered = gamesOffered.includes(gameId);
    const enableRoundTimer = roundTimerGame?.games?.some((game) => game.id === gameId);

    return isOffered && enableRoundTimer && !isExcludeOnGame;
};

export { handleRoundTimerWatcherData, getRoundTimerLatestData, initDataBySession };
