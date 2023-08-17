import { emitEvents, mongoEmitter } from "../../adapters/socket-adapter";

export const broadcastReload = (req, res) => {
    mongoEmitter.emit(emitEvents.reload, req.body);
    res.send({ received: true });
};
