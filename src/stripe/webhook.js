const nodemailer = require('nodemailer')

async function handlePaymentIntentSucceeded(paymentIntent) {
  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM } = process.env
  const transport = nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  })

  const mailOptions = {
    from: `From: <${MAIL_FROM}>`,
    to: paymentIntent.object.receipt_email || 'turing@fullstack.test',
    subject: 'Payment succeeded',
    text: 'Test mail for Turing full-stack challenge',
    html: '<b>Dear customer! </b><br> Your payment completed successfully',
  }

  try {
    const info = await transport.sendMail(mailOptions)
    // eslint-disable-next-line no-console
    console.log('Message sent %s', info.messageId)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    throw err
  }
}

module.exports = {
  async webhook(ctx) {
    const { request } = ctx
    const event = request.body

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      await handlePaymentIntentSucceeded(paymentIntent)
    }

    ctx.response.status = 200
    ctx.body = { received: true }
  },
}
