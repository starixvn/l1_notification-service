import { getSiteExclusions, getSiteExclusionByPartner } from "../../../src/features/jackpots/partner-config-repository";
import partnerConfig from "../../../src/features/jackpots/partner-config";
import { stubMongoose } from "jest-micro-auto-stub";
import Chance from "chance";

jest.mock("../../../src/features/jackpots/partner-config");
partnerConfig.findOne = stubMongoose(partnerConfig).findOne;
partnerConfig.exists = stubMongoose(partnerConfig).exists;
partnerConfig.find = stubMongoose(partnerConfig).find;

const chance = new Chance();

describe("partnerConfigRepository", () => {
    describe("getSiteExclusions", () => {
        it("should call partnerConfig find", async () => {
            // Act
            await getSiteExclusions();

            // Assert
            expect(partnerConfig.find).toBeCalledWith({ type: "game_site_exclusions" });
        });
    });

    describe("getSiteExclusionByPartner", () => {
        it("should call currencyGroupGame find", async () => {
            // Arrange
            const partnerId = chance.string();

            // Act
            await getSiteExclusionByPartner(partnerId);

            // Assert
            expect(partnerConfig.findOne).toBeCalledWith({ type: "game_site_exclusions", partnerId });
        });
    });
});
