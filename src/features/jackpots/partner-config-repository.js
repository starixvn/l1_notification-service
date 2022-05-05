import partnerConfig from "./partner-config";

const getSiteExclusions = async () => partnerConfig.find({ type: "game_site_exclusions" }).lean().exec();

const getSiteExclusionByPartner = async (partnerId) => partnerConfig.findOne({ type: "game_site_exclusions", partnerId }).lean().exec();

export { getSiteExclusions, getSiteExclusionByPartner };
