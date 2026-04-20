import { logInfo } from './logger.js';

export type AuditEvent = {
    action: string;
    statementType?: string;
    sqlPreview?: string;
    paramsCount?: number;
    affectedRows?: number;
    success: boolean;
    detail?: string;
};

export async function auditEvent(event: AuditEvent): Promise<void> {
    logInfo('AUDIT', event);
}