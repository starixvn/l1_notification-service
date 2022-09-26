import mongoose from "mongoose";

const schema = new mongoose.Schema({
    message: { type: String, required: true },
    displayKind: { type: Number, required: true },
    gameName: { type: String },
    messages: { type: Array },
    title: { type: Array },
    startTime: { type: Date },
    endTime: { type: Date },
    enabled: { type: Boolean },
});

export default mongoose.model("notifications", schema);
