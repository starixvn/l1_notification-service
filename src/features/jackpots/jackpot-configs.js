import NodeCache from "node-cache";
import appConfigs from "../../app-configs";
import { get } from "../../helpers/api-client-helper";

const jackpotConfigsCache = new NodeCache({ stdTTL: 60 });

async function getJackpotConfigs(gameIds, operatorId, siteName) {
    const cachedResult = jackpotConfigsCache.get("jackpot-configs");

    const configFilter = (config) =>
        gameIds.includes(config.gameId) &&
        config.operatorId === operatorId &&
        (config.siteNames.includes(siteName) || config.siteNames.length === 0);

    if (cachedResult) {
        return cachedResult.filter(configFilter);
    }

    const response = await get(`${appConfigs.gameManagementApiSettings.baseUrl}/jackpot-config`);

    if (response.isSuccessful) {
        const jackpotConfigs = response.data;
        jackpotConfigsCache.set("jackpot-configs", jackpotConfigs);
        return jackpotConfigs.filter(configFilter);
    }

    return [];
}

export { getJackpotConfigs };
