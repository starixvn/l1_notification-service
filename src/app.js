import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import * as RouterConfig from "./routers/router-config";
import appConfigs from "./app-configs";
import { logger, middlewares } from "sc-common";
import { init as initBaseDatabase } from "sc-base-database";
import { setMarquee } from "./features/marquee/marquee-handler";
import { setPromotions } from "./features/promotions/promotions-handler";
import { setPromotionNotifications } from "./features/promotion-notifications/promotion-notification-handler";

const run = async () => {
    const app = express();
    await configureServices(app);
    const httpServer = http.createServer(app);
    RouterConfig.init(app, httpServer);

    setMarquee();
    setPromotionNotifications();
    setPromotions();
    middlewares.processErrorHandler.handle(httpServer, process);

    httpServer.listen(app.get("port"), async () => {
        console.log(`Express server started and running on port ${app.get("port")}!`);
    });
    app.get("/", (req, res, next) => {
        res.send("I'm Notification Service !");
    });
};

const configureServices = async (app) => {
    const { corsUrls, hostingPort, enabledLogs, sentry } = appConfigs;
    const corsOptions = {
        origin: (origin, callback) => {
            if (corsUrls.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error(`Not allowed by CORS ${origin}`));
            }
        },
    };

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(morgan("combined"));
    app.use(helmet());
    app.set("port", process.env.PORT || hostingPort);

    if (enabledLogs) {
        logger.start(sentry);
    }

    await initBaseDatabase(appConfigs.database);
};

run();
