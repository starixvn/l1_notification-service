import { hostname } from "os";

export default {
    hostingPort: 5000,
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
    },
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://l2-game-api-local1-service:5000",
        authUrl: "http://l2-auth-api-local1-service:5000",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        requestTimeout: 10000,
        placeBetTimeout: 4500,
        enabledApiLogs: true,
    },
    authenticateSettings: {
        audiences: ["api", "admin-api", "game-services"],
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39201,10.10.50.13:39201,10.10.50.14:39201/?replicaSet=L2pLocal&appName=notificationservice",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://acb36eb835d948d68c1aad9873754d51@sentry.lumigame.com/27",
        logIdentifier: "notification-service",
        env: "LOCAL_1",
    },
    userService: {
        url: "http://l2-user-service-local1-service:5000/",
    },
    roundWatcherService: {
        url: "http://l2-round-watcher-service-local1-service:5000/",
    },
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: false,
    marqueeDurations: {
        intervalTimeInMinute: 0.5,
        timeToDisplayMessageInMinute: 0.5,
    },
    promotionsDurations: {
        delayTimeInMinutes: 1,
    },
    promotionNotificationDurations: {
        delayTimeInMinutes: 1,
    },
    promPushGatewayConfigs: {
        baseUrl: "http://admin:17NyV+Weaatx_86gBSKc@10.10.50.69:9091",
        options: {
            timeout: 5_000,
            agentOptions: {
                keepAlive: true,
                keepAliveMsecs: 10_000,
                maxSockets: 10,
            },
        },
        parameters: { jobName: "notification-service", groupings: { instance: hostname() } },
    },
    natsOptions: {
        connectionOptions: {
            servers: "nats://10.10.50.122:4222",
        },
        consumerOptions: {
            jackpotPools: {
                stream: "vg_local1_slots_jackpot_pools",
                filterSubject: "vg-local1-jackpot-pools.>",
            },
            jackpotWinners: {
                stream: "vg_local1_slots_jackpot_winners",
                filterSubject: "vg-local1-jackpot-winners.>",
            },
        },
    },
};
