import Chance from "chance";
import * as socketServerHandler from "../../../src/features/socket-server/socket-server-handler";
import * as notificationRepository from "../../../src/features/game-notifications/game-notification-repository";
import * as handler from "../../../src/features/promotion-notifications/promotion-notification-handler";
import * as promotionsRepository from "../../../src/features/promotions/promotions-repository";

jest.mock("../../../src/features/socket-server/socket-server-handler");
jest.mock("../../../src/features/game-notifications/game-notification-repository");
jest.mock("../../../src/features/promotions/promotions-repository");
jest.mock("../../../src/app-configs", () => {
    return {
        promotionNotificationDurations: {
            delayTimeInMinutes: 0.1,
        },
    };
});

let chance = new Chance();
socketServerHandler.broadcastAll = jest.fn();
notificationRepository.getPromotionNotification = jest.fn();
promotionsRepository.getPromotions = jest.fn();

const notification = [
    {
        message: "",
        displayKind: 3,
        gameName: "baccarat",
        messages: [],
        title: [],
        startDateTime: new Date("2022-02-17T14:06:37.754+00:00"),
        endDateTime: new Date("2022-05-17T14:06:37.754+00:00"),
    },
];

const promotions = [
    {
        gameId: 47,
        startDateTime: new Date("2022-02-17T14:06:37.754+00:00"),
        endDateTime: new Date("2022-05-17T14:06:37.754+00:00"),
        status: true,
    },
];

jest.mock("../../../src/features/promotions/promotion-helper", () => {
    return {
        getEffectivePromotions: jest.fn(() => [
            {
                gameId: 47,
                startDateTime: new Date("2022-02-17T14:06:37.754+00:00"),
                endDateTime: new Date("2022-05-17T14:06:37.754+00:00"),
                status: true,
            },
        ]),
    };
});

jest.mock("../../../src/features/promotion-notifications/promotion-notification-helper", () => {
    return {
        getEffectivePromotionNotifications: jest.fn(() => [
            {
                message: "",
                displayKind: 3,
                gameName: "baccarat",
                messages: [],
                title: [],
                startDateTime: new Date("2022-02-17T14:06:37.754+00:00"),
                endDateTime: new Date("2022-05-17T14:06:37.754+00:00"),
            },
        ]),
    };
});

describe("Promotions Notification Handler", () => {
    jest.useFakeTimers();
    afterAll(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe("setPromotionsNotification", () => {
        it("should setInterval to proceed notifications", () => {
            // Arrange
            jest.spyOn(global, "setTimeout").mockImplementationOnce((cb) => {
                cb();
            });
            // Act
            handler.setPromotionNotifications();

            // Assert
            expect(global.setTimeout).toHaveBeenCalledTimes(1);
        });
    });

    describe("proceedNotificationMessage", () => {
        it("should emit message to all sockets", () => {
            // Arrange
            const message = chance.string();

            // Act
            handler.proceedNotificationMessage(message);

            // Assert
            expect(socketServerHandler.broadcastAll).toHaveBeenCalledWith("promotionNotifications", message);
        });
    });

    describe("proceed", () => {
        beforeEach(async () => {
            // Arrange
            handler.default.__set__("proceedNotificationMessage", jest.fn());
            handler.default.__set__("setPromotionNotifications", jest.fn());
            jest.spyOn(global, "clearTimeout");
            notificationRepository.getPromotionNotification.mockResolvedValueOnce(notification);
            promotionsRepository.getPromotions.mockResolvedValueOnce(promotions);
            // Act
            await handler.proceed();
        });

        it("should call proceedNotificationMessage", async () => {
            //Arrange
            // Assert
            const proceedNotificationMessageFunc = handler.default.__get__("proceedNotificationMessage");
            expect(proceedNotificationMessageFunc).toHaveBeenCalledWith(notification);
        });

        it("should clear previous interval", () => {
            // Assert
            expect(global.clearTimeout).toHaveBeenCalled();
        });

        it("should call setPromotionNotificationsFunc", async () => {
            // Assert
            const setPromotionNotificationsFunc = handler.default.__get__("setPromotionNotifications");
            expect(setPromotionNotificationsFunc).toHaveBeenCalled();
        });
    });
});
