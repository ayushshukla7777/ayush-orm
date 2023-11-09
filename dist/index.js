var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as mysql from 'mysql2/promise';
import { Client } from 'pg';
import * as tedious from 'tedious';
import { Request } from 'tedious';
import { TYPES } from 'tedious';
const typeMapping = {
    string: TYPES.VarChar,
    number: TYPES.Int,
};
let dbType;
let connection;
let mysqlConnection;
let postgresConnection;
let mssqlConnection;
export function createConnection(options) {
    return __awaiter(this, void 0, void 0, function* () {
        dbType = options.type;
        switch (options.type) {
            case 'mysql':
                mysqlConnection = yield mysql.createConnection({ host: options.hostname, user: options.username, password: options.password, database: options.database });
                break;
            case 'postgres':
                let connectionString;
                if (options.port) {
                    connectionString = `postgres://${options.username}:${options.password}@${options.hostname}:${options.port}/${options.database}`;
                }
                else {
                    connectionString = `postgres://${options.username}:${options.password}@${options.hostname}/${options.database}`;
                }
                postgresConnection = new Client({ connectionString: connectionString });
                yield postgresConnection.connect();
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
    });
}
export function executeQuery(query, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let res;
        try {
            if (dbType === 'mysql') {
                const [rows, fields] = yield mysqlConnection.execute(query, params);
                return { rows, fields };
            }
            else if (dbType === 'postgres') {
                res = yield postgresConnection.query(query, params);
                return { rows: res.rows, fields: res.fields };
            }
            else if (dbType === 'mssql') {
                mssqlConnection.on('connect', (err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        throw err;
                    }
                    else {
                        const request = new Request(query, (err, rows) => {
                            if (err) {
                                throw err;
                            }
                            else {
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
                }));
            }
        }
        catch (error) {
            throw error;
        }
    });
}
