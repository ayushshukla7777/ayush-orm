import * as mysql from 'mysql2/promise';
import { Client } from 'pg';
import * as tedious from 'tedious';
import { Request } from 'tedious';
import { TYPES } from 'tedious';


const typeMapping: Record<string, tedious.TediousType> = {
    string: TYPES.VarChar,
    number: TYPES.Int,
};

interface ConnectionOptions {
    database: string;
    hostname: string;
    username: string;
    port?: number | undefined;
    password?: string | undefined;
    type: 'mysql' | 'postgres' | 'mssql';
}
let dbType: 'mysql' | 'postgres' | 'mssql';
let connection: Client;
let mysqlConnection: mysql.Connection;
let postgresConnection: Client;
let mssqlConnection: tedious.Connection;
export async function createConnection(options: ConnectionOptions) {
    dbType = options.type;
    switch (options.type) {
        case 'mysql':
            mysqlConnection = await mysql.createConnection({ host: options.hostname, user: options.username, password: options.password, database: options.database });
            break;
        case 'postgres':
            let connectionString: string;
            if (options.port) {

                connectionString = `postgres://${options.username}:${options.password}@${options.hostname}:${options.port}/${options.database}`;
            } else {

                connectionString = `postgres://${options.username}:${options.password}@${options.hostname}/${options.database}`;
            }

            postgresConnection = new Client({ connectionString: connectionString });
            await postgresConnection.connect()
            break;
        case 'mssql':
            const config = {
                server: options.hostname,
                authentication: {
                    type: 'default',
                    options: {
                        userName: options.username,
                        password: options.password,
                    },
                },
                options: {
                    database: options.database,
                    encrypt: true,
                },
            };
            mssqlConnection = new tedious.Connection(config);
            break;
        default:
            throw new Error(`Unsupported database type: ${options.type}`);
    }


}

export async function executeQuery(query: string, params: (string | number)[]) {
    let res;
    try {
        if (dbType === 'mysql') {
            const [rows, fields] = await mysqlConnection.execute(query, params);
            return { rows, fields };
        } else if (dbType === 'postgres') {
            res = await postgresConnection.query(query, params);
        return { rows: res.rows, fields: res.fields } ;
        } else if (dbType === 'mssql') {
            mssqlConnection.on('connect', async (err) => {
                if (err) {
                    throw err;
                } else {
                    const request = new Request(query, (err, rows) => {
                        if (err) {
                            throw err;
                        } else {
                            return { rows };
                        }
                    });
    
                    if (params) {
                        for (const key in params) {
                            if (params.hasOwnProperty(key)) {
                                const jsType = typeof params[key];
                                const tediousType = typeMapping[jsType];
                                    request.addParameter(key, tediousType, params[key]);
                            }
                        }
                    }
                    mssqlConnection.execSql(request);
                }
            });
        }

    } catch (error) {
        throw error;
    }
}



