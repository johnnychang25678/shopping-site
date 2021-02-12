const express = require('express')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session')
const handlebars = require('express-handlebars')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const port = 3000

// view engine setup
app.engine('handlebars', handlebars({
  defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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
