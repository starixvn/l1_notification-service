import mongoose from "mongoose";

const schema = new mongoose.Schema({
    gameId: { type: Number, required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    status: { type: String, required: true },
});

export default mongoose.model("promotions", schema);
