import * as handler from "../../../src/features/metrics/metric-handler";
import * as metrics from "../../../src/metrics";
import appConfigs from "../../../src/app-configs";
import Chance from "chance";

jest.mock("../../../src/metrics");

const chance = new Chance();

describe("metricHandler", () => {
    describe("handleMetrics", () => {
        const metricResult = chance.string();
        const res = { send: jest.fn() };

        beforeEach(() => {
            jest.clearAllMocks();
            __rewire_reset_all__();

            metrics.getMetrics.mockReturnValueOnce(metricResult);
        });

        describe("when query secret key is valid", () => {
            it("should send metrics", () => {
                // Arrange
                const req = { query: { secretKey: appConfigs.metrics.secretKey } };

                // Act
                handler.handleMetrics(req, res);

                // Assert
                expect(res.send).toBeCalledWith(metricResult);
            });
        });

        describe("when query secret key is invalid", () => {
            it("should send error", () => {
                // Arrange
                const req = undefined;

                // Act
                handler.handleMetrics(req, res);

                // Assert
                expect(res.send).toBeCalledWith({ error: true });
            });
        });
    });
});
