export default (agenda) => {
  agenda.define('order webhook fired', async function (job, done) {
    // your code goes here
    const data = job.attrs.data
    console.log('agenda: ', data)
  })
}
