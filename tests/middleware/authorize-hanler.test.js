import { authenticate } from "../../src/middleware/authorize-handler";
import axios from "axios";
import Chance from "chance";
import { userSessions } from "sc-base-database";
import { stubMongoose } from "jest-micro-auto-stub";
import * as socketClientHandler from "../../src/features/socket-clients/socket-client-handler";
import appConfigs from "../../src/app-configs";
import { UserSession } from "jest-auto-fixture/src/models";

jest.mock("axios");
jest.mock("../../src/features/socket-clients/socket-client-handler");
userSessions.findOne = stubMongoose(userSessions).findOne;
const session = UserSession();
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
        data: {},
        emit: jest.fn(),
        disconnect: jest.fn(),
    };
    const next = jest.fn();

    beforeEach(() => {
        userSessions.findOne().lean().exec.mockResolvedValueOnce(session);
    });

    it("should call authorize to user service", async () => {
        // Arrange
        const actualRequest = {
            session: socketClient.handshake.auth.ss,
            username: socketClient.handshake.auth.username,
            browserUserAgent: socketClient.request.headers["user-agent"],
        };
        axios.post.mockResolvedValueOnce({ data: {} });

        // Act
        await authenticate(socketClient, next);

        // Assert
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

        it("should call socketClientHandler.addClient", async () => {
            // Arrange
            axios.post.mockResolvedValueOnce({ data: { isSuccessful: true } });

            // Act
            await authenticate(socketClient, next);

            // Assert
            expect(socketClientHandler.addClient).toBeCalledWith(socketClient, session);
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
