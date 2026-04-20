import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';

import { env } from './config/env.js';
import { health } from './tools/health.js';
import { listTables } from './tools/listTables.js';
import { describeTable } from './tools/describeTable.js';
import { showCreateTable } from './tools/showCreateTable.js';
import { selectSql } from './tools/selectSql.js';
import { insertSql } from './tools/insertSql.js';
import { updateSql } from './tools/updateSql.js';
import { deleteSql } from './tools/deleteSql.js';
import { alterSql } from './tools/alterSql.js';
import { createProcedureSql } from './tools/createProcedureSql.js';
import { createFunctionSql } from './tools/createFunctionSql.js';
import { showGrants } from './tools/showGrants.js';
import { sqlParamsSchema } from './db/sqlTypes.js';

function textResult(data: unknown) {
    return {
        content: [
            {
                type: 'text' as const,
                text: JSON.stringify(data, null, 2)
            }
        ],
        structuredContent:
            typeof data === 'object' && data !== null ? { ...data } : { value: data }
    };
}

export function createServer(): McpServer {
    const server = new McpServer(
        {
            name: env.APP_NAME,
            version: env.APP_VERSION
        },
        {
            instructions:
                [
                    'Este servidor administra MySQL sobre la base configurada.',
                    'Usa list_tables y describe_table antes de ejecutar cambios estructurales.',
                    'Las consultas SELECT aplican un LIMIT automático si no lo incluyes.',
                    'Las herramientas están separadas por tipo de operación: SELECT, INSERT, UPDATE, DELETE, ALTER y creación de rutinas.',
                    'No uses DELIMITER en CREATE PROCEDURE o CREATE FUNCTION.'
                ].join(' ')
        }
    );

    server.registerTool(
        'health',
        {
            title: 'Health Check',
            description: 'Verifica que el servidor MCP y la conexión a MySQL estén operativos.',
            inputSchema: z.object({})
        },
        async () => textResult(await health())
    );

    server.registerTool(
        'list_tables',
        {
            title: 'List Tables',
            description: 'Lista todas las tablas y vistas disponibles en la base actual.',
            inputSchema: z.object({})
        },
        async () => textResult({ tables: await listTables() })
    );

    server.registerTool(
        'describe_table',
        {
            title: 'Describe Table',
            description: 'Devuelve el detalle de columnas de una tabla.',
            inputSchema: z.object({
                tableName: z.string().min(1).describe('Nombre de la tabla')
            })
        },
        async ({ tableName }) =>
            textResult({
                tableName,
                columns: await describeTable(tableName)
            })
    );

    server.registerTool(
        'show_create_table',
        {
            title: 'Show Create Table',
            description: 'Devuelve el DDL completo de una tabla usando SHOW CREATE TABLE.',
            inputSchema: z.object({
                tableName: z.string().min(1).describe('Nombre de la tabla')
            })
        },
        async ({ tableName }) => textResult(await showCreateTable(tableName))
    );

    server.registerTool(
        'show_grants',
        {
            title: 'Show Grants',
            description: 'Lista los privilegios efectivos del usuario actual en MySQL.',
            inputSchema: z.object({})
        },
        async () => textResult({ grants: await showGrants() })
    );

    server.registerTool(
        'select_sql',
        {
            title: 'Select SQL',
            description:
                'Ejecuta únicamente sentencias SELECT sobre la base configurada. Si no incluyes LIMIT, se agregará automáticamente.',
            inputSchema: z.object({
                sql: z.string().min(1).describe('Sentencia SELECT'),
                params: sqlParamsSchema.optional().describe('Parámetros posicionales')
            })
        },
        async ({ sql, params }) =>
            textResult({
                rows: await selectSql(sql, params ?? [])
            })
    );

    server.registerTool(
        'insert_sql',
        {
            title: 'Insert SQL',
            description: 'Ejecuta únicamente sentencias INSERT parametrizadas.',
            inputSchema: z.object({
                sql: z.string().min(1).describe('Sentencia INSERT'),
                params: sqlParamsSchema.optional().describe('Parámetros posicionales')
            })
        },
        async ({ sql, params }) =>
            textResult(await insertSql(sql, params ?? []))
    );

    server.registerTool(
        'update_sql',
        {
            title: 'Update SQL',
            description: 'Ejecuta únicamente sentencias UPDATE parametrizadas.',
            inputSchema: z.object({
                sql: z.string().min(1).describe('Sentencia UPDATE'),
                params: sqlParamsSchema.optional().describe('Parámetros posicionales')
            })
        },
        async ({ sql, params }) =>
            textResult(await updateSql(sql, params ?? []))
    );

    server.registerTool(
        'delete_sql',
        {
            title: 'Delete SQL',
            description:
                'Ejecuta únicamente sentencias DELETE parametrizadas. Requiere ENABLE_DESTRUCTIVE_OPERATIONS=true.',
            inputSchema: z.object({
                sql: z.string().min(1).describe('Sentencia DELETE'),
                params: sqlParamsSchema.optional().describe('Parámetros posicionales')
            })
        },
        async ({ sql, params }) =>
            textResult(await deleteSql(sql, params ?? []))
    );

    server.registerTool(
        'alter_sql',
        {
            title: 'Alter SQL',
            description:
                'Ejecuta únicamente sentencias ALTER. Requiere ENABLE_DDL_OPERATIONS=true.',
            inputSchema: z.object({
                sql: z.string().min(1).describe('Sentencia ALTER')
            })
        },
        async ({ sql }) => textResult(await alterSql(sql))
    );

    server.registerTool(
        'create_procedure_sql',
        {
            title: 'Create Procedure SQL',
            description:
                'Ejecuta únicamente CREATE PROCEDURE. No uses DELIMITER. Requiere ENABLE_ROUTINE_OPERATIONS=true.',
            inputSchema: z.object({
                sql: z.string().min(1).describe('Sentencia CREATE PROCEDURE')
            })
        },
        async ({ sql }) => textResult(await createProcedureSql(sql))
    );

    server.registerTool(
        'create_function_sql',
        {
            title: 'Create Function SQL',
            description:
                'Ejecuta únicamente CREATE FUNCTION. No uses DELIMITER. Requiere ENABLE_ROUTINE_OPERATIONS=true.',
            inputSchema: z.object({
                sql: z.string().min(1).describe('Sentencia CREATE FUNCTION')
            })
        },
        async ({ sql }) => textResult(await createFunctionSql(sql))
    );

    return server;
}