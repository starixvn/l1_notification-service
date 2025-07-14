import { mongoEmitter } from "../../adapters/socket-adapter";
import emitEvents from "../../constants/emit-events";
import { logger } from "sc-common";

/**
 * HTTP endpoint to receive TO progress data and notify specific player
 * @param {Express.Request} req - Request object containing TO progress data
 * @param {Express.Response} res - Response object
 */
export const notifyPromotionProgress = (req, res) => {
    try {
        const progressData = req.body;

        if (!progressData.playerId) {
            return res.status(400).send({ error: "playerId is required" });
        }

        mongoEmitter.serverSideEmit(emitEvents.promotionProgress, progressData);

        res.send({ received: true });
    } catch (error) {
        logger.logError(error);
        res.status(500).send({ error: "Internal server error" });
    }
};

/**
 * Handle promotion progress event from socket adapter
 * This function targets the specific player socket and emits the notification
 * @param {Object} progressData - The progress data from HTTP request
 */
export const handlePromotionProgressEvent = (progressData) => {
    const { playerId, operatorId, siteName, ...notificationData } = progressData;

    const targetPlayerId = playerId;

    return { targetPlayerId, notificationData };
};
