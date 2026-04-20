import { pingDatabase } from '../db/mysql.js';
import { env } from '../config/env.js';

export async function health() {
    const dbReachable = await pingDatabase();

    return {
        ok: true,
        app: env.APP_NAME,
        version: env.APP_VERSION,
        database: {
            host: env.MYSQL_HOST,
            port: env.MYSQL_PORT,
            name: env.MYSQL_DATABASE,
            reachable: dbReachable
        }
    };
}