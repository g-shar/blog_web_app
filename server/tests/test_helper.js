const db = require('../db')

const getAllRecords = (table) => {
	return db.query(`SELECT * FROM ${table}`)
}

module.exports = {
	getAllRecords
}