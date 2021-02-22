/* eslint-disable object-shorthand */
/* eslint-disable func-names */
module.exports = {
  ifCond: function (a, b, options) {
    if (a == b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  ifNot: function (a, b, options) {
    if (a != b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  formatDollar: function (amount) {
    const number = new Intl.NumberFormat('en-US').format(amount)
    return `$ ${number}`
  },
}
