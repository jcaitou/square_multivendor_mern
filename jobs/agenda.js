import Agenda, { Job, JobAttributesData } from 'agenda'
let url = process.env.DB_URL

let agenda = new Agenda({
  db: { address: process.env.DB_URL, collection: 'agenda_tasks' },
})

let jobTypes = ['productImport', 'inventoryImport', 'orderWebhook']

jobTypes.forEach((type) => {
  // the type name should match the file name in the jobs_list folder
  require('./jobs_list/' + type)(agenda)
})

if (jobTypes.length) {
  // if there are jobs in the jobsTypes array set up
  agenda.on('ready', async () => await agenda.start())
}

let graceful = () => {
  agenda.stop(() => process.exit(0))
}

process.on('SIGTERM', graceful)
process.on('SIGINT', graceful)

export default agenda
