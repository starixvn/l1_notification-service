import { clientCredentialsGrant, discovery } from "openid-client";
import { logger } from "sc-common";

const beforeTokenExpired = 60 * 5;
const timeout = 60000;

export default class BearerAuthenticator {
    constructor(authConfigs) {
        this.authConfigs = authConfigs;
    }

    async autoUpdateToken() {
        console.log("autoUpdateToken");
        await this.updateToken();
        setTimeout(this.refresh.bind(this), timeout);
    }

    async refresh() {
        if (this.isTokenExpired()) {
            await this.updateToken();
        }

        setTimeout(this.refresh.bind(this), timeout);
    }

    isTokenExpired() {
        return !this.expired || this.expired - Date.now() / 1000 - beforeTokenExpired <= 0;
    }

    async updateToken() {
        try {
            const result = await this.getBearerToken();

            this.token = result.token;
            this.expired = result.expired;

            logger.log("Get bearer token successfully.");
        } catch (error) {
            logger.logError(`Get bearer token failed: ${error}`);
        }
    }

    async getBearerToken() {
        const config = await discovery(new URL(this.authConfigs.issuer), this.authConfigs.clientId, this.authConfigs.clientSecret);
        const token = await clientCredentialsGrant(config);

        return token.access_token
            ? {
                  token,
                  expired: token.expires_at,
              }
            : null;
    }

    formatToken() {
        return this.token ? `${this.token.token_type} ${this.token.access_token}` : "";
    }
}
