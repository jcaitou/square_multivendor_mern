import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url))
const rootFilePath = path.resolve(__dirname, '../.env')
import { Client, Environment, ApiError } from 'square'
import * as dotenv from 'dotenv'
dotenv.config({ path: rootFilePath })
const { PORT, SQ_ENVIRONMENT, SQ_APPLICATION_ID, SQ_APPLICATION_SECRET } =
  process.env

let basePath
let environment
if (SQ_ENVIRONMENT.toLowerCase() === 'production') {
  basePath = `https://connect.squareup.com`
  environment = Environment.Production
} else if (SQ_ENVIRONMENT.toLowerCase() === 'sandbox') {
  basePath = `https://connect.squareupsandbox.com`
  environment = Environment.Sandbox
} else {
  console.warn('Unsupported value for SQ_ENVIRONMENT in .env file.')
  process.exit(1)
}

//initialize Square Client
export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: environment,
})
