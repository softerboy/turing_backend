const KoaRouter = require('koa-router')
const stripe = require('../stripe/webhook')

const router = new KoaRouter()

router.post('/webhook', stripe.webhook)

module.exports = router
