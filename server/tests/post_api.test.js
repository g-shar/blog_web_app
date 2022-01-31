const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const db = require('../db')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

beforeAll(async () => {
	await db.query(`DELETE FROM member`)
	console.log('cleared test database')
	await db.query(`ALTER SEQUENCE post_id_seq RESTART WITH 1`)
	await db.query(`ALTER SEQUENCE member_id_seq RESTART WITH 1`)
	console.log('reset post_id_seq')
	const saltRounds = 10
	const password1 = await bcrypt.hash('potato172H', saltRounds)
	const password2 = await bcrypt.hash('jKd1va789', saltRounds)
	await db.query(`INSERT INTO member (first_name, last_name, email, password)
				VALUES ('John', 'Smith', 'jsmith001@gmail.com', '${password1}')`)
	await db.query(`INSERT INTO member (first_name, last_name, email, password)
				VALUES ('Mary', 'Jordan', 'mj123123@yahoo.com', '${password2}')`)
	await db.query(`INSERT INTO post (
		title, 
		description, 
		body, 
		date_posted,
		member_id) 
		VALUES ('TITLE 1', 'description 1 is here', 'I am body 1', NOW(), 2)`)
	await db.query(`INSERT INTO post (
		title, 
		description, 
		body, 
		date_posted,
		member_id) 
		VALUES ('TITLE 2', 'description 2 is here', 'I am body 2', NOW(), 1)`)
})

describe('getting initial posts', () => {
	test('notes are returned in the correct format', async () => {
		await api.get('/api/posts').expect(200).expect('Content-Type', /application\/json/)
	})

	test('all posts are returned', async () => {
		const response = await api.get('/api/posts')
		console.log(response.body)
		const contents = response.body.map(r => r.title)
		expect(contents).toContain(
			'TITLE 1', 'TITLE 2'
		)
	})

	test('get a specific post', async () => {
		const response = await api.get('/api/posts/2')
		const post = {
			title: 'TITLE 2',
			description: 'description 2 is here',
			body: 'I am body 2'
		}

		const content = response.body
		console.log('content: ', content)
		expect(content.title).toEqual(post.title)
		expect(content.description).toEqual(post.description)
		expect(content.body).toEqual(post.body)
	})
})

describe('addition of a new post', () => {
	test('a valid post can be added', async () => {

		const login = {
			email: 'jsmith001@gmail.com',
			password: 'potato172H'
		}

		const loginResponse = await api
			.post('/api/login')
			.send(login)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		
		const token = loginResponse.body.token
		const newPost = {
			title: "Upcoming Events",
			description: "This is a default description used to test if this works",
			body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
			sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
			Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
			nisi ut aliquip ex ea commodo consequat.`,
		}

		await api
			.post('/api/posts')
			.send(newPost)
			.set('Authorization', `Bearer ${token}`)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const postsAtEnd = await helper.getAllRecords('post')

		expect(postsAtEnd).toHaveLength(3)
	})
})

describe('update of an existing post', () => {
	test('a valid post can be updated', async () => {
		const login = {
			email: 'jsmith001@gmail.com',
			password: 'potato172H'
		}
		const loginResponse = await api
			.post('/api/login')
			.send(login)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		
		const token = loginResponse.body.token
		const updatedPost = {
			title: "Upcoming Events",
			description: "This is a default description used to test if this works",
			body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
			sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
			Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
			nisi ut aliquip ex ea commodo consequat.`,
		}
		await api
			.put('/api/posts/2')
			.send(updatedPost)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const postsAtEnd = await helper.getAllRecords('post')

		expect(postsAtEnd[1].title).toEqual(updatedPost.title)
		expect(postsAtEnd[1].body).toEqual(updatedPost.body)
	})
})

afterAll(async () => {
	db.end()
})