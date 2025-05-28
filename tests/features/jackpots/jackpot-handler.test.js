import Chance from "chance";
import { UserSession } from "jest-auto-fixture/src/models/index";
import { stubMongoose } from "jest-micro-auto-stub";
import { userInfos } from "sc-base-database";
import { logger } from "sc-common";
import { mongoEmitter } from "../../../src/adapters/socket-adapter";
import emitEvents from "../../../src/constants/emit-events";
import * as currencyRepository from "../../../src/features/jackpots/currency-repository";
import { getJackpotConfigs } from "../../../src/features/jackpots/jackpot-configs";
import * as handler from "../../../src/features/jackpots/jackpot-handler";
import * as jackpotRepository from "../../../src/features/jackpots/jackpot-repository";
import * as partnerConfigRepository from "../../../src/features/jackpots/partner-config-repository";

jest.mock("../../../src/adapters/socket-adapter", () => ({
    mongoEmitter: {
        serverSideEmit: jest.fn(),
    },
}));
jest.mock("../../../src/features/jackpots/currency-repository");
jest.mock("../../../src/features/jackpots/partner-config-repository");
jest.mock("../../../src/features/jackpots/jackpot-repository", () => ({
    getRunningPools: jest.fn(() => []),
    getJackPotWinners: jest.fn(() => []),
}));

jest.mock("../../../src/features/jackpots/exchange-rate-repository", () => ({
    getExchangeRates: jest.fn(() => []),
}));
jest.mock("sc-common");
userInfos.find = stubMongoose(userInfos).find;

jest.mock("../../../src/features/jackpots/jackpot-configs", () => ({
    getJackpotConfigs: jest.fn(() => []),
}));

const chance = new Chance();
const socketClient = {
    id: chance.guid(),
    emit: jest.fn(),
    data: {
        session: {
            disableJackpotGames: false,
            currencyCode: "US",
            operatorId: "operator",
            siteName: "site",
        },
    },
};

describe("jackpotHandler", () => {
    beforeEach(() => {
        __rewire_reset_all__();
        jest.clearAllMocks();
    });

    describe("getWinners", () => {
        const limit = chance.integer({ min: 1, max: 500 });

        beforeEach(() => {
            handler.default.__set__(
                "getOfferedGames",
                jest.fn(() => [])
            );
            handler.default.__set__(
                "getJackpotWinnersMapAvatar",
                jest.fn(() => [])
            );
        });

        it("should call getOfferGames", async () => {
            // Arrange
            const getOfferedGamesFunc = handler.default.__get__("getOfferedGames");
            getOfferedGamesFunc.mockResolvedValueOnce([]);
            jackpotRepository.getJackPotWinners.mockResolvedValueOnce([]);
            // Act
            await handler.getWinners(socketClient, { limit });

            // Assert
            expect(getOfferedGamesFunc).toBeCalledWith(socketClient.data.session);
        });

        it("should call jackpotRepository.getJackpotWinners", async () => {
            //Arrange
            const offerGameIds = chance.unique(chance.integer, chance.integer({ min: 0, max: 100 }), { min: 0, max: 100 });
            const offerGames = offerGameIds.map((gameId) => ({ gameId, stakeLevels: [{}, {}, {}] }));
            const getOfferedGamesFunc = handler.default.__get__("getOfferedGames");
            getOfferedGamesFunc.mockResolvedValueOnce(offerGames);
            jackpotRepository.getJackPotWinners.mockResolvedValueOnce([]);
            // Act
            await handler.getWinners(socketClient, { limit });

            // Assert
            expect(jackpotRepository.getJackPotWinners).toBeCalledWith(
                offerGameIds,
                limit,
                socketClient.data.session.operatorId,
                socketClient.data.session.siteName
            );
        });

        it("should call getJackpotWinnersMapAvatar", async () => {
            // Arrange
            const getOfferedGamesFunc = handler.default.__get__("getOfferedGames");
            getOfferedGamesFunc.mockResolvedValueOnce([]);
            const getJackpotWinnersMapAvatarFunc = handler.default.__get__("getJackpotWinnersMapAvatar");
            const winners = getFakeJackpotWinners();
            jackpotRepository.getJackPotWinners.mockResolvedValueOnce(winners);
            getJackpotWinnersMapAvatarFunc.mockResolvedValueOnce(winners);

            // Act
            await handler.getWinners(socketClient, { limit });

            // Assert
            expect(getJackpotWinnersMapAvatarFunc).toBeCalledWith(winners);
        });

        it("should emit jackpotWinners to client", async () => {
            // Arrange
            const getOfferedGamesFunc = handler.default.__get__("getOfferedGames");
            getOfferedGamesFunc.mockResolvedValueOnce([]);
            const winners = getFakeJackpotWinners();
            const getJackpotWinnersMapAvatarFunc = handler.default.__get__("getJackpotWinnersMapAvatar");
            jackpotRepository.getJackPotWinners.mockResolvedValueOnce(winners);
            getJackpotWinnersMapAvatarFunc.mockResolvedValueOnce(winners);

            // Act
            await handler.getWinners(socketClient, { limit });

            // Assert
            expect(socketClient.emit).toBeCalledWith("jackpotWinners", winners);
        });

        it("should emit jackpotWinners without winners to client", async () => {
            // Arrange
            const socket = {
                ...socketClient,
                ...{
                    data: {
                        session: {
                            currencyCode: "US",
                            disableJackpotGames: true,
                        },
                    },
                },
            };

            const getOfferedGamesFunc = handler.default.__get__("getOfferedGames");
            getOfferedGamesFunc.mockResolvedValueOnce([]);
            const getJackpotWinnersMapAvatarFunc = handler.default.__get__("getJackpotWinnersMapAvatar");
            getJackpotWinnersMapAvatarFunc.mockResolvedValueOnce([]);

            // Act
            await handler.getWinners(socket, { limit });

            // Assert
            expect(socket.emit).toBeCalledWith("jackpotWinners", []);
        });
    });

    describe("getPools", () => {
        beforeEach(() => {
            handler.default.__set__("getOfferedGames", jest.fn());
        });

        it("should call getOfferGames", async () => {
            // Arrange
            const getOfferedGamesFunc = handler.default.__get__("getOfferedGames");
            getOfferedGamesFunc.mockResolvedValueOnce([]);

            // Act
            await handler.getPools(socketClient);

            // Assert
            expect(getOfferedGamesFunc).toBeCalledWith(socketClient.data.session);
        });

        it("should call jackpotRepository.getRunningPools", async () => {
            // Arrange
            const offerGameIds = chance.unique(chance.integer, chance.integer({ min: 0, max: 100 }), { min: 0, max: 100 });
            const offerGames = offerGameIds.map((gameId) => ({ gameId, stakeLevels: [{}, {}, {}] }));
            handler.default.__get__("getOfferedGames").mockResolvedValueOnce(offerGames);

            // Act
            await handler.getPools(socketClient);

            // Assert
            expect(jackpotRepository.getRunningPools).toBeCalledWith(
                offerGameIds,
                socketClient.data.session.operatorId,
                socketClient.data.session.siteName
            );
        });

        it("should emit jackpotPools to client", async () => {
            // Arrange
            const getOfferedGamesFunc = handler.default.__get__("getOfferedGames");
            getOfferedGamesFunc.mockResolvedValueOnce([]);
            const numOfPools = chance.integer({ min: 1, max: 10 });
            const runningPools = [...new Array(numOfPools)].map(() => ({
                gameId: chance.integer({ min: 1, max: 100 }),
                pool: chance.integer({ min: 1, max: 50 }),
                amount: chance.natural(),
            }));
            jackpotRepository.getRunningPools.mockResolvedValueOnce(runningPools);

            // Act
            await handler.getPools(socketClient);

            // Assert
            expect(socketClient.emit).toBeCalledWith("jackpotPools", runningPools);
        });

        it("should emit jackpotPoolsOnGame to client", async () => {
            // Arrange
            const socket = {
                ...socketClient,
                ...{
                    data: {
                        session: {
                            currencyCode: "US",
                            disableJackpotGames: true,
                        },
                    },
                },
            };

            const getOfferedGamesFunc = handler.default.__get__("getOfferedGames");
            const payload = { gameId: 2 };
            getOfferedGamesFunc.mockResolvedValueOnce([]);

            // Act
            await handler.getPools(socket, payload);

            // Assert
            expect(socket.emit).toBeCalledWith("jackpotPoolsOnGame", []);
        });

        it("should emit jackpotPoolsOnGame with jackpotPools to client", async () => {
            // Arrange
            const payload = { gameId: 2 };
            const offerGameIds = chance.unique(chance.integer, chance.integer({ min: 0, max: 100 }), { min: 0, max: 100 });
            const offerGames = offerGameIds.map((gameId) => ({ gameId, stakeLevels: [{}, {}, {}] }));
            handler.default.__get__("getOfferedGames").mockResolvedValueOnce(offerGames);
            const numOfPools = chance.integer({ min: 1, max: 10 });
            const jackpotPools = [...new Array(numOfPools)].map(() => ({
                stakeLevels: [{ stake: 1, jackpot: 5000, botRatio: 40 }],
                gameId: chance.integer({ min: 1, max: 100 }),
                pool: chance.integer({ min: 1, max: 50 }),
                amount: chance.natural(),
            }));
            jackpotRepository.getRunningPools.mockResolvedValueOnce(jackpotPools);
            // Act
            await handler.getPools(socketClient, payload);

            // Assert
            expect(socketClient.emit).toBeCalledWith("jackpotPoolsOnGame", jackpotPools);
        });
    });

    describe("notifyJackpotWinner", () => {
        const req = { body: {} };
        const res = { send: jest.fn() };

        beforeEach(() => {
            handler.default.__set__("validateParams", jest.fn());
            handler.default.__set__("sendAllUserExceptExclusionSite", jest.fn());
        });

        it("should call validateParams", () => {
            // Arrange
            const validateParamsFunc = handler.default.__get__("validateParams");

            // Act
            handler.notifyJackpotWinner(req, res);

            // Assert
            expect(validateParamsFunc).toBeCalledWith(req.body);
        });

        describe("when request params is valid", () => {
            beforeEach(() => {
                handler.default.__get__("validateParams").mockReturnValueOnce(true);
            });

            it("should call mongoEmitter.serverSideEmit", () => {
                // Act
                handler.notifyJackpotWinner(req, res);

                // Assert
                expect(mongoEmitter.serverSideEmit).toBeCalledWith(emitEvents.jackpotWinner, req.body);
            });

            it("should send received message to client", () => {
                // Act
                handler.notifyJackpotWinner(req, res);

                // Assert
                expect(res.send).toBeCalledWith({ received: true });
            });
        });
    });

    describe("validateParams", () => {
        const validateParamsFunc = handler.default.__get__("validateParams");
        const validParams = {
            gameId: chance.integer({ min: 1, max: 100 }),
            pool: chance.pickone(["minor", "major", "grand"]),
            winnerName: chance.name_suffix(),
            amount: chance.natural(),
        };
        describe("when params is valid", () => {
            it("should return true", () => {
                // Act
                const actualResult = validateParamsFunc(validParams);

                // Assert
                expect(actualResult).toBeTruthy();
            });
        });

        describe("when params is not valid", () => {
            const testCases = [
                { failure: "gameId", params: { ...validParams, gameId: undefined } },
                { failure: "pool", params: { ...validParams, pool: undefined } },
                { failure: "winnerName", params: { ...validParams, winnerName: undefined } },
                { failure: "amount", params: { ...validParams, amount: undefined } },
            ];

            testCases.forEach(({ failure, params }) => {
                describe(`when ${failure} is not valid`, () => {
                    it("should return false", () => {
                        // Act
                        const actualResult = validateParamsFunc(params);

                        // Assert
                        expect(actualResult).toBeFalsy();
                    });

                    it("should log critical", () => {
                        // Act
                        validateParamsFunc(params);

                        // Assert
                        expect(logger.logCritical).toBeCalledWith(
                            `The jackpot winner information is invalid, details: ${JSON.stringify(params)}`
                        );
                    });
                });
            });
        });
    });

    describe("sendJackpotWinnerWhenNotExcluded", () => {
        const sendJackpotWinnerWhenNotExcludedFunc = handler.default.__get__("sendJackpotWinnerWhenNotExcluded");
        const payload = { gameId: chance.integer({ min: 1, max: 100 }), operatorId: "operator", jackpotConfigId: chance.guid() };

        beforeEach(() => {
            handler.default.__set__("isExcludeOnGame", jest.fn());
        });

        describe("when session is not valid", () => {
            it("should NOT emit jackpotWinners to client", () => {
                // Arrange
                const client = { ...socketClient, data: {} };

                // Act
                sendJackpotWinnerWhenNotExcludedFunc(client, payload);

                // Assert
                expect(client.emit).not.toBeCalled();
            });
        });

        describe("when user is excluded on game", () => {
            it("should NOT emit jackpotWinners to client", () => {
                // Arrange
                handler.default.__get__("isExcludeOnGame").mockReturnValueOnce(true);

                // Act
                sendJackpotWinnerWhenNotExcludedFunc(socketClient, payload);

                // Assert
                expect(socketClient.emit).not.toBeCalled();
            });
        });

        describe("when session is valid and user is NOT excluded on game", () => {
            const partnerId = chance.string();
            const siteName = chance.url();
            const session = UserSession({ partnerId, siteName });
            session.operatorId = payload.operatorId;
            const client = {
                data: {
                    session,
                },
                emit: jest.fn(),
            };

            beforeEach(() => {
                handler.default.__get__("isExcludeOnGame").mockReturnValueOnce(false);
            });

            describe("when is NOT offered game", () => {
                it("should NOT call getOfferedGames ", async () => {
                    // Arrange
                    handler.default.__set__("getOfferedGames", jest.fn().mockResolvedValueOnce([]));
                    // Act
                    await sendJackpotWinnerWhenNotExcludedFunc(client, payload);

                    // Assert
                    expect(client.emit).not.toBeCalled();
                });
            });

            describe("when isOffered game", () => {
                it("should call getOfferedGames ", async () => {
                    // Arrange
                    handler.default.__set__("getOfferedGames", jest.fn().mockResolvedValueOnce([{ gameId: payload.gameId }]));
                    getJackpotConfigs.mockResolvedValueOnce([{ _id: payload.jackpotConfigId }]);
                    // Act
                    await sendJackpotWinnerWhenNotExcludedFunc(client, payload);

                    // Assert
                    expect(client.emit).toBeCalledWith("jackpotWinner", payload);
                });
            });
        });
    });

    describe("getOfferedGames", () => {
        const getOfferedGamesFunc = handler.default.__get__("getOfferedGames");
        const session = UserSession();

        beforeEach(() => {
            handler.default.__set__("getGamesExcludedByPartnerSite", jest.fn());
            currencyRepository.getCurrencyGroup = jest.fn();
            currencyRepository.getCurrency = jest.fn();
            currencyRepository.getOfferedGames = jest.fn();
        });

        it("should be call currencyRepository.getCurrencyGroup", async () => {
            // Act
            await getOfferedGamesFunc(session);

            // Assert
            expect(currencyRepository.getCurrencyGroup).toBeCalledWith(session.currencyGroupId);
        });

        it("should be call currencyRepository.getCurrency", async () => {
            // Act
            await getOfferedGamesFunc(session);

            // Assert
            expect(currencyRepository.getCurrency).toBeCalledWith(session.currencyName, session.partnerId);
        });

        describe("when currency is disabled", () => {
            it("should return empty array", async () => {
                // Arrange
                currencyRepository.getCurrencyGroup.mockResolvedValueOnce({ enabled: true });
                currencyRepository.getCurrency.mockResolvedValueOnce({ enabled: false });

                // Act
                const actualResult = await getOfferedGamesFunc(session);

                // Assert
                expect(actualResult.length).toBe(0);
            });
        });

        describe("when currency group is disabled", () => {
            it("should return empty array", async () => {
                // Arrange
                currencyRepository.getCurrencyGroup.mockResolvedValueOnce({ enabled: false });
                currencyRepository.getCurrency.mockResolvedValueOnce({ enabled: true });

                // Act
                const actualResult = await getOfferedGamesFunc(session);

                // Assert
                expect(actualResult.length).toBe(0);
            });
        });

        describe("when currency and currency group is enabled", () => {
            beforeEach(() => {
                currencyRepository.getCurrencyGroup.mockResolvedValueOnce({ enabled: true });
                currencyRepository.getCurrency.mockResolvedValueOnce({ enabled: true });
                handler.default.__set__("getGamesExcludedByPartnerSite", jest.fn().mockResolvedValueOnce([]));
            });

            it("should call currencyRepository.getOfferedGames", async () => {
                // Act
                await getOfferedGamesFunc(session);

                // Assert
                expect(currencyRepository.getOfferedGames).toBeCalledWith(session.currencyGroupId);
            });

            it("should call getGamesExcludedByPartnerSite", async () => {
                // Arrange
                const getGamesExcludedByPartnerSiteFunc = handler.default.__get__("getGamesExcludedByPartnerSite");

                // Act
                await getOfferedGamesFunc(session);

                // Assert
                expect(getGamesExcludedByPartnerSiteFunc).toBeCalledWith(session.partnerId, session.siteName);
            });

            describe("when session.disableJackpotGames is false", () => {
                it("should return group offered games which is not excluded on site", async () => {
                    // Arrange
                    const offeredGames = [
                        { gameId: 1, gameName: "1" },
                        { gameId: 3, gameName: "3" },
                        { gameId: 29, gameName: "29" },
                    ];
                    currencyRepository.getOfferedGames.mockResolvedValueOnce(offeredGames);
                    handler.default.__get__("getGamesExcludedByPartnerSite").mockResolvedValueOnce([2]);

                    // Act
                    const actualResult = await getOfferedGamesFunc(session);

                    // Assert
                    expect(actualResult).toStrictEqual(offeredGames);
                });
            });
        });
    });

    describe("getGamesExcludedByPartnerSite", () => {
        const getGamesExcludedByPartnerSiteFunc = handler.default.__get__("getGamesExcludedByPartnerSite");
        const partnerId = chance.string();
        const siteName = chance.url().toLowerCase();

        beforeEach(() => {
            partnerConfigRepository.getSiteExclusionByPartner = jest.fn();
        });

        it("should call partnerConfigRepository.getSiteExclusionByPartner", async () => {
            // Act
            await getGamesExcludedByPartnerSiteFunc(partnerId, siteName);

            // Assert
            expect(partnerConfigRepository.getSiteExclusionByPartner).toBeCalledWith(partnerId);
        });

        it("should return games excluded by site", async () => {
            // Arrange
            partnerConfigRepository.getSiteExclusionByPartner.mockResolvedValueOnce({
                value: {
                    1: ["abc.com"],
                    2: [siteName, "bbc.com"],
                    3: [siteName],
                },
            });

            // Act
            const actualResult = await getGamesExcludedByPartnerSiteFunc(partnerId, siteName);

            // Assert
            expect(actualResult).toStrictEqual([2, 3]);
        });
    });

    describe("getJackpotWinnersMapAvatar", () => {
        const getJackpotWinnersMapAvatarsFunc = handler.default.__get__("getJackpotWinnersMapAvatar");

        it("should call userInfos.find", async () => {
            // Assert
            const winners = getFakeJackpotWinners();
            const winnerNames = winners.map((winner) => winner.winnerName);
            userInfos.find().lean().exec.mockResolvedValueOnce([]);

            // Act
            await getJackpotWinnersMapAvatarsFunc(winners);

            // Assert
            expect(userInfos.find).toBeCalledWith(
                { name: { $in: winnerNames } },
                {
                    _id: false,
                    name: true,
                    avatarId: true,
                }
            );
        });

        it("should return winner with avatarId", async () => {
            // Assert
            const winners = getFakeJackpotWinners();
            const avatarId = chance.integer({ min: 1, max: 200 });
            const winnerNames = winners.map((winner) => winner.winnerName);
            userInfos
                .find()
                .lean()
                .exec.mockResolvedValueOnce([{ name: winnerNames[0], avatarId }]);

            // Act
            const actualResult = await getJackpotWinnersMapAvatarsFunc(winners);

            // Assert
            expect(actualResult[0].avatarId).toBe(avatarId);
        });

        it("should return winner with calculated amount", async () => {
            // Assert
            const winners = getFakeJackpotWinners();
            const avatarId = chance.integer({ min: 1, max: 200 });
            const winnerNames = winners.map((winner) => winner.winnerName);
            winners[0].amount = 100;
            userInfos
                .find()
                .lean()
                .exec.mockResolvedValueOnce([{ name: winnerNames[0], avatarId }]);

            // Act
            const actualResult = await getJackpotWinnersMapAvatarsFunc(winners);

            // Assert
            expect(actualResult[0].amount).toEqual(100);
        });
    });
});

const getFakeJackpotWinners = (isHavingAvatar = false) => {
    const numOfWinners = chance.integer({ min: 1, max: 20 });

    return [...new Array(numOfWinners)].map(() => ({
        gameId: chance.integer({ min: 1, max: 100 }),
        pool: chance.integer({ min: 1, max: 200 }),
        amount: chance.natural(),
        winnerName: chance.name_suffix(),
        avatarId: isHavingAvatar ? chance.integer({ min: 1, max: 100 }) : undefined,
    }));
};

const getFakeSiteValue = (number, siteName) => {
    return [...new Array(number + 1)].map(() => [siteName]);
};
