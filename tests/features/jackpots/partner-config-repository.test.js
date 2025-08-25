import Chance from "chance";
import { stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { PartnerConfigs } from "sc-base-database";
import { getSiteExclusionByPartner, getSiteExclusions } from "../../../src/features/jackpots/partner-config-repository";

PartnerConfigs.find = stubMongoose(mongoose.Model).find;
PartnerConfigs.findOne = stubMongoose(mongoose.Model).findOne;
PartnerConfigs.exists = jest.fn();

const chance = new Chance();

describe("partnerConfigRepository", () => {
    describe("getSiteExclusions", () => {
        it("should call partnerConfig find", async () => {
            // Act
            await getSiteExclusions();

            // Assert
            expect(PartnerConfigs.find).toBeCalledWith({ type: "game_site_exclusions" });
        });
    });

    describe("getSiteExclusionByPartner", () => {
        it("should call currencyGroupGame find", async () => {
            // Arrange
            const partnerId = chance.string();

            // Act
            await getSiteExclusionByPartner(partnerId);

            // Assert
            expect(PartnerConfigs.findOne).toBeCalledWith({ type: "game_site_exclusions", partnerId });
        });
    });
});
