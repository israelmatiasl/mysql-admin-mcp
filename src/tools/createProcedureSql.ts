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

export async function createProcedureSql(sql: string) {
    assertRoutineOperationsEnabled();
    assertNotEmptySql(sql);
    assertNoForbiddenTokens(sql);
    assertStatementType(sql, 'CREATE_PROCEDURE');

    try {
        const [result] = await pool.execute<ResultSetHeader>(sql);

        const output = {
            affectedRows: result.affectedRows,
            warningStatus: result.warningStatus,
            message: 'CREATE PROCEDURE ejecutado correctamente.'
        };

        await auditEvent({
            action: 'create_procedure_sql',
            statementType: 'CREATE_PROCEDURE',
            sqlPreview: getSqlPreview(sql),
            success: true
        });

        return output;
    } catch (error) {
        await auditEvent({
            action: 'create_procedure_sql',
            statementType: 'CREATE_PROCEDURE',
            sqlPreview: getSqlPreview(sql),
            success: false,
            detail: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
}