/* eslint-disable no-console */
const bcrypt = require('bcryptjs')
const db = require('../models')

const { User } = db

const userController = {
  registerPage: (req, res) => res.render('register'),

  register: async (req, res) => {
    try {
      const { email, password, passwordCheck } = req.body
      if (password !== passwordCheck) {
        req.flash('error_messages', "password doesn't match!")
        return res.redirect('/register')
      }

      // check if user email already existed
      const user = await User.findOne({
        where: { email },
      })
      if (user) {
        req.flash('error_messages', 'This email already existed!')
        return res.redirect('/register')
      }

      // create user
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      await User.create({
        email,
        password: hashedPassword,
        role: 'user',
      })
      req.flash('success_messages', 'Successfully registered！')
      return res.redirect('/login')
    } catch (err) {
      console.log(err)
      return res.render('error', { message: err.message })
    }
  },
  loginPage: (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect('/products')
    }
    return res.render('login')
  },
  login: (req, res) => {
    const cookies = req.headers.cookie.split(';').reduce((a, c) => {
      const data = c.trim().split('=')
      // a[data[0]] = data[1]
      // return a
      return {
        ...a,
        [data[0]]: data[1], // ES6 syntax
      }
    }, {})
    req.flash('success_messages', 'Successful login!')
    return res.redirect(cookies.location)
  },
  logout: (req, res) => {
    req.flash(req.flash('success_messages', 'Successful logout!'))
    req.logout()
    return res.redirect('/products')
  },
}

module.exports = userController
