import { curry } from "ramda";
import { gameNotifications } from "sc-base-database";
import Notifications from "./notifications";

export const find = curry((projection, callback, filter) => gameNotifications.find(filter, projection, callback));
export const findWithProjection = find({ _id: false, __v: false, __archive: false });

export const getPromotionNotification = async (notificationType) => {
    const notificationFilter = {
        displayKind: notificationType,
        startTime: { $lte: new Date(Date.now()) },
        endTime: { $gte: new Date(Date.now()) },
        enabled: true,
    };
    return Notifications.find(notificationFilter).lean().exec();
};
