import axios from "axios";
import * as handler from "../../../src/features/round-timer/round-timer-handler";
import { broadcastAll } from "../../../src/features/socket-server/socket-server-handler";
import * as partnerConfigRepository from "../../../src/features/jackpots/partner-config-repository";
import * as jackpotHandler from "../../../src/features/jackpots/jackpot-handler";
import * as lobbyRepository from "../../../src/features/lobby/lobby-repository";
import { logger } from "sc-common";

jest.mock("../../../src/features/socket-server/socket-server-handler");
jest.mock("../../../src/features/jackpots/partner-config-repository");
jest.mock("../../../src/features/jackpots/jackpot-handler");
jest.mock("../../../src/features/lobby/lobby-repository");
jest.mock("sc-common");
jest.mock("axios");
const now = new Date("2019-05-14");
jest.useFakeTimers().setSystemTime(now);

const socketClient = {
    emit: jest.fn(),
};

describe("roundTimerHandler", () => {
    jest.spyOn(global.Date, "now").mockImplementationOnce(() => new Date("2019-05-14T11:01:58.135Z").valueOf());
    const getNow = () => new Date(Date.now());
    beforeEach(() => {
        handler.default.__set__("isGameOfferedRoundTimer", jest.fn());
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
            await handler.default.__get__("isGameOfferedRoundTimer").mockResolvedValue(true);

            // Act
            await handler.handleRoundTimerWatcherData(req, res);

            // Assert
            expect(broadcastAll).toBeCalledWith("roundTimer", body);
            expect(res.send).toBeCalledWith({ received: true });
            expect(logger.logError).not.toHaveBeenCalled();
        });

        it("should log error when an error occurs", async () => {
            // Arrange
            const mockError = new Error("Test error");
            await handler.default.__get__("isGameOfferedRoundTimer").mockImplementationOnce(() => {
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
    });

    describe("initDataBySession", () => {
        it("assign data to init round timer", async () => {
            // Arrange
            const mockSession = {
                siteName: "TestSite",
                partnerId: 123,
                currencyGroupId: 456,
            };

            const mockFetchedSiteExclusions = { value: { 1: ["TestSite"] } };
            const mockFetchedGamesOffered = [1, 2, 3];
            const mockFetchedLobby = {
                roundTimerGame: {
                    games: [
                        { id: 1, name: "Game1" },
                        { id: 2, name: "Game2" },
                    ],
                },
            };

            partnerConfigRepository.getSiteExclusionByPartner.mockResolvedValue(mockFetchedSiteExclusions);
            jackpotHandler.getOfferedGames.mockResolvedValue(mockFetchedGamesOffered);
            lobbyRepository.getLobbyConfigs.mockResolvedValue(mockFetchedLobby);

            // Act
            await handler.initDataBySession(mockSession);

            // Assert
            expect(handler.default.__get__("gamesOffered")).toEqual(mockFetchedGamesOffered);
            expect(handler.default.__get__("roundTimerGame")).toEqual(mockFetchedLobby.roundTimerGame);
            expect(handler.default.__get__("siteNameExclusion")).toEqual(mockSession.siteName);
            expect(handler.default.__get__("partnerSiteExclusions")).toEqual(mockFetchedSiteExclusions);
        });
    });
});
