import Chance from "chance";
import { stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { Currencies, CurrencyGroupGames, CurrencyGroups } from "sc-base-database";
import { getCurrency, getCurrencyGroup, getOfferedGames } from "../../../src/features/jackpots/currency-repository";

Currencies.findOne = stubMongoose(mongoose.Model).findOne;
CurrencyGroups.findById = stubMongoose(mongoose.Model).findById;
CurrencyGroupGames.find = stubMongoose(mongoose.Model).find;

const chance = new Chance();

describe("currencyRepository", () => {
    describe("getCurrency", () => {
        it("should call currency findOne", async () => {
            // Arrange
            const currencyName = chance.currency().name;
            const partnerId = chance.string();

            // Act
            await getCurrency(currencyName, partnerId);

            // Assert
            expect(Currencies.findOne).toBeCalledWith({ name: currencyName, partnerId });
        });
    });

    describe("getCurrencyGroup", () => {
        it("should call currencyGroup findById", async () => {
            // Arrange
            const groupId = chance.hash({ length: 24 });

            // Act
            await getCurrencyGroup(groupId);

            // Assert
            expect(CurrencyGroups.findById).toBeCalledWith(new mongoose.Types.ObjectId(groupId));
        });
    });

    describe("getOfferedGames", () => {
        it("should call currencyGroupGame find", async () => {
            // Arrange
            const groupId = chance.hash({ length: 24 });

            // Act
            await getOfferedGames(groupId);

            // Assert
            expect(CurrencyGroupGames.find).toBeCalledWith(
                { groupId: new mongoose.Types.ObjectId(groupId), enabled: true },
                "gameId gameName stakeLevels betLevels"
            );
        });
    });
});
