import { ResultSetHeader } from 'mysql2';
import type { SqlParams } from '../db/sqlTypes.js';
import { pool } from '../db/mysql.js';
import { auditEvent } from '../utils/audit.js';
import { getSqlPreview } from '../validators/sqlClassifier.js';
import {
    assertDestructiveOperationsEnabled,
    assertNoForbiddenTokens,
    assertNotEmptySql,
    assertStatementType
} from '../validators/sqlSafety.js';

export async function deleteSql(sql: string, params: SqlParams = []) {
    assertDestructiveOperationsEnabled();
    assertNotEmptySql(sql);
    assertNoForbiddenTokens(sql);
    assertStatementType(sql, 'DELETE');

    try {
        const [result] = await pool.execute<ResultSetHeader>(sql, params);

        const output = {
            affectedRows: result.affectedRows,
            warningStatus: result.warningStatus
        };

        await auditEvent({
            action: 'delete_sql',
            statementType: 'DELETE',
            sqlPreview: getSqlPreview(sql),
            paramsCount: params.length,
            affectedRows: result.affectedRows,
            success: true
        });

        return output;
    } catch (error) {
        await auditEvent({
            action: 'delete_sql',
            statementType: 'DELETE',
            sqlPreview: getSqlPreview(sql),
            paramsCount: params.length,
            success: false,
            detail: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
}