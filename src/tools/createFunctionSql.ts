import type { ResultSetHeader } from 'mysql2';
import { pool } from '../db/mysql.js';
import { auditEvent } from '../utils/audit.js';
import { getSqlPreview } from '../validators/sqlClassifier.js';
import {
    assertNoForbiddenTokens,
    assertNotEmptySql,
    assertRoutineOperationsEnabled,
    assertStatementType
} from '../validators/sqlSafety.js';

export async function createFunctionSql(sql: string) {
    assertRoutineOperationsEnabled();
    assertNotEmptySql(sql);
    assertNoForbiddenTokens(sql);
    assertStatementType(sql, 'CREATE_FUNCTION');

    try {
        const [result] = await pool.execute<ResultSetHeader>(sql);

        const output = {
            affectedRows: result.affectedRows,
            warningStatus: result.warningStatus,
            message: 'CREATE FUNCTION ejecutado correctamente.'
        };

        await auditEvent({
            action: 'create_function_sql',
            statementType: 'CREATE_FUNCTION',
            sqlPreview: getSqlPreview(sql),
            success: true
        });

        return output;
    } catch (error) {
        await auditEvent({
            action: 'create_function_sql',
            statementType: 'CREATE_FUNCTION',
            sqlPreview: getSqlPreview(sql),
            success: false,
            detail: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
}