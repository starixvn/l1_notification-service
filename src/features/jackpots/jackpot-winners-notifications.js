import mongoose from "mongoose";

const schema = new mongoose.Schema({
    gameId: { type: Number, required: true },
    prize: { type: String, required: true },
    amount: { type: Number, default: 0 },
    winnerName: { type: String },
    hitTime: { type: Date },

    exchangeRateId: { type: Number },
    jackpotConfigId: { type: String },
});

export default mongoose.model("jackpot_winners_notification", schema);
