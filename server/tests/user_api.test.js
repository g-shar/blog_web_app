const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const db = require('../db')
const helper = require('./helper')
const test_helper = require('./test_helper')

beforeEach(async () => {
	await db.query('DELETE FROM member')
	console.log('cleared member table')
	await db.query('ALTER SEQUENCE member_id_seq START WITH 1')
	await db.query(`INSERT INTO member (first_name, last_name, email, password)
				VALUES ('John', 'Smith', 'jsmith001@gmail.com', 3sd1kj2d7ol8s8afsbk)`)
	await db.query(`INSERT INTO member (first_name, last_name, email, password)
				VALUES ('Mary', 'Jordan', 'mj123123@yahoo.com', po5jhg346ol8op42aq0)`)
})

describe('getting initial members', () => {
	test('members are returned in the correct format', async () => {
		await api
			.get('/api/members')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})

	test('all members are returned', () => {
		const response = api.get('/api/members')
		const body = response.body
		expect(body).toHaveLength(2)
		const firstNames = body.map(r => r.first_name) 
		expect(firstNames).toContain(
			'John', 'Mary'
		)
	})

	test('get a specific member', () => {
		const response = api.get('/api/members/2')
		const member = response.body
		const expectedMember = {
			first_name: 'Mary',
			last_name: 'Jordan',
			email: 'mj123123@yahoo.com'
		}
		expect(member.first_name).toEqual(expectedMember.first_name)
		expect(member.last_name).toEqual(expectedMember.last_name)
		expect(member.email).toEqual(expectedMember.email)
	})
})

describe('addition of a new member', () => {
	test('a valid new member can be added', () => {
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

		const members = helper.getAllRecords('member').map(r => r.email)

		expect(members).toContain('stoney181@gmail.com')
	})

	test('email is already taken', () => {
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

	test('password is not long enough', () => {
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

afterAll(() => {
	db.close()
})
