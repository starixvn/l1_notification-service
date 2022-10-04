import { getEffectivePromotionNotifications } from "../../../src/features/promotion-notifications/promotion-notification-helper";

describe("getEffectivePromotionNotifications", () => {
    describe("when effective promotion notifications", () => {
        it("should return isActive = true", () => {
            // Arrange
            const promotionNotifications = [
                {
                    displayKind: 3,
                    enabled: true,
                    endTime: "2022-08-19T10:00:00.000Z",
                    gameName: "minisedie",
                    message: null,
                    messages: {},
                    promotionId: "62fb32c32b4e7c0001fb6afd",
                    startTime: "2022-08-16T02:00:00.000Z",
                    time: "2022-08-16T06:01:39.921Z",
                    title: {},
                    __v: 0,
                    _id: "62fb32c32b4e7c0001fb6a4f",
                },
            ];
            const promotions = [
                {
                    _id: "62fb32c32b4e7c0001fb6afd",
                    startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                    endDateTime: new Date(new Date().setHours(new Date().getHours() - 1)),
                    isDaily: false,
                    odds: { big: 10, small: 11 },
                    gameId: 2,
                },
            ];

            const expected = [
                {
                    isActive: true,
                    displayKind: 3,
                    enabled: true,
                    endTime: "2022-08-19T10:00:00.000Z",
                    gameName: "minisedie",
                    message: null,
                    messages: {},
                    promotionId: "62fb32c32b4e7c0001fb6afd",
                    startTime: "2022-08-16T02:00:00.000Z",
                    time: "2022-08-16T06:01:39.921Z",
                    title: {},
                    __v: 0,
                    _id: "62fb32c32b4e7c0001fb6a4f",
                },
            ];

            // Act
            const result = getEffectivePromotionNotifications(promotionNotifications, promotions);

            // Assert
            expect(result).toEqual(expected);
        });

        it("should return isActive = false", () => {
            // Arrange
            const promotionNotifications = [
                {
                    displayKind: 3,
                    enabled: true,
                    endTime: "2022-08-19T10:00:00.000Z",
                    gameName: "minisedie",
                    message: null,
                    messages: {},
                    promotionId: "62fb32c32b4e7c0001fb6afd",
                    startTime: "2022-08-16T02:00:00.000Z",
                    time: "2022-08-16T06:01:39.921Z",
                    title: {},
                    __v: 0,
                    _id: "62fb32c32b4e7c0001fb6a4f",
                },
            ];
            const promotions = [
                {
                    _id: "62fb32c32b4e7c0001fb6a21",
                    startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                    endDateTime: new Date(new Date().setHours(new Date().getHours() - 1)),
                    isDaily: false,
                    odds: { big: 10, small: 11 },
                    gameId: 2,
                },
            ];

            const expected = [
                {
                    isActive: false,
                    displayKind: 3,
                    enabled: true,
                    endTime: "2022-08-19T10:00:00.000Z",
                    gameName: "minisedie",
                    message: null,
                    messages: {},
                    promotionId: "62fb32c32b4e7c0001fb6afd",
                    startTime: "2022-08-16T02:00:00.000Z",
                    time: "2022-08-16T06:01:39.921Z",
                    title: {},
                    __v: 0,
                    _id: "62fb32c32b4e7c0001fb6a4f",
                },
            ];

            // Act
            const result = getEffectivePromotionNotifications(promotionNotifications, promotions);

            // Assert
            expect(result).toEqual(expected);
        });
    });
});
