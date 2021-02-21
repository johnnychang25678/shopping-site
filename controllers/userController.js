const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userController = {
  registerPage: (req, res) => res.render('register'),

  register: async (req, res) => {
    const { email, password, passwordCheck } = req.body
    if (password !== passwordCheck) {
      req.flash('error_messages', "password doesn't match!")
      return res.redirect('/register')
    }
    
    // check if user email already existed
    const user = await User.findOne({
      where: {email}
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
      role: 'user'
    })
    req.flash('success_messages', 'Successfully register！')
    return res.redirect('/login')

  },
  login: (req, res) => res.render('login')
}

module.exports = userController