import exchangeRate from "./exchange-rate";

const getExchangeRates = async (exIds) => {
    const filter = {
        exId: { $in: exIds },
    };
    const projection = {
        _id: false,
        exId: true,
        code: true,
    };

    return exchangeRate.find(filter, projection).lean().exec();
};

export { getExchangeRates };

