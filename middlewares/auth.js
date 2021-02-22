module.exports = {
  authenticatedAdmin: (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.isAdmin) {
        return next()
      }
      req.flash('error_messages', 'You do not have admin access!')
      return res.redirect('/')
    }
    req.flash('error_messages', 'You need to login first!')
    return res.redirect('/login')
  },
  authenticatedUser: (req, res, next) => {
    if (req.isAuthenticated()) {
      // block admin
      if (req.user.isAdmin) {
        req.flash('error_messages', 'Admin cannot access!')
        return res.redirect('/admin/products')
      }
      return next()
    }
    req.flash('error_messages', 'You need to login first!')
    return res.redirect('/login')
  },
}
