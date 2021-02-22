module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error_messages', 'You need to login first!') // store message in flash()
  return res.redirect('/login')
}
