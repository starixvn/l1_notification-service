import { utils } from "sc-common";
import appConfigs from "../app-configs";
import { notifyJackpotWinner } from "../features/jackpots/jackpot-handler";
import { broadcastReload } from "../features/reload/reload-handler";
import { handleUmRequest } from "../features/um/um-handler";
import { handleMetrics } from "../features/metrics/metric-handler";
import { getTotalClients, getDetailedClients } from "../features/socket-clients/socket-client-handler";

/**
 * @param {express.Express} app
 */

const init = (app) => {
    const authConfig = {
        authUrl: appConfigs.apiSettings.authUrl,
        audiences: appConfigs.authenticateSettings.audiences,
    };

    app.post("/api/jackpotWinner", utils.authentication.useAuthenticate(authConfig), notifyJackpotWinner);
    app.post("/api/reload", utils.authentication.useAuthenticate(authConfig), broadcastReload);
    app.post("/api/um", utils.authentication.useAuthenticate(authConfig), handleUmRequest);
    app.get("/api/connectedClients", utils.authentication.useAuthenticate(authConfig), getTotalClients);

    app.get("/api/metrics", handleMetrics);
    app.get("/api/getDetailedClients", getDetailedClients);
};

export { init };
