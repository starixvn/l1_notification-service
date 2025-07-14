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

        // Validate required fields
        if (!progressData.playerId) {
            return res.status(400).send({ error: "playerId is required" });
        }

        // Emit to socket adapter to handle targeting specific client
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

    // Find and emit to specific client by playerId (session.playerId)
    const targetPlayerId = playerId;

    // This will be handled by the socket adapter registration
    return { targetPlayerId, notificationData };
};
