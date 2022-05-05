import mongoose from "mongoose";

const schema = new mongoose.Schema({
    message: { type: String, required: true },
    displayKind: { type: Number, required: true },
    gameName: { type: String },
    messages: { type: Array },
});

export default mongoose.model("notifications", schema);
