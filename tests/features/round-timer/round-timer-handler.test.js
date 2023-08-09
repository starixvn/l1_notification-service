import axios from "axios";
import * as handler from "../../../src/features/round-timer/round-timer-handler";
import * as socketServerHandler from "../../../src/features/socket-server/socket-server-handler";
import * as jackpotHandler from "../../../src/features/jackpots/jackpot-handler";

jest.mock("../../../src/features/socket-server/socket-server-handler");
jest.mock("../../../src/features/jackpots/jackpot-handler");
jest.mock("axios");

describe("roundTimerHandler", () => {
    const body = { '3': { time: new Date() } };
    const req = { body };
    const res = { send: jest.fn() };

    describe("handleRoundTimerWatcherData", () => {
        it("should call socketClientHandler.broadcastAllClient", () => {
            // Arrange
            socketServerHandler.broadcastAll = jest.fn();
            jackpotHandler.isExcludeOnGame = jest.fn();
            const mockIsGameOfferedRoundTimer = jest.fn(() => true);
            mockIsGameOfferedRoundTimer

            // Act
            handler.handleRoundTimerWatcherData(req, res);

            // Assert
            expect(socketServerHandler.broadcastAll).toBeCalledWith("roundTimer", body);
        });

        it("should call res.send", () => {
            // Arrange
            socketServerHandler.broadcastAll = jest.fn();
            jackpotHandler.isExcludeOnGame = jest.fn()

            // Act
            handler.handleRoundTimerWatcherData(req, res);

            // Assert
            expect(res.send).toBeCalledWith({ received: true });
        });
    });

    describe("getRoundTimerLatestData", () => {
        const socketClient = {
            emit: jest.fn(),
        };
        const currentTime = new Date(new Date().toUTCString());

        const latestData = {
            '3': {
                id: 1,
                time: new Date(),
            },
            '5': {
                id: 3,
                time: new Date(),
            },
        
        };

        afterEach(() => {
            __rewire_reset_all__();
        });


        it("should emit latest data to client", () => {
            // Arrange
            axios.get.mockResolvedValueOnce({data: latestData});
            handler.default.__set__("isGameOfferedRoundTimer", jest.fn().mockResolvedValue(false));
          
            // Act
            handler.getRoundTimerLatestData(socketClient);

            // Assert
            expect(socketClient.emit).toBeCalledWith("latestRoundTimer", {});
        });
    });
});
