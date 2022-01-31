const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const db = require('../db')
const helper = require('./test_helper')
const test_helper = require('./test_helper')

beforeEach(async () => {
	await db.query('DELETE FROM member')
	console.log('cleared member table')
	await db.query('ALTER SEQUENCE member_id_seq RESTART WITH 1')
	await db.query(`INSERT INTO member (first_name, last_name, email, password)
				VALUES ('John', 'Smith', 'jsmith001@gmail.com', '3sd1kj2d7ol8s8afsbk')`)
	await db.query(`INSERT INTO member (first_name, last_name, email, password)
				VALUES ('Mary', 'Jordan', 'mj123123@yahoo.com', 'po5jhg346ol8op42aq0')`)
})

describe('addition of a new member', () => {
	test('a valid new member can be added', async () => {
		const newMember = {
			first_name: 'George',
			last_name: 'Stone',
			email: 'stoney181@gmail.com',
			password: 'stoney9871'
		}

		await api
			.post('/api/members')
			.send(newMember)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const members = await helper.getAllRecords('member')
		
		const emails = members.map(r => r.email)

		expect(emails).toContain('stoney181@gmail.com')
	})

	test('all fields are not filled out', async () => {
		const newMember = {
			last_name: 'Stone',
			email: 'mj123123@yahoo.com',
			password: 'stoney9871'
		}

		const response= await api
			.post('/api/members')
			.send(newMember)
			.expect(200)
			
		
		expect(response.body).toEqual({"error": "all fields must be filled out"})	
	})

	test('email is already taken', async () => {
		const newMember = {
			first_name: 'George',
			last_name: 'Stone',
			email: 'mj123123@yahoo.com',
			password: 'stoney9871'
		}

		const response= await api
			.post('/api/members')
			.send(newMember)
			.expect(200)
		
		expect(response.body).toEqual({"error": "email is already taken"})	
	})

	test('password is less than 7 characters', async () => {
		const newMember = {
			first_name: 'George',
			last_name: 'Stone',
			email: 'stoney200@gmail.com',
			password: 's'
		}

		const response= await api
			.post('/api/members')
			.send(newMember)
			.expect(200)
		
		expect(response.body).toEqual({"error": "password has to contain at least 7 characters"})	
	})
})

afterAll(async () => {
	db.end()
})
