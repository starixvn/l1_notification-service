import { AckPolicy, DeliverPolicy, jetstreamManager } from "@nats-io/jetstream";
import { connect } from "@nats-io/transport-node";
import { logger } from "sc-common";
import { updateJackpotPools } from "./features/jackpots/jackpot-repository";
/**
 * @type {import("@nats-io/transport-node").NatsConnection}
 */
let nats;
/**
 * @type {import("@nats-io/jetstream").JetStreamManager}
 */
let jsm;

export async function initNats(natsOptions) {
    nats = await connect(natsOptions.connectionOptions);
    jsm = await jetstreamManager(nats);

    await consumeRunningPools(natsOptions);
}

export async function consumeRunningPools(natsOptions) {
    const { jackpotPools } = natsOptions.consumerOptions;

    await jsm.consumers.add(jackpotPools.stream, {
        name: "notification-service-consumer",
        ack_policy: AckPolicy.Explicit,
        deliver_policy: DeliverPolicy.All,
        filter_subject: jackpotPools.filterSubject,
    });

    const js = jsm.jetstream();
    const consumer = await js.consumers.get("vg_local_slots_jackpot_pools", "notification-service-consumer");

    const messages = await consumer.consume({
        max_messages: 1,
    });

    for await (const msg of messages) {
        try {
            const data = JSON.parse(msg.string());
            const gameId = parseInt(msg.subject.split(".")[1].split("-")[0]);
            await updateJackpotPools(gameId, data);
            msg.ack();
        } catch (error) {
            logger.logError(error);
            msg.nak();
        }
    }
}
