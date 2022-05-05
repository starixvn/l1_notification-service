import { find, findWithProjection } from "../../../src/features/game-notifications/game-notification-repository";
import { gameNotifications } from "sc-base-database";

jest.mock("sc-base-database");

describe("find", () => {
    describe("when called", () => {
        it("should execute the method of mongoose model", () => {
            // Act
            find("projection", "callback", "filter");

            // Assert
            expect(gameNotifications.find).toHaveBeenCalledWith("filter", "projection", "callback");
        });
    });
});

describe("findWithProjection", () => {
    describe("when called", () => {
        it("should execute the method of mongoose model", () => {
            // Arrange
            const defaultProjection = { _id: false, __v: false, __archive: false };

            // Act
            findWithProjection("callback", "filter");

            // Assert
            expect(gameNotifications.find).toHaveBeenCalledWith("filter", defaultProjection, "callback");
        });
    });
});
