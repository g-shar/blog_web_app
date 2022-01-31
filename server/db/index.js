const config = require('../utils/config')
const { Pool } = require('pg')

const pool = new Pool({
	host: 'localhost',
	database: config.DATABASE
})

module.exports = {
	async query (text, params, callback) {
		const res = await pool.query(text, params, callback)
		return res
	},
	async end () {
		await pool.end()
	}
}