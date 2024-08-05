import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig =  {}
if (process.env.NODE_ENV === 'production') {
  const sslBundle = fs.readFileSync(path.join(__dirname, '../eu-central-1-bundle.pem'))
  dbConfig.ssl = {
    require: process.env.NODE_ENV === 'production',
    rejectUnauthorized: process.env.NODE_ENV === 'production',
    ca: sslBundle.toString(),
  }
}
const sql = postgres(process.env.DATABASE_URL, dbConfig)

export default sql