import axios from "axios";
import Chance from "chance";
import { UserSession } from "jest-auto-fixture/src/models";
import { stubMongoose } from "jest-micro-auto-stub";
import { userSessions } from "sc-base-database";
import * as roundTimerHandler from "../../src/features/round-timer/round-timer-handler";
import { mongoEmitter } from "../../src/adapters/socket-adapter";
import appConfigs from "../../src/app-configs";
import emitEvents from "../../src/constants/emit-events";
import system from "../../src/constants/system";
import { authenticate } from "../../src/middleware/authorize-handler";

jest.mock("axios");
jest.mock("../../src/adapters/socket-adapter", () => ({
    mongoEmitter: {
        serverSideEmit: jest.fn(),
    },
}));
jest.mock("../../src/features/round-timer/round-timer-handler");
userSessions.findOne = stubMongoose(userSessions).findOne;
const session = UserSession({ system: 1 });
userSessions.findOne().lean().exec.mockResolvedValue(session);

const chance = new Chance();

describe("authenticate", () => {
    const socketClient = {
        request: { headers: { "user-agent": chance.string() } },
        handshake: {
            auth: {
                ss: chance.guid(),
                username: chance.name_prefix(),
            },
        },
        id: chance.guid(),
        data: {},
        emit: jest.fn(),
        disconnect: jest.fn(),
    };
    const next = jest.fn();

    afterEach(() => jest.clearAllMocks());
    roundTimerHandler.getRoundTimerGameOffered = jest.fn().mockReturnValueOnce([1, 2, 4]);

    it("should call authorize to user service", async () => {
        const actualRequest = {
            session: socketClient.handshake.auth.ss,
            username: socketClient.handshake.auth.username,
            browserUserAgent: socketClient.request.headers["user-agent"],
        };
        axios.post.mockResolvedValueOnce({ data: {} });

        await authenticate(socketClient, next);

        expect(axios.post).toBeCalledWith(`${appConfigs.userService.url}auth/session/verify`, actualRequest);
    });

    describe("when authorize failed", () => {
        it("should emit unauth to client", async () => {
            // Arrange
            const verifyResponse = { data: { isSuccessful: false } };
            axios.post.mockResolvedValueOnce(verifyResponse);

            // Act
            await authenticate(socketClient, next);

            // Assert
            expect(socketClient.emit).toBeCalledWith("auth", { authorized: false, ...verifyResponse.data });
        });

        it("should disconnect client", async () => {
            // Arrange
            axios.post.mockResolvedValueOnce({ data: { isSuccess: false } });

            // Act
            await authenticate(socketClient, next);

            // Assert
            expect(socketClient.disconnect).toBeCalledWith(true);
        });
    });

    describe("when authorize successful", () => {
        it("should call userSession findOne", async () => {
            // Arrange
            axios.post.mockResolvedValueOnce({ data: { isSuccessful: true } });

            // Act
            await authenticate(socketClient, next);

            // Assert
            expect(userSessions.findOne).toBeCalledWith({ sessionId: socketClient.handshake.auth.ss });
        });

        it("should call mongoEmitter.addClient", async () => {
            // Arrange
            axios.post.mockResolvedValueOnce({ data: { isSuccessful: true } });

            // Act
            await authenticate(socketClient, next);

            // Assert
            expect(mongoEmitter.serverSideEmit).toBeCalledWith(emitEvents.kickedOut, { UID: session.userId, sid: socketClient.id });
        });

        it("when session.system is instant shouldn't call mongoEmitter.addClient", async () => {
            // Arrange
            userSessions
                .findOne()
                .lean()
                .exec.mockResolvedValue(UserSession({ system: system.instant }));

            axios.post.mockResolvedValueOnce({ data: { isSuccessful: true } });

            // Act
            await authenticate(socketClient, next);

            // Assert
            expect(mongoEmitter.serverSideEmit).not.toBeCalledWith(emitEvents.kickedOut, { UID: session.userId, sid: socketClient.id });
        });

        it("should emit authorized to client", async () => {
            // Arrange
            const user = { username: chance.name_prefix(), memberId: chance.natural() };
            axios.post.mockResolvedValueOnce({ data: { isSuccessful: true, user } });

            // Act
            await authenticate(socketClient, next);

            // Assert
            expect(socketClient.emit).toBeCalledWith("auth", { authorized: true });
        });

        it("should call next", async () => {
            // Arrange
            const user = { username: chance.name_prefix(), memberId: chance.natural() };
            axios.post.mockResolvedValueOnce({ data: { isSuccessful: true, user } });

            // Act
            await authenticate(socketClient, next);

            // Assert
            expect(next).toBeCalled();
        });
    });
});
