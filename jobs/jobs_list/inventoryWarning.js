export default (agenda) => {
  agenda.define('inventory warning', async function (job, done) {
    const { counts } = job.attrs.data

    for (let i = 0; i < counts.length; i++) {
      if ((counts[i]['catalog_object_type'] = 'ITEM_VARIATION')) {
        let catalogObjectId = counts[i]['catalog_object_id']
        console.log(catalogObjectId)
      }
    }

    // const responseTemp = await squareClient.ordersApi.retrieveOrder(orderId)

    // let message = {
    //   from: 'from-example@email.com',
    //   to: user.email,
    //   subject: 'Low Inventory Warning',
    //   text: 'Stock for ',
    // }
    // transporter.sendMail(message, (err, info) => {
    //   if (err) {
    //     console.log(err)
    //   } else {
    //     //console.log(info)
    //   }
    // })

    done()
  })
}
