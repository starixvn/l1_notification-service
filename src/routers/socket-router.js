import { Server, Socket } from "socket.io";
import { findNotifications } from "../features/game-notifications";
import * as JackpotHandler from "../features/jackpots/jackpot-handler";
import * as promotionNotificationHandler from "../features/promotion-notifications/promotion-notification-handler";
import * as promotionsHandler from "../features/promotions/promotions-handler";
import { authenticate } from "../middleware/authorize-handler";
import { getRoundTimerLatestData } from "../features/round-timer/round-timer-handler";

/** @param {Server} socketServer */
const init = (socketServer) => {
    /** @param {Socket} socket */
    socketServer.of("/").use(async (socket, next) => {
        await authenticate(socket, next);
    });

    socketServer.of(`/`).on(
        "connection",
        /** @param {Socket} socket */
        (socket) => {
            initSocketClient(socket);
            console.log(`${socket.id} connected`);
        }
    );
};

const emitMessageToClient = (client) => (event) => (message) => client.emit(event, message);

/** @param {Socket} socketClient */
const initSocketClient = (socketClient) => {
    const gameNotificationEvent = "gameNotification";
    const promotionNotificationsEvent = "promotionNotifications";
    const promotionsEvent = "promotions";
    const emitMessage = emitMessageToClient(socketClient);

    socketClient.on("getWinners", (payload) => JackpotHandler.getWinners(socketClient, payload));
    socketClient.on("getPools", (payload) => JackpotHandler.getPools(socketClient, payload));
    socketClient.on("disconnect", () => socketClient.disconnect(true));
    socketClient.on("getRoundTimer", () => getRoundTimerLatestData(socketClient));
    socketClient.on(gameNotificationEvent, (payload) => findNotifications(emitMessage(gameNotificationEvent))(socketClient, payload));
    socketClient.on(promotionNotificationsEvent, () => promotionNotificationHandler.getPromotionNotifications(socketClient));
    socketClient.on(promotionsEvent, () => promotionsHandler.getPromotions(socketClient));
};

export { init };

