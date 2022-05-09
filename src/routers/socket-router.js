import * as JackpotHandler from "../features/jackpots/jackpot-handler";
import { authenticate } from "../middleware/authorize-handler";
import { findNotifications } from "../features/game-notifications";
import * as socketClientHandler from "../features/socket-clients/socket-client-handler";

/**
 * @param {Socket} socketClient
 */
const init = (socketServer) => {
    socketServer.of("/").use(async (socket, next) => {
        await authenticate(socket, next);
    });

    socketServer.of(`/`).on("connection", (socketClient) => {
        initSocketClient(socketClient);
    });
};

const emitMessageToClient = (client) => (event) => (message) => client.emit(event, message);

const initSocketClient = (socketClient) => {
    const gameNotificationEvent = "gameNotification";
    const emitMessage = emitMessageToClient(socketClient);

    socketClient.on("disconnect", () => socketClientHandler.disconnectUser(socketClient.id));
    socketClient.on(gameNotificationEvent, (payload) => findNotifications(emitMessage(gameNotificationEvent))(socketClient, payload));
};

export { init };
