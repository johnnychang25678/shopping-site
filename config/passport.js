const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const query = require('../db')

module.exports = (app) => {
  app.use(passport.initialize())
  app.use(passport.session())
  // local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        const sql = 'SELECT * FROM users WHERE email = ?'
        const userSql = await query(sql, [email])

        if (!userSql.length) {
          return done(null, false, {
            message: 'No user found, please register!',
          })
        }
        const user = userSql[0]
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
          return done(null, false, { message: 'Email or Password incorrect.' })
        }
        return done(null, user)
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    })
  })
  passport.deserializeUser(async (user, done) => {
    try {
      // const sql = 'SELECT id, email, isAdmin FROM users WHERE id = ?'
      // const userSql = await query(sql, [id])
      // const user = userSql[0]
      console.log('Deserializing...: ', user)
      done(null, user)
    } catch (err) {
      done(err, null)
    }
  })
}
