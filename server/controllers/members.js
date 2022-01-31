const db = require('../db')
const membersRouter = require('express').Router()
const bcrypt = require('bcrypt')

membersRouter.post('/', async (request, response, next) => {
	const body = request.body
	if(!body.first_name || !body.last_name || !body.email || !body.password) {
		response.json({
			error: "all fields must be filled out"
		})
		return;
		
	}
	if(body.password.length < 7) {
		response.json({
			error: "password has to contain at least 7 characters"
		})
		return;
		
	}
	const saltRounds = 10
	const passwordHash = await bcrypt.hash(body.password, saltRounds)
	
	const res = await db.query(`SELECT * FROM member`)
	const members = res.rows
	const emails = members.filter(m => m.email === body.email)
	if(emails.length > 0) {
		response.json({
			error: "email is already taken"
		})
		return;
	}

	db.query(`INSERT INTO member (
		first_name,
		last_name, 
		email,
		password
	) VALUES ($1, $2, $3, $4) RETURNING *`, [body.first_name, body.last_name, body.email, passwordHash], (err, res) => {
		if (err) {
			return next(err)
		}
		response.json(res.rows[0])
	})
})

module.exports = membersRouter