import { hostname } from "os";

export default {
    hostingPort: 5000,
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://l2_game_api_local:5000",
        authUrl: "http://l2_auth_api_local:5000",
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
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39200,10.10.50.13:39200,10.10.50.14:39200/?replicaSet=L2Local&appName=notificationservice",
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
        env: "LOCAL",
    },
    userService: {
        url: "http://l2_user_service_local:5000/",
    },
    roundWatcherService: {
        url: "http://l2_round_watcher_service_local:5000/",
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
    systemType: "VG2",
};
