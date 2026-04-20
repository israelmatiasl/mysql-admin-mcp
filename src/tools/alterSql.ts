import type { ResultSetHeader } from 'mysql2';
import { pool } from '../db/mysql.js';
import { auditEvent } from '../utils/audit.js';
import { getSqlPreview } from '../validators/sqlClassifier.js';
import {
    assertDdlOperationsEnabled,
    assertNoForbiddenTokens,
    assertNotEmptySql,
    assertStatementType
} from '../validators/sqlSafety.js';

export async function alterSql(sql: string) {
    assertDdlOperationsEnabled();
    assertNotEmptySql(sql);
    assertNoForbiddenTokens(sql);
    assertStatementType(sql, 'ALTER');

    try {
        const [result] = await pool.execute<ResultSetHeader>(sql);

        const output = {
            affectedRows: result.affectedRows,
            warningStatus: result.warningStatus,
            message: 'ALTER ejecutado correctamente.'
        };

        await auditEvent({
            action: 'alter_sql',
            statementType: 'ALTER',
            sqlPreview: getSqlPreview(sql),
            success: true
        });

        return output;
    } catch (error) {
        await auditEvent({
            action: 'alter_sql',
            statementType: 'ALTER',
            sqlPreview: getSqlPreview(sql),
            success: false,
            detail: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
}