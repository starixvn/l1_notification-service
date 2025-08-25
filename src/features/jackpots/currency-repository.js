import mongoose from "mongoose";
import { Currencies, CurrencyGroupGames, CurrencyGroups } from "sc-base-database";

const getCurrency = async (currencyName, partnerId) => {
    return Currencies.findOne({ name: currencyName, partnerId: partnerId }).lean().exec();
};

const getCurrencyGroup = async (groupId) => {
    return CurrencyGroups.findById(new mongoose.Types.ObjectId(groupId)).lean().exec();
};

const getOfferedGames = async (groupId) => {
    return CurrencyGroupGames.find(
        { groupId: new mongoose.Types.ObjectId(groupId), enabled: true },
        "gameId gameName stakeLevels betLevels"
    )
        .lean()
        .exec();
};

export { getCurrency, getCurrencyGroup, getOfferedGames };
