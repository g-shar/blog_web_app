const db = require('../db')

const getAllRecords = async (table) => {
	const res = await db.query(`SELECT * FROM ${table}`)
	return res.rows
}

module.exports = {
	getAllRecords
}