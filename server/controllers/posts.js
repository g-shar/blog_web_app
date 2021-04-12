const postsRouter = require('express').Router()
const db = require('../db')

postsRouter.get('/', async (request, response, next) => {
	db.query(`SELECT * FROM post`, (err, res) => {
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
		console.log('response: ', res.rows[0])
		response.json(res.rows[0])
	})
})

postsRouter.post('/', async (request, response, next) => {
	console.log('posting...')
	db.query(`INSERT INTO post (
			title, 
			description,
			body,
			date_posted,
			cover_image_id,
			member_id
		) VALUES ($1, $2, $3, NOW(), $4, $5)`, 
		[request.body.title, request.body.description, request.body.body, 
			request.cover_image_id, request.user_id], (err, res) => {
		if (err) {
			return next(err)
		}
		console.log("POST RESPONSE: ", res)
		response.status(200)
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
	db.query(`UPDATE post SET title = $1, description = $2, body = $3 WHERE id = $5`, 
			[body.title, body.description, body.body, request.params.id],
			(err, res) => {
					if (err) {
						return next(err)
					}
					response.json(res.rows[0])
			})
})

module.exports = postsRouter