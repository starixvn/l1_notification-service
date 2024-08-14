import Chance from "chance";
import { stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import currency from "../../../src/features/jackpots/currency";
import currencyGroup from "../../../src/features/jackpots/currency-group";
import currencyGroupGame from "../../../src/features/jackpots/currency-group-game";
import { getCurrency, getCurrencyGroup, getOfferedGames } from "../../../src/features/jackpots/currency-repository";

jest.mock("../../../src/features/jackpots/currency");
jest.mock("../../../src/features/jackpots/currency-group");
jest.mock("../../../src/features/jackpots/currency-group-game");
currency.findOne = stubMongoose(currency).findOne;
currencyGroup.findById = stubMongoose(currencyGroup).findById;
currencyGroupGame.find = stubMongoose(currencyGroupGame).find;

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
            expect(currency.findOne).toBeCalledWith({ name: currencyName, partnerId });
        });
    });

    describe("getCurrencyGroup", () => {
        it("should call currencyGroup findById", async () => {
            // Arrange
            const groupId = chance.hash({ length: 24 });

            // Act
            await getCurrencyGroup(groupId);

            // Assert
            expect(currencyGroup.findById).toBeCalledWith(new mongoose.Types.ObjectId(groupId));
        });
    });

    describe("getOfferedGames", () => {
        it("should call currencyGroupGame find", async () => {
            // Arrange
            const groupId = chance.hash({ length: 24 });

            // Act
            await getOfferedGames(groupId);

            // Assert
            expect(currencyGroupGame.find).toBeCalledWith({ groupId: new mongoose.Types.ObjectId(groupId), enabled: true }, "gameId gameName stakeLevels betLevels");
        });
    });
});
