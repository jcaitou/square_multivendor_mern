import { transporter } from '../../middleware/nodemailerMiddleware.js'
import { STORE_EMAIL } from '../../utils/constants.js'
import User from '../../models/UserModel.js'
import dedent from 'dedent-js'
import day from 'dayjs'

export default (agenda) => {
  agenda.define('storewide sale email', async function (job, done) {
    const { discountName, validFromDate, validUntilDate, firstLine } =
      job.attrs.data
    const users = await User.find({ role: 'user' })

    const emailList = users.map((user) => user.email)

    const emailText = dedent`
      Dear Vendor,

      ${firstLine} Please login to your dashboard and navigate to discounts to opt in or out of this sale.
      Details: ${discountName}
      Sale runs from: ${day(validFromDate, 'YYYY-MM-DD').format(
        'MMM DD, YYYY'
      )} to ${day(validUntilDate, 'YYYY-MM-DD').format('MMM DD, YYYY')}
      Decision cut-off date: ${day(validFromDate, 'YYYY-MM-DD')
        .subtract(7, 'day')
        .format('MMM DD, YYYY')}

      Makers2
      `

    //send the email
    let message = {
      from: STORE_EMAIL,
      bcc: emailList,
      // to: user.email,
      subject: `Upcoming Storewide Sale: ${day(
        validFromDate,
        'YYYY-MM-DD'
      ).format('MMM DD, YYYY')} to ${day(validUntilDate, 'YYYY-MM-DD').format(
        'MMM DD, YYYY'
      )}`,
      text: emailText,
    }
    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err)
      }
    })

    done()
  })
}
