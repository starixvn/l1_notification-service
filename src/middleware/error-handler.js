import { logger } from "sc-common";

const rejectionHandle = (err, promise) => {
    if (err && err instanceof Error) {
        logger.logError(err);
        console.log(err.message, err.stack);
    } else {
        logger.logError("unhandled rejection");
    }
};

export const registerErrorHandler = (process) => {
    process.on("unhandledRejection", rejectionHandle);
    process.on("uncaughtException", rejectionHandle);
    process.on("SIGTERM", rejectionHandle);
    process.on("SIGINT", rejectionHandle);
};
