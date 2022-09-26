import * as socketServerHandler from "../../../src/features/socket-server/socket-server-handler";
import * as handler from "../../../src/features/promotions/promotions-handler";
import * as promotionsRepository from "../../../src/features/promotions/promotions-repository";

jest.mock("../../../src/features/socket-server/socket-server-handler");
jest.mock("../../../src/features/promotions/promotions-repository");
jest.mock("../../../src/app-configs", () => {
    return {
        promotionsDurations: {
            intervalTimeInMinutes: 0.25,
        },
    };
});

socketServerHandler.broadcastAll = jest.fn();
promotionsRepository.getPromotions = jest.fn();

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

describe("Promotions Handler", () => {
    jest.useFakeTimers();
    afterAll(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe("setPromotions", () => {
        it("should setInterval to proceed notifications", () => {
            // Arrange
            jest.spyOn(global, "setTimeout").mockImplementationOnce((cb) => {
                cb();
            });

            // Act
            handler.setPromotions();

            // Assert
            expect(global.setTimeout).toHaveBeenCalledTimes(2);
        });
    });

    describe("proceedNotificationMessage", () => {
        it("should emit message to all sockets", () => {
            // Arrange
            // Act
            handler.proceedPromotionsMessage(promotions);

            // Assert
            expect(socketServerHandler.broadcastAll).toHaveBeenCalledWith("promotions", promotions);
        });
    });

    describe("proceed", () => {
        beforeEach(async () => {
            // Arrange
            handler.default.__set__("proceedPromotionsMessage", jest.fn());
            handler.default.__set__("setPromotions", jest.fn());
            jest.spyOn(global, "clearTimeout");

            promotionsRepository.getPromotions.mockResolvedValueOnce(promotions);

            // Act
            await handler.proceed();
        });

        it("should call proceedPromotionsMessage", async () => {
            // Assert
            const proceedPromotionsMessageFunc = handler.default.__get__("proceedPromotionsMessage");
            expect(proceedPromotionsMessageFunc).toHaveBeenCalledWith(promotions);
        });

        it("should clear previous time out", () => {
            // Assert
            expect(global.clearTimeout).toHaveBeenCalled();
        });

        it("should call setPromotions", async () => {
            // Assert
            const setPromotionsFunc = handler.default.__get__("setPromotions");
            expect(setPromotionsFunc).toHaveBeenCalled();
        });
    });
});
