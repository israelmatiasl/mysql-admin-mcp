import { pool } from '../db/mysql.js';
import { RowDataPacket } from 'mysql2';

interface ShowCreateRow extends RowDataPacket {
    Table: string;
    'Create Table': string;
}

export async function showCreateTable(tableName: string) {
    const [rows] = await pool.query<ShowCreateRow[]>(
        `SHOW CREATE TABLE \`${tableName}\``
    );

    if (rows.length === 0) {
        throw new Error(`No se encontró la tabla "${tableName}".`);
    }

    return rows[0];
}