import mongoose from "mongoose";
import Currency from "./currency";
import CurrencyGroup from "./currency-group";
import CurrencyGroupGame from "./currency-group-game";

const getCurrency = async (currencyName, partnerId) => {
    return Currency.findOne({ name: currencyName, partnerId: partnerId }).lean().exec();
};

const getCurrencyGroup = async (groupId) => {
    return CurrencyGroup.findById(new mongoose.Types.ObjectId(groupId)).lean().exec();
};

const getOfferedGames = async (groupId) => {
    return CurrencyGroupGame.find({ groupId: new mongoose.Types.ObjectId(groupId), enabled: true }, "gameId gameName stakeLevels")
        .lean()
        .exec();
};

export { getCurrency, getCurrencyGroup, getOfferedGames };

