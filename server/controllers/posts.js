const postsRouter = require('express').Router()
const db = require('../db')
const jwt = require('jsonwebtoken')

const obtainToken = request => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		return authorization.substring(7)
	}
	return null
}

postsRouter.get('/', async (request, response, next) => {
	db.query(`SELECT 
		post.title, 
		post.description, 
		post.body, 
		post.date_posted, 
		member.first_name, 
		member.last_name 
		FROM post JOIN member on post.member_id=member.id ORDER BY post.date_posted DESC;`, (err, res) => {
		if (err) {
			return next(err)
		}
		response.json(res.rows)
	})
})

postsRouter.get('/:id', async (request, response, next) => {
	db.query(`SELECT * FROM post WHERE id = $1`, [request.params.id], (err, res) => {
		if (err) {
			return next(err)
		}
		response.json(res.rows[0])
	})
})

postsRouter.post('/', async (request, response, next) => {
	console.log('posting...')
	const token = obtainToken(request)
	const decodedToken = jwt.verify(token, process.env.SECRET)
	if (!token || !decodedToken.id) {
		return response.status(401).json({error: 'token missing or invalid'})
	}
	db.query(`INSERT INTO post (
			title, 
			description,
			body,
			date_posted,
			member_id
		) VALUES ($1, $2, $3, NOW(), $4) RETURNING *`, 
		[request.body.title, request.body.description, request.body.body, 
			decodedToken.id], (err, res) => {
		if (err) {
			return next(err)
		}
		response.status(201).json(res.rows[0])
	})
})

postsRouter.delete('/:id', async (request, response, next) => {
	db.query(`DELETE FROM post WHERE id = $1`, [request.params.id], (err, res)  => {
		if (err) {
			return next(err)
		}
		response.status(204).end()
	})
})

postsRouter.put('/:id', async (request, response, next) => {
	const body = request.body
	const token = obtainToken(request)
	const decodedToken = jwt.verify(token, process.env.SECRET)
	if (!token || !decodedToken.id) {
		return response.status(401).json({error: 'token missing or invalid'})
	}
	db.query(`UPDATE post SET title = $1, description = $2, body = $3 WHERE id = $4 AND member_id = $5 RETURNING *`, 
			[body.title, body.description, body.body, request.params.id, decodedToken.id],
			(err, res) => {
					if (err) {
						return next(err)
					}
					response.json(res.rows[0])
			})
})

module.exports = postsRouter