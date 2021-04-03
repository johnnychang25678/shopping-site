const mysql = require('mysql')

if (process.env.NODE_ENV !== 'produciton') {
  require('dotenv').config()
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
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
