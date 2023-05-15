import mongoose from "mongoose";

export const schema = new mongoose.Schema({
    pool: { type: Number, required: true },
    initAmount: { type: Number, required: true },
    amount: { type: Number, default: 0 },
    winningRatio: { type: Number },
    winnerName: { type: String },
    winnerId: { type: Number },
    byBots: { type: Number, default: 0 },
    byMembers: { type: Number, default: 0 },
    createdAt: { type: Number, required: true },
    createdTime: { type: Date, required: true },
    hitAt: { type: Number },
    hitTime: { type: Date },
    byPlayers: { type: Number, default: 0 },
});

export default function (game) {
    return game.gameId === 29
        ? mongoose.models["jackpot"] ?? mongoose.model("jackpot", schema)
        : mongoose.models[`${game.gameName}_jackpot`] ?? mongoose.model(game.gameName);
}
