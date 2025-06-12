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
        apiUrl: "http://sp_hd_game_api_prod:5000",
        authUrl: "http://sp_hd_auth_api_prod:5000",
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
        url: "mongodb://hotdog_backend:%3FD%60XWko0ZI99Y2PQ%5Eu%2E9LV%2BYv%2Emj6rhH@10.99.99.53:39510,10.99.99.54:39510,10.99.99.188:39510,10.99.99.187:39510/?replicaSet=SP-Main&appName=notificationservice",
        options: {
            dbName: "hotdog_minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "http://f4980024f65945179a125e7ce17286d0@10.2.189.50:9009/178",
        logIdentifier: "notification-service",
        env: "PROD",
    },
    userService: {
        url: "http://sp_hd_user_service_prod:5000/",
    },
    roundWatcherService: {
        url: "http://sp_hd_round_watcher_service_prod:5000/",
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
};
