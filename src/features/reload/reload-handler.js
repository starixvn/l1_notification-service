import { mongoEmitter } from "../../adapters/socket-adapter";
import emitEvents from "../../constants/emit-events";

export const broadcastReload = (req, res) => {
    mongoEmitter.emit(emitEvents.reload, true);
    res.send({ received: true });
};
