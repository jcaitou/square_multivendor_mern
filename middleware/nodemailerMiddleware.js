import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'd942e4938bca34',
    pass: 'f121a3bfe2f0b7',
  },
})
