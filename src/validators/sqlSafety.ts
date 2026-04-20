import { env } from '../config/env.js';
import { classifySql, type SqlStatementType } from './sqlClassifier.js';

const FORBIDDEN_TOKENS = [
    ' TRUNCATE ',
    ' GRANT ',
    ' REVOKE ',
    ' CREATE USER ',
    ' DROP USER ',
    ' RENAME USER ',
    ' SET PASSWORD ',
    ' FLUSH ',
    ' SHUTDOWN ',
    ' KILL ',
    ' LOCK TABLES ',
    ' UNLOCK TABLES '
];

function normalize(sql: string): string {
    return ` ${sql
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/--.*$/gm, ' ')
        .replace(/#[^\n]*$/gm, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase()} `;
}

export function assertNotEmptySql(sql: string): void {
    if (!sql.trim()) {
        throw new Error('El SQL no puede estar vacío.');
    }
}

export function assertNoForbiddenTokens(sql: string): void {
    const normalized = normalize(sql);

    for (const token of FORBIDDEN_TOKENS) {
        if (normalized.includes(token)) {
            throw new Error(`SQL no permitido: contiene "${token.trim()}"`);
        }
    }

    if (normalized.includes(' DELIMITER ')) {
        throw new Error('No uses DELIMITER. En drivers de MySQL no es necesario.');
    }
}

export function assertStatementType(
    sql: string,
    expected: SqlStatementType
): void {
    const actual = classifySql(sql);
    if (actual !== expected) {
        throw new Error(
            `Tipo de sentencia inválido. Esperado: ${expected}. Recibido: ${actual}.`
        );
    }
}

export function assertSelectHasLimit(sql: string): string {
    const trimmed = sql.trim().replace(/;+\s*$/, '');
    const hasLimit = /\bLIMIT\s+\d+(\s*,\s*\d+)?\s*$/i.test(trimmed);

    if (hasLimit) {
        return `${trimmed};`;
    }

    return `${trimmed} LIMIT ${env.MAX_SELECT_ROWS};`;
}

export function assertDestructiveOperationsEnabled(): void {
    if (!env.ENABLE_DESTRUCTIVE_OPERATIONS) {
        throw new Error(
            'Las operaciones destructivas están deshabilitadas por configuración.'
        );
    }
}

export function assertDdlOperationsEnabled(): void {
    if (!env.ENABLE_DDL_OPERATIONS) {
        throw new Error('Las operaciones DDL están deshabilitadas por configuración.');
    }
}

export function assertRoutineOperationsEnabled(): void {
    if (!env.ENABLE_ROUTINE_OPERATIONS) {
        throw new Error(
            'La creación de rutinas está deshabilitada por configuración.'
        );
    }
}