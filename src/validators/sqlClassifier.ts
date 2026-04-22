export type SqlStatementType =
    | 'SELECT'
    | 'INSERT'
    | 'UPDATE'
    | 'DELETE'
    | 'ALTER'
    | 'CREATE_TABLE'
    | 'CREATE_PROCEDURE'
    | 'CREATE_FUNCTION'
    | 'UNKNOWN';

function normalizeSql(sql: string): string {
    return sql
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/--.*$/gm, ' ')
        .replace(/#[^\n]*$/gm, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();
}

export function classifySql(sql: string): SqlStatementType {
    const normalized = normalizeSql(sql);

    if (normalized.startsWith('SELECT ')) return 'SELECT';
    if (normalized.startsWith('INSERT ')) return 'INSERT';
    if (normalized.startsWith('UPDATE ')) return 'UPDATE';
    if (normalized.startsWith('DELETE ')) return 'DELETE';
    if (normalized.startsWith('ALTER ')) return 'ALTER';
    if (normalized.startsWith('CREATE TABLE ')) return 'CREATE_TABLE';
    if (normalized.startsWith('CREATE PROCEDURE ')) return 'CREATE_PROCEDURE';
    if (normalized.startsWith('CREATE FUNCTION ')) return 'CREATE_FUNCTION';

    return 'UNKNOWN';
}

export function getSqlPreview(sql: string, maxLength = 180): string {
    const compact = sql.replace(/\s+/g, ' ').trim();
    return compact.length <= maxLength
        ? compact
        : `${compact.slice(0, maxLength)}...`;
}