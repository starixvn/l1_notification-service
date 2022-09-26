import { stubMongoose } from "jest-micro-auto-stub";
import promotions from "../../../src/features/promotions/promotions";
import { getPromotions } from "../../../src/features/promotions/promotions-repository";

jest.mock("../../../src/features/game-notifications/notifications");
promotions.find = stubMongoose(promotions).find;

describe("getPromotions", () => {
    it("should call promotions find", async () => {
        // Arrange
        const promotionsFilter = {
            status: "enabled",
        };

        // Act
        await getPromotions();

        // Assert
        expect(promotions.find).toBeCalledWith(promotionsFilter);
    });
});
