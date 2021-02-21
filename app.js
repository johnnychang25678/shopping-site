if (process.env.NODE_ENV !== 'produciton') {
  require('dotenv').config()
}
const express = require('express')
const path = require('path');
const logger = require('morgan');
const session = require('express-session')
const methodOverride = require('method-override')
const handlebars = require('express-handlebars')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const port = 3000

// view engine setup
app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))
app.set('view engine', 'handlebars')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'ac',
  name: 'ac',
  cookie: { maxAge: 80000 },
  resave: false,
  saveUninitialized: true,
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


module.exports = app;
