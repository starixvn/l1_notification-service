import { AckPolicy, DeliverPolicy, jetstreamManager } from "@nats-io/jetstream";
import { connect } from "@nats-io/transport-node";

/**
 * @type {import("@nats-io/transport-node").NatsConnection}
 */
let nats;
/**
 * @type {import("@nats-io/jetstream").JetStreamManager}
 */
let jsm;

export async function initNats(natsOptions) {
    nats = await connect({ servers: "nats://10.10.50.122:4222" });
    jsm = await jetstreamManager(nats);

    await jsm.consumers.add("vg_local_slots_jackpot_pools", {
        name: "notification-service-consumer",
        ack_policy: AckPolicy.Explicit,
        deliver_policy: DeliverPolicy.All,
        filter_subject: "jackpot-pools.>",
    });
    await consumeRunningPools();
}

export async function consumeRunningPools() {
    const js = jsm.jetstream();
    const consumer = await js.consumers.get("vg_local_slots_jackpot_pools", "notification-service-consumer");

    const messages = await consumer.consume({
        max_messages: 1,
        expires: 100000,
    });

    for await (const msg of messages) {
        try {
            const data = JSON.parse(msg.string());
            console.log("Processing message:", msg.subject, data[0]);
            msg.ack();
        } catch (error) {
            console.error("Error processing message:", error);
            msg.nak();
        }
    }
}
