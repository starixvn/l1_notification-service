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
        apiUrl: "http://l2_game_api_prod:5000",
        authUrl: "http://l2_auth_api_prod:5000",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        placeBetTimeout: 4500,
        requestTimeout: 10000, // 10s
        enabledApiLogs: true,
    },
    authenticateSettings: {
        audiences: ["api", "admin-api", "game-services"],
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:%21%23x97%25uYZv%2A%5E%25%3E%7C%2Aqg%40E7FHi%3F9l%7B9r%3CK@10.99.99.53:39210,10.99.99.54:39210,10.99.99.188:39210,10.99.99.187:39210/?replicaSet=L2_SabaMain&appName=notificationservice",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "http://2b5b82bf699543ddb296364568bc30be@10.2.189.50:9009/52",
        logIdentifier: "notification-service",
        env: "PROD",
    },
    userService: {
        url: "http://l2_user_service_prod:5000/",
    },
    roundWatcherService: {
        url: "http://l2_round_watcher_service_prod:5000/",
    },
    metrics: {
        enable: true,
        secretKey: "30d15293-c7de-4c77-9293-b85d6c5bfe1a",
    },
    enableMsgpackParser: true,
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
        baseUrl: "http://admin:17NyV+Weaatx_86gBSKc@10.2.189.50:9091",
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
    gameManagementApiSettings: {
        baseUrl: "http://l2-game-management-service-prod-service:5000",
    },
    natsOptions: {
        connectionOptions: {
            servers: "nats://vn-sc-nats-prod.nebula.prod",
        },
        consumerOptions: {
            jackpotPools: {
                stream: "vg_prod_slots_jackpot_pools",
                filterSubject: "vg-prod-jackpot-pools.>",
            },
            jackpotWinners: {
                stream: "vg_prod_slots_jackpot_winners",
                filterSubject: "vg-prod-jackpot-winners.>",
            },
        },
    },
};
