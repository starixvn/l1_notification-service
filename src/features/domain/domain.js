import mongoose from "mongoose";

const schema = new mongoose.Schema({
    value: { type: String, required: true },
});

export default mongoose.model("domains", schema);
