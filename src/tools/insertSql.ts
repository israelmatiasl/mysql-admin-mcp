import { ResultSetHeader } from 'mysql2';
import type { SqlParams } from '../db/sqlTypes.js';
import { pool } from '../db/mysql.js';
import { auditEvent } from '../utils/audit.js';
import { getSqlPreview } from '../validators/sqlClassifier.js';
import {
    assertNoForbiddenTokens,
    assertNotEmptySql,
    assertStatementType
} from '../validators/sqlSafety.js';

export async function insertSql(sql: string, params: SqlParams = []) {
    assertNotEmptySql(sql);
    assertNoForbiddenTokens(sql);
    assertStatementType(sql, 'INSERT');

    try {
        const [result] = await pool.execute<ResultSetHeader>(sql, params);

        const output = {
            affectedRows: result.affectedRows,
            insertId: result.insertId,
            warningStatus: result.warningStatus
        };

        await auditEvent({
            action: 'insert_sql',
            statementType: 'INSERT',
            sqlPreview: getSqlPreview(sql),
            paramsCount: params.length,
            affectedRows: result.affectedRows,
            success: true
        });

        return output;
    } catch (error) {
        await auditEvent({
            action: 'insert_sql',
            statementType: 'INSERT',
            sqlPreview: getSqlPreview(sql),
            paramsCount: params.length,
            success: false,
            detail: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
}