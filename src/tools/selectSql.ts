import { pool } from '../db/mysql.js';
import type { SqlParams } from '../db/sqlTypes.js';
import { auditEvent } from '../utils/audit.js';
import { getSqlPreview } from '../validators/sqlClassifier.js';
import {
    assertNoForbiddenTokens,
    assertNotEmptySql,
    assertSelectHasLimit,
    assertStatementType
} from '../validators/sqlSafety.js';

export async function selectSql(sql: string, params: SqlParams = []) {
    assertNotEmptySql(sql);
    assertNoForbiddenTokens(sql);
    assertStatementType(sql, 'SELECT');

    const safeSql = assertSelectHasLimit(sql);

    try {
        const [rows] = await pool.query(safeSql, params);

        await auditEvent({
            action: 'select_sql',
            statementType: 'SELECT',
            sqlPreview: getSqlPreview(safeSql),
            paramsCount: params.length,
            success: true
        });

        return rows;
    } catch (error) {
        await auditEvent({
            action: 'select_sql',
            statementType: 'SELECT',
            sqlPreview: getSqlPreview(safeSql),
            paramsCount: params.length,
            success: false,
            detail: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
}