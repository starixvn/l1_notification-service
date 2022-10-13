import appConfigs from "../../app-configs";
import * as SocketServerHandler from "../socket-server/socket-server-handler";
import * as notificationRepository from "../game-notifications/game-notification-repository";
import * as promotionsRepository from "../../features/promotions/promotions-repository";
import { getEffectivePromotions } from "../../features/promotions/promotion-helper";
import { getEffectivePromotionNotifications } from "./promotion-notification-helper";

const notificationType = 3;
const minutesToMillisecond = 60 * 1000;
const delayTime = appConfigs.promotionNotificationDurations.delayTimeInMinutes * minutesToMillisecond;
let promotionNotificationTimeout = 0;

const setPromotionNotifications = () => {
    promotionNotificationTimeout = setTimeout(function repeat() {
        proceed();
    }, delayTime);
};

const proceed = async () => {
    console.log("Get promotion notification at ", new Date(Date.now()));
    await getPromotionNotifications();
    clearTimeout(promotionNotificationTimeout);
    setPromotionNotifications();
};

const getPromotionNotifications = async (socketClient) => {
    const notifications = await notificationRepository.getPromotionNotification(notificationType);
    const promotions = await promotionsRepository.getPromotions();
    const effectivePromotions = getEffectivePromotions(promotions);
    const effectivePromotionNotifications = getEffectivePromotionNotifications(notifications, effectivePromotions);
    effectivePromotionNotifications.sort((a, b) => b.startTime - a.startTime);
    !!socketClient
        ? socketClient.emit("promotionNotifications", effectivePromotionNotifications)
        : proceedNotificationMessage(effectivePromotionNotifications);
};

const proceedNotificationMessage = (notifications) => SocketServerHandler.broadcastAll("promotionNotifications", notifications);

export { setPromotionNotifications, proceed, proceedNotificationMessage, getPromotionNotifications };
