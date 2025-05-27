import Axios from "axios";
import { logger } from "sc-common";

import BearerAuthenticator from "./bearer-authenticator";

let authenticationConfigs;
let bearerAuthenticator;

const init = async (configs) => {
    authenticationConfigs = configs;
    bearerAuthenticator = new BearerAuthenticator(configs);

    await bearerAuthenticator.autoUpdateToken();
};

const get = async (endpoint, params, options) => {
    console.log("get");
    if (!bearerAuthenticator) {
        logger.logError("authentication-helper has not been initialized properly.");

        return {};
    }

    const defaultRequestTimeout = 2500;
    const { useAuthenticate, requestTimeout } = authenticationConfigs;
    const requestConfigs = {
        timeout: options?.requestTimeout || requestTimeout || defaultRequestTimeout,
        headers: {},
    };

    if (useAuthenticate) {
        requestConfigs.headers.Authorization = bearerAuthenticator.formatToken();
    }

    return (await Axios.get(endpoint, { params, ...requestConfigs })).data;
};

export { get, init };
