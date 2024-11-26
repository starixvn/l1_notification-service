import appConfigs from "../../app-configs";
import Notifications from "../../features/game-notifications/notifications";
import * as SocketServerHandler from "../socket-server/socket-server-handler";

const notificationType = 1;
const minuteToMillisecond = 60 * 1000;
const timeToDisplayMessage = appConfigs.marqueeDurations.timeToDisplayMessageInMinute * minuteToMillisecond;
const defaultMarqueeTimeout = appConfigs.marqueeDurations.timeOutInMinute * minuteToMillisecond;
let setMarqueeDelay = defaultMarqueeTimeout;
let marqueeTimeout = 0;

const setMarquee = () => {
    marqueeTimeout = setTimeout(proceed, setMarqueeDelay);
};

const proceed = async () => {
    const notifications = await Notifications.find({ displayKind: notificationType }, "messages").lean().exec();
    notifications.forEach((notification, index) => {
        setTimeout(() => proceedMessage(notification.messages), index * timeToDisplayMessage);
    });

    clearTimeout(marqueeTimeout);
    setMarqueeDelay = notifications.length ? notifications.length * timeToDisplayMessage : defaultMarqueeTimeout;

    console.log(`setMarqueeDelay ${setMarqueeDelay / 1000}s`);
    setMarquee();
};

const proceedMessage = async (message) => SocketServerHandler.broadcastLocal("marquee", message);

export { proceed, proceedMessage, setMarquee };