const mysql = require('mysql')

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  port: '3306',
  database: 'shopping_cart',
})

// eslint-disable-next-line arrow-body-style
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) reject(err)
      connection.query(sql, values, (err, results) => {
        if (err) reject(err)
        resolve(results)
      })
      connection.release()
    })
  })
}

module.exports = query
