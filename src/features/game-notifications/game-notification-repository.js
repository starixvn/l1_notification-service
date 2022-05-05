import { curry } from "ramda";
import { gameNotifications } from "sc-base-database";

export const find = curry((projection, callback, filter) => gameNotifications.find(filter, projection, callback));
export const findWithProjection = find({ _id: false, __v: false, __archive: false });
