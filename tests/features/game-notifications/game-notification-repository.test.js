import { find, findWithProjection, getPromotionNotification } from "../../../src/features/game-notifications/game-notification-repository";
import { gameNotifications } from "sc-base-database";
import notifications from "../../../src/features/game-notifications/notifications";
import { stubMongoose } from "jest-micro-auto-stub";

jest.mock("sc-base-database");
jest.mock("../../../src/features/game-notifications/notifications");
notifications.find = stubMongoose(notifications).find;

const now = new Date("2020-01-01");
jest.useFakeTimers().setSystemTime(now);

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

describe("getPromotionNotifications", () => {
    it("should call  promotion notification find", async () => {
        // Arrange
        const notificationType = 3;
        const notificationFilter = {
            displayKind: notificationType,
            startTime: { $lte: now },
            endTime: { $gte: now },
            enabled: true,
        };

        // Act
        await getPromotionNotification(notificationType);

        // Assert
        expect(notifications.find).toBeCalledWith(notificationFilter);
    });
});
