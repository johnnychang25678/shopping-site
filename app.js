/* eslint-disable no-console */
/* eslint-disable global-require */
if (process.env.NODE_ENV !== 'produciton') {
  require('dotenv').config()
}
const express = require('express')
const session = require('express-session')
const redis = require('redis')
const connectRedis = require('connect-redis')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const handlebars = require('express-handlebars')
const indexRouter = require('./routes/index')
const usePassport = require('./config/passport')

const app = express()
const port = process.env.PORT || 3000

// view engine setup
app.engine(
  'handlebars',
  handlebars({
    defaultLayout: 'main',
    helpers: require('./config/handlebars-helpers'),
  })
)
app.set('view engine', 'handlebars')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const RedisStore = connectRedis(session)
// Configure redis client
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
})
redisClient.on('error', (err) => {
  console.log(`Could not establish a connection with redis. ${err}`)
})
redisClient.on('connect', () => {
  console.log('Connected to redis successfully')
})

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.MY_SESSION_SECRET,
    name: 'johnnyShop',
    cookie: { maxAge: 1000 * 60 * 60 * 60 }, // expire after 1 hour
    resave: false,
    saveUninitialized: false, // to not store too many empty sessions in store
  })
)
usePassport(app)
app.use(flash())

app.use((req, res, next) => {
  console.log(req.session)
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  res.locals.passportError = req.flash('error')
  next()
})

app.use('/', indexRouter)

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})

module.exports = app
