import { Client, Environment, ApiError } from 'square'
import * as dotenv from 'dotenv'
dotenv.config()

//initialize Square Client
export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
})
