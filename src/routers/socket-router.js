import { findNotifications } from "../features/game-notifications";
import * as JackpotHandler from "../features/jackpots/jackpot-handler";
import * as promotionNotificationHandler from "../features/promotion-notifications/promotion-notification-handler";
import * as promotionsHandler from "../features/promotions/promotions-handler";
import * as socketClientHandler from "../features/socket-clients/socket-client-handler";
import { authenticate } from "../middleware/authorize-handler";
import { getRoundTimerLatestData } from "../features/round-timer/round-timer-handler";

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
    const promotionNotificationsEvent = "promotionNotifications";
    const promotionsEvent = "promotions";
    const emitMessage = emitMessageToClient(socketClient);

    socketClient.on("getWinners", (payload) => JackpotHandler.getWinners(socketClient, payload));
    socketClient.on("getPools", (payload) => JackpotHandler.getPools(socketClient, payload));
    socketClient.on("disconnect", () => socketClientHandler.disconnectUser(socketClient.id));
    socketClient.on("getRoundTimer", () => getRoundTimerLatestData(socketClient));
    socketClient.on(gameNotificationEvent, (payload) => findNotifications(emitMessage(gameNotificationEvent))(socketClient, payload));
    socketClient.on(promotionNotificationsEvent, () => promotionNotificationHandler.getPromotionNotifications(socketClient));
    socketClient.on(promotionsEvent, () => promotionsHandler.getPromotions(socketClient));
};

export { init };

