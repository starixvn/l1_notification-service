import mongoose from "mongoose";

const Schema = new mongoose.Schema({
    name: { type: String },
    enabled: { type: Boolean },
    partnerId: { type: String },
    operatorId: { type: String },
});

export default mongoose.model("currency_groups", Schema);
