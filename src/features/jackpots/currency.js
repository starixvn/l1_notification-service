import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    name: { type: String },
    code: { type: String },
    multiplier: { type: Number },
    enabled: { type: Boolean },
    isTest: { type: Boolean },
    partnerId: { type: String },
    groupId: { type: mongoose.Types.ObjectId },
    operatorId: { type: String },
});

export default mongoose.model("currencies", Schema);
