require('dotenv').config()

const PORT = process.env.PORT
const DATABASE = process.env.NODE_ENV === 'test' 
	? process.env.TEST_DATABASE
	: process.env.DATABASE

module.exports = {
	DATABASE, PORT
}