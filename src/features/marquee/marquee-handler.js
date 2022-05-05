import appConfigs from "../../app-configs";
import Notifications from "../../features/game-notifications/notifications";
import * as SocketServerHandler from "../socket-server/socket-server-handler";

const notificationType = 1;
const minuteToMillisecond = 60 * 1000;
const timeToDisplayMessage = appConfigs.marqueeDurations.timeToDisplayMessageInMinute * minuteToMillisecond;
let intervalTime = appConfigs.marqueeDurations.intervalTimeInMinute * minuteToMillisecond;
let marqueeInterval = 0;

const setMarquee = () => {
    marqueeInterval = setInterval(proceed, intervalTime);
};

const proceed = async () => {
    const notifications = await Notifications.find({ displayKind: notificationType }, "messages").lean().exec();
    notifications.forEach((notification, index) => {
        setTimeout(() => proceedMessage(notification.messages), index * timeToDisplayMessage);
    });

    clearInterval(marqueeInterval);
    intervalTime = notifications.length * timeToDisplayMessage;
    setMarquee();
};

const proceedMessage = async (message) => SocketServerHandler.broadcastAll("marquee", message);

export { setMarquee, proceed, proceedMessage };
