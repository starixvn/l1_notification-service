import appConfigs from "../app-configs";
const systemType = {
    SC1: "SC1",
    VG2: "VG2",
    GN: "GN",
};

export const isGN = appConfigs.systemType === systemType.GN;
