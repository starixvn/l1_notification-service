import { ExchangeRates } from "sc-base-database";

const getExchangeRates = async (exIds) => {
    const filter = {
        exId: { $in: exIds },
    };
    const projection = {
        _id: false,
        exId: true,
        code: true,
    };

    return ExchangeRates.find(filter, projection).lean().exec();
};

export { getExchangeRates };
