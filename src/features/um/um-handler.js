import { logger } from "sc-common";
import * as socketClientHandler from "../socket-clients/socket-client-handler";

let umCache = [];

const getFormattedUmInfo = (umInfo) => {
    const { startTime, endTime, isPartnerUm, partners } = umInfo;

    return {
        startTime: startTime ? new Date(startTime) : startTime,
        endTime: endTime ? new Date(endTime) : endTime,
        isOperatorUm: isPartnerUm,
        isPartnerUm: isPartnerUm,
        partners: partners,
    };
};

const captureUmInfo = (umInfo) => {
    umCache = umCache ?? [];

    if (umInfo.isPartnerUm) {
        umInfo.partners.forEach((partnerId) => umCache.push({ ...umInfo, partnerId, operatorId: partnerId }));
    } else {
        umCache.push({ ...umInfo });
    }
};

const kickOutUmAffectedUsers = () => {
    const clients = socketClientHandler.getClients();

    Object.values(clients).forEach((client) => {
        const userUmInfo = getUmByPartner(client.session.partnerId);

        userUmInfo && kickOutUm(client, userUmInfo);
    });
};

const kickOutUm = (client, umInfo) => {
    client.socketClient.emit("kickedOut", {
        message: "Game đang được bảo trì, vui lòng quay lại sau 10 phút.",
        umInfo: {
            isUM: true,
            startTime: umInfo.startTime,
            endTime: umInfo.endTime,
        },
    });

    socketClientHandler.disconnectUser(client.socketClient.id);
};

const getUmByPartner = (partnerId) => {
    const scUm = umCache.find((um) => !um.isPartnerUm);
    const partnerUm = umCache.find((um) => um.isPartnerUm && um.partnerId === partnerId);

    return scUm ?? partnerUm;
};

const stopUm = (umInfo) => {
    umCache = umCache?.filter(
        (um) =>
            um.startTime > Date.now() ||
            um.isPartnerUm !== umInfo.isPartnerUm ||
            (umInfo.isPartnerUm && !umInfo.partners.includes(um.partnerId))
    );
};

const startUm = (umInfo) => {
    const formattedUmInfo = getFormattedUmInfo(umInfo);

    captureUmInfo(formattedUmInfo);

    kickOutUmAffectedUsers();
};

const handleUmRequest = (req, res) => {
    const umInfo = req.body;

    if (umInfo) {
        umInfo.isUM ? startUm(umInfo) : stopUm(umInfo);
        res.send(umInfo);
    } else {
        res.send("Cannot parse request object");
    }

    logger.logError(`UM Information: ${JSON.stringify(umInfo)}`);
};

export { handleUmRequest };

