import { getEffectivePromotions } from "../../../src/features/promotions/promotion-helper";

describe("getEffectivePromotions", () => {
    describe("when no effective promotion", () => {
        it("should return empty", () => {
            // Arrange
            const promotions = [
                {
                    startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                    endDateTime: new Date(new Date().setHours(new Date().getHours() - 1)),
                    isDaily: false,
                    odds: { big: 10, small: 11 },
                },
            ];

            // Act
            const result = getEffectivePromotions(promotions);

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe("when consecutive promotion", () => {
        it("should return effective promotions", () => {
            // Arrange
            const promotions = [
                {
                    startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                    endDateTime: new Date(new Date().setHours(new Date().getHours() + 2)),
                    isDaily: false,
                    odds: { big: 10, small: 11 },
                    gameId: 1,
                },
                {
                    startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                    endDateTime: new Date(new Date().setHours(new Date().getHours() - 1)),
                    isDaily: false,
                    odds: { big: 10, small: 13 },
                    gameId: 2,
                },
                {
                    startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                    endDateTime: new Date(new Date().setHours(new Date().getHours() + 2)),
                    isDaily: false,
                    odds: { big: 10, small: 13 },
                    gameId: 2,
                },

                {
                    startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                    endDateTime: new Date(new Date().setHours(new Date().getHours() - 1)),
                    isDaily: false,
                    odds: { big: 10, small: 13 },
                    gameId: 3,
                },
            ];

            // Act
            const result = getEffectivePromotions(promotions);

            // Assert
            expect(result).toEqual([promotions[0], promotions[2]]);
        });
    });

    describe("when daily promotion", () => {
        describe("when startDateTime < endDateTime", () => {
            it("should return effective promotions", () => {
                // Arrange
                const promotions = [
                    {
                        startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                        endDateTime: new Date(new Date().setHours(new Date().getHours() + 2)),
                        isDaily: true,
                        odds: { big: 10, small: 11 },
                        gameId: 1,
                    },
                    {
                        startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                        endDateTime: new Date(new Date(new Date().setHours(new Date().getHours() + 2)).setDate(new Date().getDate() + 2)),
                        isDaily: true,
                        odds: { big: 10, small: 13 },
                        gameId: 2,
                    },
                ];

                // Act
                const result = getEffectivePromotions(promotions);

                // Assert
                expect(result).toEqual([promotions[0], promotions[1]]);
            });
        });

        describe("when startDateTime > endDateTime", () => {
            it("should return effective promotions", () => {
                // Arrange
                const promotions = [
                    {
                        startDateTime: new Date(new Date().setHours(new Date().getHours() + 2)),
                        endDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                        isDaily: true,
                        odds: { big: 10, small: 11 },
                        gameId: 1,
                    },
                    {
                        startDateTime: new Date(new Date().setHours(new Date().getHours() - 2)),
                        endDateTime: new Date(new Date(new Date().setHours(new Date().getHours() - 4)).setDate(new Date().getDate() + 2)),
                        isDaily: true,
                        odds: { big: 10, small: 13 },
                        gameId: 2,
                    },
                ];

                // Act
                const result = getEffectivePromotions(promotions);

                // Assert
                expect(result).toEqual([promotions[1]]);
            });
        });
    });
});
