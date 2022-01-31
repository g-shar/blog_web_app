const db = require('../db')
const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

loginRouter.post('/', async (request, response, next) => {
	const login = {
		email: request.body.email,
		password: request.body.password,
	}

	if (login.email == null || login.password == null) {
		response.status(401).send({error: 'missing email or password'}).end()
		return;
	}

	console.log('login: ', login.email, ' ', login.password)

	const res = await db.query('SELECT * FROM member WHERE email = $1', [login.email])
	const member = res.rows[0]
	console.log('member: ', member)
	console.log('password: ',login.password)
	const passwordCorrect = member == null ? false : await bcrypt.compare(login.password, member.password)
	if (!passwordCorrect) {
		response.status(401).send({error: 'invalid email or password'}).end()
		return;
	}
	console.log('SUCCESSFUL LOGIN')
	const token = await jwt.sign({email: member.email, id: member.id}, process.env.SECRET, {expiresIn: 60*60})
	response.status(200).send({token, email: member.email, first_name: member.first_name, last_name: member.last_name})
})

module.exports = loginRouter