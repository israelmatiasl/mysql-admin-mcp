# MySQL Admin MCP

Este proyecto implementa un servidor de **Model Context Protocol (MCP)** para la administración completa de bases de datos MySQL. Provee herramientas a los agentes de IA para ejecutar consultas, realizar modificaciones estructurales (DDL) y gestionar rutinas (procedimientos almacenados, claves foráneas, vistas, etc.).

## Requisitos Previos

Para ejecutar y configurar el proyecto correctamente, se requiere tener pre-instalado lo siguiente en el entorno de tu sistema operativo:
- **Node.js**: Versión **22 LTS**.
- **MySQL**: Versión **8**.

## Configuración del Usuario de MySQL

Para que el servidor MCP pueda realizar todas las acciones complejas e integrales (crear claves foráneas, procedimientos almacenados, modificar tablas y alterar la base de datos en su totalidad), se debe proporcionar un usuario MySQL con todos los privilegios asociados.

Con base en los parámetros definidos en el archivo `.env.example`, utilizaremos el nombre de usuario `mcp_admin` junto con su clave configurada. 

Ingresa a la consola de mysql en tu terminal usando la cuenta administrativa (`root`):
```bash
mysql -u root -p
```

Una vez iniciada la sesión, ejecuta las siguientes consultas (queries) para crear la base de datos, crear el usuario y concederle todos los privilegios sin restricción:

```sql
-- 1. Crear la base de datos del entorno del MCP
CREATE DATABASE IF NOT EXISTS mcp_sandbox;

-- 2. Crear el nuevo usuario (permitiendo conexión desde cualquier nodo con '%')
CREATE USER IF NOT EXISTS 'mcp_admin'@'%' IDENTIFIED BY 'xxxxxxxxxxxx';

-- 3. Otorgar absolutamente TODOS los privilegios sobre todas las bases de datos y sistema
GRANT ALL PRIVILEGES ON *.* TO 'mcp_admin'@'%' WITH GRANT OPTION;

-- 4. Refrescar los privilegios para aplicar cambios
FLUSH PRIVILEGES;

-- 5. Finalizar la sesión administrativa
EXIT;
```

## Build y Compilación

El proyecto está programado en TypeScript, por lo cual ciertos agentes o aplicaciones (como Claude) requerirán de una versión ya compilada (JavaScript) para ejecutarse correctamente como servidor MCP local.

Para construir y compilar el proyecto en su versión de producción, ejecuta los siguientes comandos parados desde la ruta del proyecto:

1. **Crear el archivo .env y en base a .env.example**
   ```bash
   cp .env.example .env
   ```
   y luego editar el archivo .env con la información correspondiente.

2. **Instalar dependencias necesarias**:
   ```bash
   npm install
   ```

2. **Ejecutar el proceso de Build de TypeScript (para generar la carpeta `./dist/`)**:
   ```bash
   npm run build
   ```

> *Si en algún momento requieres solo iniciar manualmente el servidor compilado, puedes visualizar su funcionamiento estándar usando:* `npm run start`

## Cómo Agregar e Integrar los Agentes

A continuación se detallan los pasos necesarios para conectar y autorizar tu servidor MCP local tanto en **Claude Desktop** como en **Codex**.

### 1. Integración en Claude Desktop
Claude Desktop requiere que el proyecto haya sido procesado en su etapa de `build` previamente, así como el uso de la empaquetadora oficial (`.mcpb`).

1. **Instalar el Empaquetador de Anthropic:**
   Abre una terminal en tu sistema e instala la siguiente dependencia de forma global:
   ```bash
   npm install -g @anthropic-ai/mcpb
   ```

2. **Generar el Empaquetado:**
   Ubícate en la raíz del proyecto (donde se encuentra guardado el `manifest.json`) y ejecuta el comando de creación:
   ```bash
   mcpb pack
   ```
   *(Esto generará un archivo instalador `.mcpb` en tu carpeta).*

3. **Proceso de Instalación en Claude Desktop:**
   - Abre la aplicación de Claude.
   - Navega usando la interfaz hacia: **Configuración** -> **Extensiones** -> **Configuración Avanzada** -> **Instalar Extensión**.
   - Haz clic y busca el archivo `.mcpb` recién generado en la raíz de tu proyecto.
   - Sigue el proceso natural de instalación.

4. **Configuración de Parámetros de Entorno:**
   Al culminar, la extensión te solicitará algunas variables de configuración de manera individual. Estos campos toman el título desde el archivo `manifest.json` y deberás alimentarlos con la información correspondiente contenida en tu archivo `.env`.

   La lista de variables y su equivalencia solicitada será:
   - **MySQL Host**: (ej. `127.0.0.1` equivalente a *MYSQL_HOST*)
   - **MySQL Port**: (ej. `3306` equivalente a *MYSQL_PORT*)
   - **MySQL User**: (ej. `mcp_admin` equivalente a *MYSQL_USER*)
   - **MySQL Password**: (tu clave asignada en *MYSQL_PASSWORD*)
   - **MySQL Database**: (ej. `mcp_sandbox` equivalente a *MYSQL_DATABASE*)
   - **App Name**: (ej. `mysql-admin-mcp` equivalente a *APP_NAME*)
   - **App Version**: (ej. `1.0.0` equivalente a *APP_VERSION*)
   - **Max Select Rows**: (ej. `1000` equivalente a *MAX_SELECT_ROWS*)
   - **Enable Destructive Operations**: (ej. `true` equivalente a *ENABLE_DESTRUCTIVE_OPERATIONS*)
   - **Enable DDL Operations**: (ej. `true` equivalente a *ENABLE_DDL_OPERATIONS*)
   - **Enable Routine Operations**: (ej. `true` equivalente a *ENABLE_ROUTINE_OPERATIONS*)

> **Importante:** *Es estrictamente necesario cerrar y **reiniciar completamente Codex** tras guardar los cambios.*

### 2. Integración en Codex
Para la integración con Codex sí es necesario haber realizado el proceso de compilación (`build`) previamente, ya que su configuración estará apuntando al archivo final que se encuentre en la carpeta de salida (`dist`).

Para agregar y configurar nuestro MCP, sigue este paso a paso detallado desde la vista de Codex:

1. Adéntrate en el menú realizando la siguiente ruta: 
   **Archivo** -> **Settings** -> **Servidores MCP** -> **Agregar Servidor**

2. Una vez que abra el formulario, complétalo con la siguiente información:
   - **Nombre de servidor:** `mysql-admin-mcp`
   - **Comando para iniciar:** `C:\Program Files\nodejs\node.exe` *(debe ser la ruta absoluta donde se encuentre instalado node.js)*
   - **Argumentos:** `dist\index.js` *(aquí indicamos el uso del compilado)*
   - **Directorio de trabajo:** `D:\inventamos\apps\claude\mysql-admin-mcp` *(la ruta absoluta donde se encuentre posicionado nuestro proyecto)*

3. **Variables de entorno:**
   Aquí se debe agregar individualmente cada variable en modo Clave - Valor, copiando los parámetros que poseemos en nuestro propio archivo `.env`, por ejemplo:
   - `MYSQL_HOST` = `127.0.0.1`
   - `MYSQL_PORT` = `3306`
   - `MYSQL_USER` = `mcp_admin`
   - `MYSQL_PASSWORD` = `xxxxxxxxxxxx`
   - `MYSQL_DATABASE` = `mcp_sandbox`
   - *(Añade también de manera opcional o si los posees: `MAX_SELECT_ROWS`, `ENABLE_DESTRUCTIVE_OPERATIONS`, `ENABLE_DDL_OPERATIONS`, `ENABLE_ROUTINE_OPERATIONS`, etc).*

4. Finalmente, haz clic en el botón de **Guardar**.

> **Importante:** *Es estrictamente necesario cerrar y **reiniciar completamente Codex** tras guardar los cambios.*
