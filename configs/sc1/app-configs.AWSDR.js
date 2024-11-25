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
        apiUrl: "http://l1_game_api_awsdr:5000",
        authUrl: "http://l1_auth_api_awsdr:5000",
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
        url: "mongodb://lmn_backend:Sb%7B5r%40Xy4X%256%28%24%5Bt%252HsOxJ%7CQt9jdR%26t@10.77.15.16:27101/?replicaSet=SabaL1DR",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://52368c4019044019885440599c180bda@scsentry.sgamesuat.com/24",
        logIdentifier: "notification-service",
        env: "UAT",
    },
    userService: {
        url: "http://l1_user_service_awsdr:5000/",
    },
    roundWatcherService: {
        url: "http://l1_round_watcher_service_awsdr:5000/",
    },
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: true,
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
