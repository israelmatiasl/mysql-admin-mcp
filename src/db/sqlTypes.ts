import * as z from 'zod';

export type SqlParam =
    | string
    | number
    | boolean
    | Buffer
    | null;

export type SqlParams = SqlParam[];

export const sqlParamSchema = z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null()
]);

export const sqlParamsSchema = z.array(sqlParamSchema);