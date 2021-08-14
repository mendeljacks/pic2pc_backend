import {Pool} from 'pg'
import env from './env.json'

export const pool = new Pool({
    connectionString: env.pg_connection_string,
    ssl: {
        rejectUnauthorized: false,
    },
})
