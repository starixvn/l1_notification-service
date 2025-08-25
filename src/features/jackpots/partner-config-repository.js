import { PartnerConfigs } from "sc-base-database";

const getSiteExclusions = async () => PartnerConfigs.find({ type: "game_site_exclusions" }).lean().exec();

const getSiteExclusionByPartner = async (partnerId) => PartnerConfigs.findOne({ type: "game_site_exclusions", partnerId }).lean().exec();

export { getSiteExclusionByPartner, getSiteExclusions };
