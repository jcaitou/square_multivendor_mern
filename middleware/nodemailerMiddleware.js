import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'bace17bfd19800',
    pass: 'd1d520662fd358',
  },
})
