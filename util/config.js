require('dotenv').config('./.env')

module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
  SECRET: process.env.SECRET
}