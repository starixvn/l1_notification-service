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
        apiUrl: "http://l1_game_api_local_3:5000",
        authUrl: "http://l1_auth_api_local_3:5000",
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
        url: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39103,10.10.50.13:39103,10.10.50.14:39103/?replicaSet=L1pppLocal&appName=notificationservice",
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
        env: "LOCAL-3",
    },
    userService: {
        url: "http://l1_user_service_local_3:5000/",
    },
    roundWatcherService: {
        url: "http://l1_round_watcher_service_local_3:5000/",
    },
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: false,
    marqueeDurations: {
        timeOutInMinute: 0.5,
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
};
