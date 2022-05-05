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
        apiUrl: "http://l2-api.lumigame.com",
        authUrl: "http://l2-auth.lumigame.com",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        requestTimeout: 10000,
        placeBetTimeout: 4500,
        enableApiLogs: true,
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend@10.10.50.13:37101/?replicaSet=L1Local",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://4c06d217eb0043c18b5334108ed22ce4@sentry.lumigame.com/24",
        logIdentifier: "notification-service",
        env: "LOCAL",
    },
    userService: {
        url: "https://l2-proxy.lumigame.com/user/",
    },
    authenticateSettings: {
        audiences: ["api", "admin-api", "game-services"],
    },
    enableCorsWs: false,
    corsUrls: ["http://localhost:7456", "https://games.lumigame.com", "http://localhost:7000"],
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: false,
    marqueeDurations: {
        intervalTimeInMinute: 10,
        timeToDisplayMessageInMinute: 2,
    },
};
