module.exports = {
  ifCond: function(a, b, options){
      if(a == b) {
        return options.fn(this);
      }
      return options.inverse(this);
  },
  formatDollar: function(amount) {
    const number = new Intl.NumberFormat('en-US').format(amount)
    return `$ ${number}`
  }
}