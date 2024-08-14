import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    groupId: { type: mongoose.Types.ObjectId, required: true },
    gameId: { type: Number, required: true },
    gameName: { type: String },
    enabled: { type: Boolean },
    minBet: { type: Number },
    maxBet: { type: Number },
    maxBetPerChoices: { type: Object },
    chips: { type: Array },
    stakeLevels: { type: Array },
    betLevels: { type: Array },
});

export default mongoose.model("currency_group_games", Schema);
