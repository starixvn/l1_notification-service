import Promotions from "./promotions";

const getPromotions = async () => {
    const promotionsFilter = {
        //startDateTime: { $lte: new Date(Date.now()) },
        //endDateTime: { $gte: new Date(Date.now()) },
        status: "enabled",
    };
    return Promotions.find(promotionsFilter).lean().exec();
};

export { getPromotions };
