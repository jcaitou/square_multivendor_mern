export const agendaWrapper = (agenda, taskName, taskFunction) => {
  agenda.define(taskName, async function (job, done) {
    await taskFunction(job.attrs.data)
    done()
  })
}
