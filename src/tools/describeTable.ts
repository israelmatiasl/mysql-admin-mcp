import { pool } from '../db/mysql.js';
import { RowDataPacket } from 'mysql2';

interface ColumnRow extends RowDataPacket {
    COLUMN_NAME: string;
    DATA_TYPE: string;
    COLUMN_TYPE: string;
    IS_NULLABLE: string;
    COLUMN_KEY: string;
    EXTRA: string;
    COLUMN_DEFAULT: string | null;
}

export async function describeTable(tableName: string) {
    const [rows] = await pool.query<ColumnRow[]>(
        `
      SELECT
        COLUMN_NAME,
        DATA_TYPE,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_KEY,
        EXTRA,
        COLUMN_DEFAULT
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `,
        [tableName]
    );

    return rows;
}