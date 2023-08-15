import axios from "axios";
import * as handler from "../../../src/features/round-timer/round-timer-handler";
import * as jackpotHandler from "../../../src/features/jackpots/jackpot-handler";
import * as lobbyRepository from "../../../src/features/lobby/lobby-repository";
import * as socketClientHandler from "../../../src/features/socket-clients/socket-client-handler";
import { logger } from "sc-common";
import Chance from "chance";

jest.mock("../../../src/features/socket-server/socket-server-handler");
jest.mock("../../../src/features/jackpots/jackpot-handler");
jest.mock("../../../src/features/lobby/lobby-repository");
jest.mock("../../../src/features/socket-clients/socket-client-handler");
jest.mock("sc-common");
jest.mock("axios");
const now = new Date("2019-05-14");
jest.useFakeTimers().setSystemTime(now);

const socketClient = {
    emit: jest.fn(),
};
const chance = new Chance();

describe("roundTimerHandler", () => {
    jest.spyOn(global.Date, "now").mockImplementationOnce(() => new Date("2019-05-14T11:01:58.135Z").valueOf());
    const getNow = () => new Date(Date.now());
    beforeEach(() => {
        handler.default.__set__("isGameOfferedRoundTimer", jest.fn());
        handler.default.__set__("sendAllUserExpectRoundTimer", jest.fn());
        handler.default.__set__("sendUserWhenOffered", jest.fn());
    });

    afterEach(() => {
        __rewire_reset_all__();
    });

    describe("handleRoundTimerWatcherData", () => {
        const body = { 3: { time: getNow() } };
        const req = { body };
        const res = { send: jest.fn() };
        it("should call broadcastAll", async () => {
            // Arrange
            await handler.default.__get__("sendAllUserExpectRoundTimer").mockResolvedValue(true);

            // Act
            await handler.handleRoundTimerWatcherData(req, res);

            // Assert
            expect(res.send).toBeCalledWith({ received: true });
            expect(logger.logError).not.toHaveBeenCalled();
        });

        it("should log error when an error occurs", async () => {
            // Arrange
            const mockError = new Error("Test error");
            await handler.default.__get__("sendAllUserExpectRoundTimer").mockImplementationOnce(() => {
                throw mockError;
            });

            // Act
            await handler.handleRoundTimerWatcherData(req, res);

            // Assert
            expect(logger.logError).toHaveBeenCalledWith(mockError);
        });
    });

    describe("getRoundTimerLatestData", () => {
        it("should emit latest data to client", async () => {
            // Arrange
            const currentTime = new Date(getNow().toUTCString());
            const latestData = {
                3: {
                    id: 1,
                    time: getNow(),
                },
                5: {
                    id: 3,
                    time: getNow(),
                },
            };
            const latestDataExpected = {
                3: {
                    id: 1,
                    time: getNow(),
                    timeFromStart: 0,
                },
                5: {
                    id: 3,
                    time: getNow(),
                    timeFromStart: 0,
                },
            };

            axios.get.mockResolvedValueOnce({ data: latestData });
            handler.default.__get__("isGameOfferedRoundTimer").mockResolvedValue(true);

            // Act
            await handler.getRoundTimerLatestData(socketClient);

            // Assert
            expect(socketClient.emit).toBeCalledWith("latestRoundTimer", latestDataExpected);
        });

        it("should log error when an error occurs", async () => {
            // Arrange
            const mockError = new Error("Error");
            const currentTime = new Date(getNow().toUTCString());
            const latestData = {
                3: {
                    id: 1,
                    time: getNow(),
                },
                5: {
                    id: 3,
                    time: getNow(),
                },
            };

            axios.get.mockResolvedValueOnce({ data: latestData });
            handler.default.__get__("isGameOfferedRoundTimer").mockImplementationOnce(() => {
                throw mockError;
            });

            // Act
            await handler.getRoundTimerLatestData(socketClient);

            // Assert
            expect(logger.logError).toHaveBeenCalledWith(mockError);
        });
    });

    describe("getRoundTimerGameOffered", () => {
        it("assign data to init round timer", async () => {
            // Arrange
            const mockSession = {
                siteName: "TestSite",
                partnerId: 123,
                currencyGroupId: 456,
            };

            const mockFetchedGamesOffered = [1, 2, 3];
            const mockFetchedLobby = {
                roundTimerGame: {
                    games: [
                        { id: 1, name: "Game1" },
                        { id: 2, name: "Game2" },
                    ],
                },
            };
            jackpotHandler.getOfferedGames.mockResolvedValue(mockFetchedGamesOffered);
            lobbyRepository.getLobbyConfigs.mockResolvedValue(mockFetchedLobby);

            // Act
            const result = await handler.getRoundTimerGameOffered(mockSession);

            // Assert
            expect(result).toEqual([1, 2]);
        });
    });

    describe("sendAllUserExpectRoundTimer", () => {
        const sendAllUserExpectRoundTimerFunc = handler.default.__get__("sendAllUserExpectRoundTimer");
        const payload = { gameId: chance.integer({ min: 1, max: 100 }) };

        beforeEach(() => {
            handler.default.__set__("sendUserWhenOffered", jest.fn());
            socketClientHandler.getClients = jest.fn();
        });

        it("should call partnerRepository.getSiteExclusions", async () => {
            // Arrange
            const data = { [chance.guid()]: {} };
            socketClientHandler.getClients.mockReturnValueOnce(data);

            // Act
            await sendAllUserExpectRoundTimerFunc(payload);

            // Assert
            expect(handler.default.__get__("sendUserWhenOffered")).toBeCalled();
        });
    });

    describe("sendUserWhenOffered", () => {
        const sendUserWhenOfferedFunc = handler.default.__get__("sendUserWhenOffered");
        const payload = { 1: { time: getNow() } };
        const client = {
            session: {},
            UID: chance.guid(),
            socketClient: { emit: jest.fn(), id: chance.guid() },
        };

        beforeEach(() => {
            handler.default.__set__("isGameOfferedRoundTimer", jest.fn());
        });

        describe("when session is valid", () => {
            it("should emit roundTimer to client", () => {
                // Arrange

                handler.default.__get__("isGameOfferedRoundTimer").mockReturnValueOnce(true);

                // Act
                sendUserWhenOfferedFunc(client, payload);

                // Assert
                expect(client.socketClient.emit).toBeCalledWith("roundTimer", payload);
            });
        });

        describe("when session is not valid", () => {
            it("should NOT emit roundTimer to client", () => {
                // Arrange
                const client = { socketClient: { emit: jest.fn(), id: chance.guid() } };

                // Act
                sendUserWhenOfferedFunc(client, payload);

                // Assert
                expect(client.socketClient.emit).not.toBeCalled();
            });
        });

        describe("when user is offered round timer", () => {
            it("should  emit roundTimer to client", () => {
                // Arrange
                handler.default.__get__("isGameOfferedRoundTimer").mockReturnValueOnce(true);

                // Act
                sendUserWhenOfferedFunc(client, payload);

                // Assert
                expect(client.socketClient.emit).toBeCalledWith("roundTimer", payload);
            });

            it("should NOT emit roundTimer to client", () => {
                // Arrange
                const client = { socketClient: { emit: jest.fn(), id: chance.guid() } };
                handler.default.__get__("isGameOfferedRoundTimer").mockReturnValueOnce(false);

                // Act
                sendUserWhenOfferedFunc(client, payload);

                // Assert
                expect(client.socketClient.emit).not.toBeCalled();
            });
        });
    });
});
