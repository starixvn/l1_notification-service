import * as handler from "../../../src/features/um/um-handler";
import { logger } from "sc-common";
import * as socketClientHandler from "../../../src/features/socket-clients/socket-client-handler";
import Chance from "chance";

const chance = new Chance();
jest.mock("sc-common");
jest.mock("../../../src/features/socket-clients/socket-client-handler");

describe("umHandler", () => {
    const currentTime = Date.now();
    const currentUmCache = [
        {
            startTime: currentTime + 36000,
            endTime: chance.date(),
            isPartnerUm: false,
        },
        {
            startTime: currentTime,
            endTime: chance.date(),
            isPartnerUm: false,
        },
        {
            startTime: currentTime,
            endTime: chance.date(),
            isPartnerUm: true,
            partnerId: "SB",
        },
        {
            startTime: currentTime,
            endTime: chance.date(),
            isPartnerUm: true,
            partnerId: "SB1",
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        __rewire_reset_all__();
    });

    const req = {
        body: {
            isUM: chance.bool(),
            startTime: chance.date(),
            endTime: chance.date(),
            isPartnerUm: chance.bool(),
        },
    };

    describe("handleUmRequest", () => {
        const res = { send: jest.fn() };
        beforeEach(() => {
            handler.default.__set__("startUm", jest.fn());
            handler.default.__set__("stopUm", jest.fn());
        });

        it("should call logger.logError", () => {
            // Act
            handler.handleUmRequest(req, res);

            // Assert
            expect(logger.logError).toBeCalledWith(`UM Information: ${JSON.stringify(req.body)}`);
        });

        describe("when req.body is valid", () => {
            it("should call res.send", () => {
                // Act
                handler.handleUmRequest(req, res);

                // Assert
                expect(res.send).toBeCalledWith(req.body);
            });

            describe("when isUm true", () => {
                it("should call startUm", () => {
                    // Arrange
                    const request = { body: { IsUM: true } };
                    const startUmFunc = handler.default.__get__("startUm");

                    // Act
                    handler.handleUmRequest(request, res);

                    // Assert
                    expect(startUmFunc).toBeCalledWith(request.body);
                });
            });

            describe("when isUm false", () => {
                it("should call startUm", () => {
                    // Arrange
                    const request = { body: { IsUM: false } };
                    const stopUmFunc = handler.default.__get__("stopUm");

                    // Act
                    handler.handleUmRequest(request, res);

                    // Assert
                    expect(stopUmFunc).toBeCalledWith(request.body);
                });
            });
        });

        describe("when req.body is invalid", () => {
            it("should call res.send", () => {
                // Arrange
                const request = {};

                // Act
                handler.handleUmRequest(request, res);

                // Assert
                expect(res.send).toBeCalledWith("Cannot parse request object");
            });
        });
    });

    describe("startUm", () => {
        const startUmFunc = handler.default.__get__("startUm");
        const umInfo = {
            startTime: chance.date(),
            endTime: chance.date(),
            isUM: chance.bool(),
        };

        beforeEach(() => {
            handler.default.__set__("getFormattedUmInfo", jest.fn());
            handler.default.__set__("captureUmInfo", jest.fn());
            handler.default.__set__("kickOutUmAffectedUsers", jest.fn());
        });

        it("should call getFormattedUmInfo", () => {
            // Arrange
            const getFormattedUmInfoFunc = handler.default.__get__("getFormattedUmInfo");

            // Act
            startUmFunc(umInfo);

            // Assert
            expect(getFormattedUmInfoFunc).toBeCalledWith(umInfo);
        });

        it("should call captureUmInfo", () => {
            // Arrange
            const captureUmInfoFunc = handler.default.__get__("captureUmInfo");
            const formattedUmInfo = { ...umInfo, idOperatorUm: true };
            handler.default.__get__("getFormattedUmInfo").mockReturnValueOnce(formattedUmInfo);

            // Act
            startUmFunc(umInfo);

            // Assert
            expect(captureUmInfoFunc).toBeCalledWith(formattedUmInfo);
        });

        it("should call kickOutUmAffectedUsers", () => {
            // Arrange
            const kickOutUmAffectedUsersFunc = handler.default.__get__("kickOutUmAffectedUsers");

            // Act
            startUmFunc(umInfo);

            // Assert
            expect(kickOutUmAffectedUsersFunc).toBeCalled();
        });
    });

    describe("stopUm", () => {
        const testCases = [
            {
                umInfo: {
                    startTime: chance.date(),
                    endTime: chance.date(),
                    isPartnerUm: false,
                },
                expectResult: [currentUmCache[0], currentUmCache[2], currentUmCache[3]],
            },
            {
                umInfo: {
                    startTime: chance.date(),
                    endTime: chance.date(),
                    isPartnerUm: true,
                    partners: ["SB", "SB2"],
                },
                expectResult: [currentUmCache[0], currentUmCache[1], currentUmCache[3]],
            },
        ];

        beforeEach(() => {
            handler.default.__set__("umCache", [...currentUmCache]);
        });

        testCases.forEach(({ umInfo, expectResult }) => {
            it("should remove expired um on umCache", () => {
                // Arrange
                const stopUmFunc = handler.default.__get__("stopUm");

                // Act
                stopUmFunc(umInfo);

                // Assert
                expect(handler.default.__get__("umCache")).toStrictEqual(expectResult);
            });
        });
    });

    describe("getUmByPartner", () => {
        const getUmByPartnerFunc = handler.default.__get__("getUmByPartner");

        describe("when is sc um", () => {
            it("should return sc  um", () => {
                // Arrange
                handler.default.__set__("umCache", [...currentUmCache]);

                // Act
                const actualResult = getUmByPartnerFunc("SB");

                // Assert
                expect(actualResult).toStrictEqual(currentUmCache[0]);
            });
        });

        describe("when is NOT sc um", () => {
            it("should return partner um", () => {
                // Arrange
                handler.default.__set__("umCache", [currentUmCache[2], currentUmCache[3]]);

                // Act
                const actualResult = getUmByPartnerFunc("SB1");

                // Assert
                expect(actualResult).toStrictEqual(currentUmCache[3]);
            });
        });
    });

    describe("kickOutUm", () => {
        const kickOutUmFunc = handler.default.__get__("kickOutUm");
        const client = {
            UID: chance.guid(),
            socketClient: { emit: jest.fn(), id: chance.guid() },
        };
        const umInfo = {
            startTime: chance.date(),
            endTime: chance.date(),
        };

        beforeEach(() => {
            handler.default.__set__("disconnectUser", jest.fn());
        });

        it("should emit kickOut to client", () => {
            // Act
            kickOutUmFunc(client, umInfo);

            // Expect
            expect(client.socketClient.emit).toBeCalledWith("kickedOut", {
                message: "Game đang được bảo trì, vui lòng quay lại sau 10 phút.",
                umInfo: {
                    isUM: true,
                    startTime: umInfo.startTime,
                    endTime: umInfo.endTime,
                },
            });
        });

        it("should call socketClientHandler.disconnectUser", () => {
            // Arrange
            socketClientHandler.disconnectUser = jest.fn();

            // Act
            kickOutUmFunc(client, umInfo);

            // Expect
            expect(socketClientHandler.disconnectUser).toBeCalledWith(client.socketClient.id);
        });
    });

    describe("kickOutUmAffectedUsers", () => {
        const kickOutUmAffectedUsersFunc = handler.default.__get__("kickOutUmAffectedUsers");

        beforeEach(() => {
            socketClientHandler.getClients = jest.fn();
            handler.default.__set__("getUmByPartner", jest.fn());
            handler.default.__set__("kickOutUm", jest.fn());
        });

        it("should call socketClientHandler.getClients", () => {
            // Arrange
            socketClientHandler.getClients.mockReturnValueOnce([]);

            // Act
            kickOutUmAffectedUsersFunc();

            // Assert
            expect(socketClientHandler.getClients).toBeCalled();
        });

        describe("with each client", () => {
            const socketId = chance.guid();
            const clients = {
                [socketId]: { session: { partnerId: chance.string() } },
            };

            beforeEach(() => {
                socketClientHandler.getClients.mockReturnValueOnce({ ...clients });
            });

            it("should call getUmByPartner", () => {
                // Arrange
                const getUmByPartnerFunc = handler.default.__get__("getUmByPartner");

                // Act
                kickOutUmAffectedUsersFunc();

                // Assert
                expect(getUmByPartnerFunc).toBeCalledWith(clients[socketId].session.partnerId);
            });

            describe("when user's partner is um", () => {
                it("should call kickOutUm", () => {
                    // Arrange
                    const userUmInfo = { startTime: chance.date(), endTime: chance.date() };
                    const kickOutUmFunc = handler.default.__get__("kickOutUm");
                    handler.default.__get__("getUmByPartner").mockReturnValueOnce(userUmInfo);

                    // Act
                    kickOutUmAffectedUsersFunc();

                    // Assert
                    expect(kickOutUmFunc).toBeCalledWith(clients[socketId], userUmInfo);
                });
            });

            describe("when user's partner is NOT um", () => {
                it("should NOT call kickOutUm", () => {
                    // Arrange
                    const kickOutUmFunc = handler.default.__get__("kickOutUm");
                    handler.default.__get__("getUmByPartner").mockReturnValueOnce(undefined);

                    // Act
                    kickOutUmAffectedUsersFunc();

                    // Assert
                    expect(kickOutUmFunc).not.toBeCalled();
                });
            });
        });
    });

    describe("captureUmInfo", () => {
        const captureUmInfoFunc = handler.default.__get__("captureUmInfo");
        const umCache = handler.default.__get__("umCache");

        beforeEach(() => {
            umCache.push = jest.fn();
        });

        describe("when partner um", () => {
            const umInfo = {
                isPartnerUm: true,
                partners: [chance.string(), chance.string()],
                startTime: chance.date(),
                endTime: chance.date(),
            };

            umInfo.partners.forEach((partnerId) => {
                it("should add partner umInfo with each partner", () => {
                    // Act
                    captureUmInfoFunc(umInfo);

                    // Assert
                    expect(umCache.push).toBeCalledWith({ ...umInfo, partnerId, operatorId: partnerId });
                });
            });
        });

        describe("when sc um", () => {
            it("should add umInfo", () => {
                // Arrange
                const umInfo = {
                    isPartnerUm: false,
                    startTime: chance.date(),
                    endTime: chance.date(),
                };

                // Act
                captureUmInfoFunc(umInfo);

                // Assert
                expect(umCache.push).toBeCalledWith({ ...umInfo });
            });
        });
    });

    describe("getFormattedUmInfo", () => {
        const getFormattedUmInfoFunc = handler.default.__get__("getFormattedUmInfo");

        describe("when startTime & endTime is valid", () => {
            const umInfo = { IsPartnerUm: chance.bool(), StartTime: chance.date(), EndTime: chance.date() };

            it("should return correct format", () => {
                // Act
                const actualResult = getFormattedUmInfoFunc(umInfo);

                // Assert
                expect(actualResult).toStrictEqual({
                    startTime: new Date(umInfo.StartTime),
                    endTime: new Date(umInfo.EndTime),
                    isOperatorUm: umInfo.IsPartnerUm,
                    isPartnerUm: umInfo.IsPartnerUm,
                    partners: umInfo.Partners,
                });
            });
        });

        describe("when startTime & endTime is invalid", () => {
            const umInfo = { IsPartnerUm: chance.bool() };

            it("should return correct format", () => {
                // Act
                const actualResult = getFormattedUmInfoFunc(umInfo);

                // Assert
                expect(actualResult).toStrictEqual({
                    startTime: umInfo.StartTime,
                    endTime: umInfo.EndTime,
                    isOperatorUm: umInfo.IsPartnerUm,
                    isPartnerUm: umInfo.IsPartnerUm,
                    partners: umInfo.Partners,
                });
            });
        });
    });
});
