import Agenda from 'agenda'
let url = process.env.MONGO_URL

const agenda = new Agenda({
  db: { address: process.env.MONGO_URL, collection: 'agenda_tasks' },
})

//import orderWebhook from './jobs_list/orderWebhook.js'
//orderWebhook(agenda)
import productImport from './jobs_list/productImport.js'
import inventoryImport from './jobs_list/inventoryImport.js'
productImport(agenda)
inventoryImport(agenda)

agenda.on('ready', async () => await agenda.start())

let graceful = () => {
  agenda.stop(() => process.exit(0))
}

process.on('SIGTERM', graceful)
process.on('SIGINT', graceful)

export default agenda
