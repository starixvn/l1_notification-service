import mongoose from "mongoose";

const schema = new mongoose.Schema({
    exId: { type: Number, required: true },
    time: { type: Date, required: true },
    source: { type: String, required: true },
    code: { type: Map, of: mongoose.Types.Decimal128, required: true },
});

export default mongoose.model("exchange_rate", schema);
