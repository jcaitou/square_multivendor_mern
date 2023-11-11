import Agenda from 'agenda'
let url = process.env.MONGO_URL

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URL,
    collection: 'agenda_tasks',
    defaultConcurrency: 5,
    defaultLockLimit: 5,
  },
})

//import orderWebhook from './jobs_list/orderWebhook.js'
//orderWebhook(agenda)
import productImport from './jobs_list/productImport.js'
import inventoryImport from './jobs_list/inventoryImport.js'
import productExport from './jobs_list/productExport.js'
import inventoryExport from './jobs_list/inventoryExport.js'
import inventoryWarning from './jobs_list/inventoryWarning.js'
productImport(agenda)
inventoryImport(agenda)
productExport(agenda)
inventoryExport(agenda)
inventoryWarning(agenda)

agenda.on('ready', async () => await agenda.start())

let graceful = () => {
  agenda.stop(() => process.exit(0))
}

process.on('SIGTERM', graceful)
process.on('SIGINT', graceful)

export default agenda
