import { tests } from "../../../src/features/game-notifications/game-notification-handler";
import { findNotifications } from "../../../src/features/game-notifications";
import { logger } from "sc-common";
import { findWithProjection } from "../../../src/features/game-notifications/game-notification-repository";
import { getClientSession } from "../../../src/features/socket-clients/socket-client-handler";

jest.mock("sc-common");
jest.mock("../../../src/features/game-notifications/game-notification-repository");
jest.mock("../../../src/features/socket-clients/socket-client-handler");

describe("createFilter", () => {
    describe("when the request is invalid", () => {
        test.each([[undefined], [{}], [{ gameId: 0 }], [{ gameId: -1 }], [{ gameId: "id" }]])(
            "should return an object just has uid property",
            (request) => {
                // Arrange
                getClientSession.mockReturnValueOnce({ userId: "uid" });

                // Act
                const filter = tests.createFilter({ id: "uid" }, request);

                // Assert
                expect(filter).toStrictEqual({ uid: "uid" });
            }
        );
    });

    describe("when the request is valid", () => {
        it("should return an object has uid and gameId property", () => {
            // Arrange
            getClientSession.mockReturnValueOnce({ userId: "uid" });

            // Act
            const filter = tests.createFilter({ id: "uid" }, { gameId: 3 });

            // Assert
            expect(filter).toStrictEqual({ uid: "uid", gameId: 3 });
        });
    });

    describe("when the session is not defined", () => {
        it("should return an object has undefined uid", () => {
            // Arrange
            getClientSession.mockReturnValueOnce(null);

            // Act
            const filter = tests.createFilter({ id: "uid" }, { gameId: 3 });

            // Assert
            expect(filter).toStrictEqual({ uid: undefined, gameId: 3 });
        });
    });
});

describe("transformData", () => {
    describe("when error", () => {
        it("should write log", () => {
            // Act
            tests.transformData({ error: "message" });

            // Assert
            expect(logger.logError).toHaveBeenCalledWith({ error: "message" });
        });

        it("should return an empty array", () => {
            // Act
            const result = tests.transformData({ error: "message" });

            // Assert
            expect(result).toStrictEqual([]);
        });
    });

    describe("when called", () => {
        it("should return data from parameter", () => {
            // Arrange
            const data = [1, 2, 3];

            // Act
            const result = tests.transformData(false, data);

            // Assert
            expect(result).toStrictEqual(data);
        });
    });
});

describe("findFromRepository", () => {
    describe("when called", () => {
        it("should call method findWithProjection", () => {
            // Arrange
            const sendDataCallback = jest.fn();

            // Act
            tests.findFromRepository(sendDataCallback);

            // Assert
            expect(findWithProjection).toBeCalled();
        });
    });
});

describe("findNotifications", () => {
    describe("when called", () => {
        it("should call method findWithProjection", () => {
            // Arrange
            const sendDataCallback = jest.fn();

            // Act
            findNotifications(sendDataCallback);

            // Assert
            expect(findWithProjection).toBeCalled();
        });
    });
});
