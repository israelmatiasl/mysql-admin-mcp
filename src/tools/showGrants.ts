import { pool } from '../db/mysql.js';
import { RowDataPacket } from 'mysql2';

interface ShowGrantRow extends RowDataPacket {
    'Grants for': string;
}

export async function showGrants() {
    const [rows] = await pool.query<ShowGrantRow[]>(`SHOW GRANTS`);

    return rows.map((row: ShowGrantRow) => Object.values(row)[0]);
}