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

// export const ALL_LOCATIONS = [
//   { name: 'Metrotown', id: 'LVBCM6VKTYDHH' },
//   { name: 'Richmond Center', id: 'L1NN4715DCC58' },
// ]

export const ALL_LOCATIONS = [{ name: 'Richmond Center', id: 'LEDWQ3C33S4F4' }]

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

export const STORE_EMAIL = 'mailtrap@jcdevs.site'
