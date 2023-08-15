import axios from "axios";
import appConfigs from "../../app-configs";
import { logger } from "sc-common";
import * as jackpotHandler from "../jackpots/jackpot-handler";
import * as lobbyRepository from "../lobby/lobby-repository";
import * as socketClientHandler from "../socket-clients/socket-client-handler";

const getRoundTimerLatestData = async (socketClient) => {
    try {
        const session = socketClientHandler.getClientSession(socketClient.id);
        const currentTime = new Date(new Date().toUTCString());
        const latestData = (await axios.get(`${appConfigs.roundWatcherService.url}api/lastResult`)).data;
        const enabledGames = getEnabledGames(latestData, session, currentTime);

        socketClient.emit("latestRoundTimer", enabledGames);
    } catch (err) {
        logger.logError(err);
    }
};

const getEnabledGames = (latestData, session, currentTime) => {
    return Object.keys(latestData)
        .filter((game) => isGameOfferedRoundTimer(parseInt(game), session))
        .reduce((roundTimer, game) => {
            const timeFromStart = (currentTime - new Date(latestData[game].time)) / 1000;
            roundTimer[game] = { ...latestData[game], timeFromStart };
            return roundTimer;
        }, {});
};

const handleRoundTimerWatcherData = async (req, res) => {
    try {
        const roundTimer = req.body;
        await sendAllUserExpectRoundTimer(roundTimer);

        res.send({ received: true });
    } catch (err) {
        logger.logError(err);
    }
};

const sendAllUserExpectRoundTimer = async (payload) => {
    const clients = socketClientHandler.getClients();
    Object.values(clients).forEach((client) => sendUserWhenOffered(client, payload));
};

const sendUserWhenOffered = async (client, payload) => {
    const session = client.session;
    const gameId = parseInt(Object.keys(payload)[0]);
    if (session && isGameOfferedRoundTimer(gameId, session)) {
        client.socketClient.emit("roundTimer", payload);
    }
};

const getRoundTimerGameOffered = async (session) => {
    const { currencyGroupId } = session;
    const [fetchedGamesOffered, fetchedLobby] = await Promise.all([
        jackpotHandler.getOfferedGames(session),
        lobbyRepository.getLobbyConfigs(currencyGroupId),
    ]);

    const gamesOffered = fetchedGamesOffered;
    const roundTimerGame = fetchedLobby?.roundTimerGame?.games?.map((game) => game.id) || [];
    return gamesOffered.filter((id) => roundTimerGame.includes(id));
};

const isGameOfferedRoundTimer = (gameId, session) => {
    const { roundTimerGameOffered } = session;
    return roundTimerGameOffered.includes(gameId);
};

export { handleRoundTimerWatcherData, getRoundTimerLatestData, getRoundTimerGameOffered };
