import express from "express";
import { utils } from "sc-common";
import appConfigs from "../app-configs";
import { notifyJackpotWinner } from "../features/jackpots/jackpot-handler";
import { broadcastReload } from "../features/reload/reload-handler";
import { handleRoundTimerWatcherData } from "../features/round-timer/round-timer-handler";
import { getTotalClients } from "../features/socket-clients/socket-client-handler";
import { handleUmRequest } from "../features/um/um-handler";

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
    app.post("/api/roundTimer", utils.authentication.useAuthenticate(authConfig), handleRoundTimerWatcherData);
};

export { init };

