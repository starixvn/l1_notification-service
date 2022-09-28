import * as httpRouter from "../../../src/routers/http-router";
import { utils } from "sc-common";
import { broadcastReload } from "../../../src/features/reload/reload-handler";
import { handleUmRequest } from "../../../src/features/um/um-handler";
import { handleMetrics } from "../../../src/features/metrics/metric-handler";
import { getTotalClients } from "../../../src/features/socket-clients/socket-client-handler";
import appConfigs from "../../../src/app-configs";
import { notifyJackpotWinner } from "../../../src/features/jackpots/jackpot-handler";

jest.mock("sc-common");
jest.mock("../../../src/features/reload/reload-handler");
jest.mock("../../../src/features/um/um-handler");
jest.mock("../../../src/features/metrics/metric-handler");
jest.mock("../../../src/features/socket-clients/socket-client-handler");
jest.mock("../../../src/features/jackpots/jackpot-handler");

describe("httpRouter", () => {
    const app = {
        get: jest.fn(),
        post: jest.fn(),
    };

    const authConfig = {
        authUrl: appConfigs.apiSettings.authUrl,
        audiences: appConfigs.authenticateSettings.audiences,
    };

    it("should register api/jackpotWinner handler", () => {
        // Act
        httpRouter.init(app);

        // Assert
        expect(app.post).toBeCalledWith("/api/jackpotWinner", utils.authentication.useAuthenticate(authConfig), notifyJackpotWinner);
    });
    
    it("should register api/reload handler", () => {
        // Act
        httpRouter.init(app);

        // Assert
        expect(app.post).toBeCalledWith("/api/reload", utils.authentication.useAuthenticate(authConfig), broadcastReload);
    });
    it("should register api/um handler", () => {
        // Act
        httpRouter.init(app);

        // Assert
        expect(app.post).toBeCalledWith("/api/um", utils.authentication.useAuthenticate(authConfig), handleUmRequest);
    });

    it("should register api/connectedClients handler", () => {
        // Act
        httpRouter.init(app);

        // Assert
        expect(app.get).toBeCalledWith("/api/connectedClients", utils.authentication.useAuthenticate(authConfig), getTotalClients);
    });

    it("should register api/metrics handler", () => {
        // Act
        httpRouter.init(app);

        // Assert
        expect(app.get).toBeCalledWith("/api/metrics", handleMetrics);
    });
});
