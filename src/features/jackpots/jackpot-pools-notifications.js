import mongoose from "mongoose";

const schema = new mongoose.Schema({
    gameId: { type: Number },
    prize: { type: String },
    amount: { type: Number, default: 0 },
    jackpotConfigId: { type: String },
});

export default mongoose.model("jackpot_pools_notification", schema);
