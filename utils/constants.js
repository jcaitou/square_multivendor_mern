// import { dirname } from 'path'
// import { fileURLToPath } from 'url'
// import path from 'path'
// const __dirname = dirname(fileURLToPath(import.meta.url))
// const rootFilePath = path.resolve(__dirname, '../.env')
// import * as dotenv from 'dotenv'
// dotenv.config({ path: rootFilePath })

export const JOB_STATUS = {
  PENDING: 'pending',
  INTERVIEW: 'interview',
  DECLINED: 'declined',
}

export const JOB_TYPE = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  INTERNSHIP: 'internship',
}

export const INVENTORY_SORT_BY = {
  QTY_ASCENDING: 'quantityAsc',
  QTY_DESCENDING: 'quantityDesc',
  ASCENDING: 'a-z',
  DESCENDING: 'z-a',
}

export const FILE_TYPE = {
  PRODUCT_UPDATE: 'product',
  INVENTORY_RECOUNT: 'inventory-recount',
  INVENTORY_UPDATE: 'inventory-update',
}

export const FILE_UPLOAD_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETE: 'complete',
  COMPLETE_WITH_ERROR: 'error',
}

export const ORDERS_SORT_BY = {
  DATE_DESCENDING: 'dateDesc',
  DATE_ASCENDING: 'dateAsc',
  PRICE_DESCENDING: 'priceDesc',
  PRICE_ASCENDING: 'priceAsc',
}

export const SALES_SORT_BY = {
  QTY_DESCENDING: 'qtyDesc',
  QTY_ASCENDING: 'qtyAsc',
  ASCENDING: 'a-z',
  DESCENDING: 'z-a',
}

export const DEFAULT_REPORT_PERIOD = {
  ALL_TIME: 'all time',
  ONE_MONTH: 'one month',
  ONE_WEEK: 'one week',
  TODAY: 'today',
}

export const CONTRACT_TYPE = {
  ROTATING: 'rotating',
  STARTER: 'starter',
  ESSENTIAL: 'essential',
  CUSTOM: 'custom',
}

export const PAYMENT_STATUS = {
  UPCOMING: 'upcoming',
  DUE: 'due',
  PAST_DUE: 'past due',
  PAID: 'paid',
}

export const STORE_EMAIL = 'mailtrap@jcdevs.site'
