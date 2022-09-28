import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    type: { type: String, required: true },
    partnerId: { type: String, required: true },
    value: { type: Object },
    operatorId: { type: String },
});

export default mongoose.model("partner_config", Schema);
