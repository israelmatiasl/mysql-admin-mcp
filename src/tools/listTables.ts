import { pool } from '../db/mysql.js';
import { RowDataPacket } from 'mysql2';

interface TableRow extends RowDataPacket {
    TABLE_NAME: string;
    TABLE_TYPE: string;
}

export async function listTables() {
    const [rows] = await pool.query<TableRow[]>(
        `
      SELECT
        TABLE_NAME,
        TABLE_TYPE
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `
    );

    return rows;
}