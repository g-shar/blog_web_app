const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const db = require('../db')
const helper = require('./test_helper')
const test_helper = require('./test_helper')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

beforeEach(async () => {
	const saltRounds = 10
	await db.query('DELETE FROM member')
	await db.query('ALTER SEQUENCE member_id_seq RESTART WITH 1')
	const password1 = await bcrypt.hash('potato172H', saltRounds)
	const password2 = await bcrypt.hash('jKd1va789', saltRounds)
	await db.query(`INSERT INTO member (first_name, last_name, email, password)
				VALUES ('John', 'Smith', 'jsmith001@gmail.com', '${password1}')`)
	await db.query(`INSERT INTO member (first_name, last_name, email, password)
				VALUES ('Mary', 'Jordan', 'mj123123@yahoo.com', '${password2}')`)
})

describe('logging in', () => {
	test('a valid member can log in', async () => {
		const login = {
			email: 'jsmith001@gmail.com',
			password: 'potato172H'
		}

		const response  = await api
			.post('/api/login')
			.send(login)
			.expect(200)

		const login_info = { 
			email: 'jsmith001@gmail.com',
			id: 1
		}

		const loginObject = await jwt.verify(response.body.token, process.env.SECRET)
		expect(loginObject.email).toEqual(login_info.email)
		expect(loginObject.id).toEqual(login_info.id)
	})

	test('incorrect email', async () => {
		const login = {
			email: 'mj123124@yahoo.com',
			password: 'jKd1va789'
		}

		const response = await api
			.post('/api/login')
			.send(login)
			.expect(401)
		
		expect(response.body.error).toContain('invalid email or password')	
	})

	test('incorrect password', async () => {
		const login = {
			email: 'jsmith001@gmail.com',
			password: 'potato172Hj'
		}

		const response = await api
			.post('/api/login')
			.send(login)
			.expect(401)
		
		expect(response.body.error).toContain('invalid email or password')	
	})
})

afterAll(async () => {
	db.end()
})
