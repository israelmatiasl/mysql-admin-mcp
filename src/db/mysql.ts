import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import { env } from '../config/env.js';

export const pool: Pool = mysql.createPool({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
    multipleStatements: false
});

export async function pingDatabase(): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
        await connection.ping();
        return true;
    } finally {
        connection.release();
    }
}