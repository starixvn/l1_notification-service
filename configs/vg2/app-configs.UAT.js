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
        apiUrl: "http://l2-game-api-uat-service:5000",
        authUrl: "http://l2-auth-api-uat-service:5000",
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
        url: "mongodb://lmn_backend:LmnBackend%4022027@10.99.99.53:39220,10.99.99.54:39220,10.99.99.188:39220,10.99.99.187:39220/?replicaSet=SabaL2UAT&appName=notificationservice",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "http://8ac47fca6d3e4a41908896a64ef201ac@10.2.190.51:9009/53",
        logIdentifier: "notification-service",
        env: "UAT",
    },
    userService: {
        url: "http://l2-user-service-uat-service:5000/",
    },
    roundWatcherService: {
        url: "http://l2-round-watcher-service-uat-service:5000/",
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
        issuer: "http://l2-auth-api-uat-service:5000",
        requestTimeout: 10000,
        useAuthenticate: true,
    },
    gameManagementApiSettings: {
        baseUrl: "http://l2-game-management-service-uat-service:5000",
    },
    natsOptions: {
        connectionOptions: {
            servers: "nats://vn-sc-nats-uat.nebula.prod",
        },
        consumerOptions: {
            jackpotPools: {
                stream: "vg_uat_slots_jackpot_pools",
                filterSubject: "vg-uat-jackpot-pools.>",
            },
            jackpotWinners: {
                stream: "vg_uat_slots_jackpot_winners",
                filterSubject: "vg-uat-jackpot-winners.>",
            },
        },
    },
};
