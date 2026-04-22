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

export async function createTableSql(sql: string) {
    assertDdlOperationsEnabled();
    assertNotEmptySql(sql);
    assertNoForbiddenTokens(sql);
    assertStatementType(sql, 'CREATE_TABLE');

    try {
        const [result] = await pool.execute<ResultSetHeader>(sql);

        const output = {
            affectedRows: result.affectedRows,
            warningStatus: result.warningStatus,
            message: 'CREATE TABLE ejecutado correctamente.'
        };

        await auditEvent({
            action: 'create_table_sql',
            statementType: 'CREATE_TABLE',
            sqlPreview: getSqlPreview(sql),
            success: true
        });

        return output;
    } catch (error) {
        await auditEvent({
            action: 'create_table_sql',
            statementType: 'CREATE_TABLE',
            sqlPreview: getSqlPreview(sql),
            success: false,
            detail: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
}