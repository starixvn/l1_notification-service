import { compose, lt, prop } from "ramda";
import { logger } from "sc-common";
import { findWithProjection } from "./game-notification-repository";

const getGameId = prop("gameId");
const isValidRequest = compose(lt(0), getGameId);

const createFilter = (client, request) => {
    const uid = client.data.UID;
    if (isValidRequest(request)) {
        return { uid, gameId: getGameId(request) };
    } else {
        return { uid };
    }
};

const transformData = (error, data) => {
    if (error) {
        logger.logError(error);

        return [];
    }

    return data;
};

const findFromRepository = (sendData) => findWithProjection(compose(sendData, transformData));

export const findNotifications = (sendMessage) => compose(findFromRepository(sendMessage), createFilter);
export const tests = {
    createFilter,
    transformData,
    findFromRepository,
};
