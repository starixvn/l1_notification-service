import { hostname } from "os";

export default {
    hostingPort: 8004,
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
    },
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://l1-api1.lumigame.com",
        authUrl: "https://l1-auth1.lumigame.com/",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: false,
        requestTimeout: 10000,
        placeBetTimeout: 4500,
        enableApiLogs: true,
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39101,10.10.50.13:39101,10.10.50.14:39101/?replicaSet=L1pLocal&appName=notificationservice",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://13f39b8359404ed5aec23655e64ccf78@sentry.lumigame.com/2",
        logIdentifier: "notification-service",
        env: "DEV",
    },
    userService: {
        url: "https://l1-proxy1.lumigame.com/user/",
    },
    roundWatcherService: {
        url: "http://localhost:5000/",
    },
    authenticateSettings: {
        audiences: ["api", "admin-api", "game-services"],
    },
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: false,
    marqueeDurations: {
        intervalTimeInMinute: 10,
        timeToDisplayMessageInMinute: 2,
    },
    promotionsDurations: {
        delayTimeInMinutes: 1,
    },
    promotionNotificationDurations: {
        delayTimeInMinutes: 1,
    },
    promPushGatewayConfigs: {
        baseUrl: "http://10.10.50.14:9091",
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
    oidc: {
        clientId: "api",
        clientSecret: "api@20luminet&",
        issuer: "http://l2-auth-api-local-service:5000",
        requestTimeout: 10000,
        useAuthenticate: true,
    },
    gameManagementApiSettings: {
        baseUrl: "http://l2-game-management-service-local-service:5000",
    },
    natsOptions: {
        connectionOptions: {
            servers: ["nats://10.10.50.122:4222"],
        },
        consumerOptions: {
            jackpotPools: {
                stream: "vg_local_slots_jackpot_pools",
                filterSubject: "jackpot-pools.>",
            },
            jackpotWinners: {
                stream: "vg_local_slots_jackpot_winners",
                filterSubject: "jackpot-winners.>",
            },
        },
    },
};
