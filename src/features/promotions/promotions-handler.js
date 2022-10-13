import appConfigs from "../../app-configs";
import * as SocketServerHandler from "../socket-server/socket-server-handler";
import * as promotionsRepository from "./promotions-repository";
import { getEffectivePromotions } from "./promotion-helper";

const minutesToMillisecond = 60 * 1000;
const delayTime = appConfigs.promotionsDurations.delayTimeInMinutes * minutesToMillisecond;
let promotionTimeout = 0;
const setPromotions = () => {
    promotionTimeout = setTimeout(function repeat() {
        proceed();
    }, delayTime);
};

const proceed = async () => {
    console.log("Get promotions at ", new Date(Date.now()));
    await getPromotions();
    clearTimeout(promotionTimeout);
    setPromotions();
};

const getPromotions = async () => {
    const promotions = await promotionsRepository.getPromotions();
    const effectivePromotions = getEffectivePromotions(promotions);
    proceedPromotionsMessage(effectivePromotions);
};

const proceedPromotionsMessage = (promotions) => SocketServerHandler.broadcastAll("promotions", promotions);

export { setPromotions, proceed, proceedPromotionsMessage, getPromotions };
