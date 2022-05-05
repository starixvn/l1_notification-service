import { logger } from "sc-common";
import appConfigs from "../../app-configs";
import { getMetrics } from "../../metrics";

export const handleMetrics = (req, res) => {
    try {
        const { secretKey } = req?.query || {};

        if (secretKey === appConfigs.metrics.secretKey) {
            res.send(getMetrics(secretKey));
        } else {
            res.send({ error: true });
        }
    } catch (error) {
        logger.logError(error);
        res.send({ error: true });
    }
};
