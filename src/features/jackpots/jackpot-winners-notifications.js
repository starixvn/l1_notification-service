import mongoose from "mongoose";

const schema = new mongoose.Schema({
    gameId: { type: Number, required: true },
    prize: { type: String, required: true },
    amount: { type: Number, default: 0 },
    winnerName: { type: String },
    hitTime: { type: Date },

    rate: { type: Number },
    exchangeRateId: { type: Number },
    operatorId: { type: String },
    jackpotConfigId: { type: String },
});

export default mongoose.model("jackpot_winners_notification", schema);
