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
        apiUrl: "http://l1-game-api-uat-service:5000",
        authUrl: "http://l1-auth-api-uat-service:5000",
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
        url: "mongodb://lmn_backend:LmnBackend%4022027@10.99.99.53:39120,10.99.99.54:39120,10.99.99.188:39120,10.99.99.187:39120/?replicaSet=SabaUAT&appName=notificationservice",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "http://52368c4019044019885440599c180bda@10.2.190.51:9009/24",
        logIdentifier: "notification-service",
        env: "UAT",
    },
    userService: {
        url: "http://l1-user-service-uat-service:5000/",
    },
    roundWatcherService: {
        url: "http://l1-round-watcher-service-uat-service:5000/",
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
    oidc: {
        clientId: "api",
        clientSecret: "api@20luminet&",
        issuer: "http://l1-auth-api-uat-service:5000",
        requestTimeout: 10000,
        useAuthenticate: true,
    },
    gameManagementApiSettings: {
        baseUrl: "http://l1-game-management-service-uat-service:5000",
    },
    natsOptions: {
        connectionOptions: {
            servers: "nats://vn-sc-nats-uat.nebula.prod",
        },
        consumerOptions: {
            jackpotPools: {
                stream: "sg_uat_slots_jackpot_pools",
                filterSubject: "sg-uat-jackpot-pools.>",
            },
            jackpotWinners: {
                stream: "sg_uat_slots_jackpot_winners",
                filterSubject: "sg-uat-jackpot-winners.>",
            },
        },
    },
};
