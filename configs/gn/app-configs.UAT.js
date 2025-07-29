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
        apiUrl: "http://gn-game-api-uat-service:5000",
        authUrl: "http://gn-auth-api-uat-service:5000",
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
        url: "mongodb://lmn_backend:LmnBackend%4022027@10.146.34.28:39420/?replicaSet=SN-UAT&appName=notificationservice",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "http://817eba6db40b4010bbce8b66b3ca38bc@10.2.190.51:9009/288",
        logIdentifier: "notification-service",
        env: "UAT",
    },
    userService: {
        url: "http://gn-user-service-uat-service:5000/",
    },
    roundWatcherService: {
        url: "http://gn-round-watcher-service-uat-service:5000/",
    },
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: true,
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
        baseUrl: "http://admin:17NyV+Weaatx_86gBSKc@10.2.190.51:9091",
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
