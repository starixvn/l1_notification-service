import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: { type: String, required: true },
    currencyGroupIds: { type: Array, required: true },
    roundTimerGame: { type: Array },
});

export default mongoose.model("lobbies", schema);