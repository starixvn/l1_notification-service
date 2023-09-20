import axios from "axios";
import { logger } from "sc-common";
import { mongoEmitter } from "../../adapters/socket-adapter";
import appConfigs from "../../app-configs";
import emitEvents from "../../constants/emit-events";
import * as jackpotHandler from "../jackpots/jackpot-handler";
import * as lobbyRepository from "../lobby/lobby-repository";
import { getLocalSockets } from "../socket-server/socket-server-handler";

const getRoundTimerLatestData = async (socket) => {
    try {
        const { session } = socket.data;
        const currentTime = new Date(new Date().toUTCString());
        const latestData = (await axios.get(`${appConfigs.roundWatcherService.url}api/lastResult`)).data;
        const enabledGames = getEnabledGames(latestData, session, currentTime);
        socket.emit("latestRoundTimer", enabledGames);
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
        mongoEmitter.serverSideEmit(emitEvents.roundTimer, roundTimer);

        res.send({ received: true });
    } catch (err) {
        logger.logError(err);
    }
};

const sendAllUserExpectRoundTimer = (payload) => {
    const sockets = getLocalSockets();
    sockets.forEach((socket) => sendUserWhenOffered(socket, payload));
};

const sendUserWhenOffered = (socket, payload) => {
    const session = socket.data.session;
    const gameId = parseInt(Object.keys(payload)[0]);
    if (session && isGameOfferedRoundTimer(gameId, session)) {
        socket.emit("roundTimer", payload);
    }
};

const getRoundTimerGameOffered = async (session) => {
    const { currencyGroupId } = session;

    const [fetchedGamesOffered, fetchedLobby] = await Promise.all([
        jackpotHandler.getOfferedGames(session),
        lobbyRepository.getLobbyConfigs(currencyGroupId),
    ]);

    const gamesOffered = fetchedGamesOffered.map((game) => game.gameId);
    const roundTimerGame = fetchedLobby?.roundTimerGame?.games?.map((game) => game.id) || [];
    return gamesOffered.filter((id) => roundTimerGame.includes(id));
};

const isGameOfferedRoundTimer = (gameId, session) => {
    const { roundTimerGameOffered } = session;
    return roundTimerGameOffered.includes(gameId);
};

export { getRoundTimerGameOffered, getRoundTimerLatestData, handleRoundTimerWatcherData, sendAllUserExpectRoundTimer };

