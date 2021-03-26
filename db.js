const mysql = require('mysql')

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  port: '3306',
  database: 'shopping_cart',
})

connection.connect((err) => {
  if (err) throw err
  console.log('connected!')
})

module.exports = connection

// const sql = 'SELECT * FROM users'

// connection.query(sql, (err, result) => {
//   if (err) {
//     console.log(err)
//   }
//   console.log(result)
// })

// connection.end()
