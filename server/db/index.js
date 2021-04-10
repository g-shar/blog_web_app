const { Pool } = require('pg')

const pool = new Pool({
	host: 'localhost',
	database: 'testdb'
})

module.exports = {
	async query (text, params, callback) {
		const res = await pool.query(text, params, callback)
	},
}