import NodeCache from "node-cache";
import appConfigs from "../../app-configs";
import { get } from "../../helpers/api-client-helper";

const jackpotConfigsCache = new NodeCache({ stdTTL: 60 });

async function getFromCache() {
    const cachedResult = jackpotConfigsCache.get("jackpot-configs");
    if (cachedResult) {
        return cachedResult;
    }

    const response = await get(`${appConfigs.gameManagementApiSettings.baseUrl}/jackpot-config`);

    if (response.isSuccessful) {
        const jackpotConfigs = response.data;
        jackpotConfigsCache.set("jackpot-configs", jackpotConfigs);
        return jackpotConfigs;
    }

    return [];
}

async function getJackpotConfigs(gameIds, operatorId, siteName) {
    const jackpotConfigs = await getFromCache();
    const configFilter = (config) =>
        gameIds.includes(config.gameId) &&
        config.operatorId === operatorId &&
        (config.siteNames.includes(siteName) || config.siteNames.length === 0);

    return jackpotConfigs.filter(configFilter);
}

export { getJackpotConfigs };
