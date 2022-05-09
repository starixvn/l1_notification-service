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
        apiUrl: "http://l1_game_api_local_2:5000",
        authUrl: "http://l1_auth_api_local_2:5000",
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
        url: "mongodb://lmn_backend:LmnBackend@10.10.50.12:39102,10.10.50.13:39102,10.10.50.14:39102/?replicaSet=L1ppLocal",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://304fcee64d694a7ca7a0b15d9c8de27d@sentry.lumigame.com/2",
        logIdentifier: "notification-service",
        env: "LOCAL-2",
    },
    userService: {
        url: "http://l1_user_service_local_2:5000/",
    },
    enableCorsWs: false,
    corsUrls: [
        "http://localhost:7456",
        "http://localhost:7000",
        "http://localhost:3000",
        "http://l1-games2.lumigame.com",
        "https://l1-games2.lumigame.com",
        "http://l1-admin2.lumigame.com",
        "https://l1-admin2.lumigame.com",
        "http://l1-m2.lumigame.com",
        "https://l1-m2.lumigame.com",
        "http://l1-mini2.lumigame.com",
        "https://l1-mini2.lumigame.com",
    ],
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: false,
    marqueeDurations: {
        intervalTimeInMinute: 0.5,
        timeToDisplayMessageInMinute: 0.5,
    },
};
