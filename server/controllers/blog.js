const { response } = require('express')

const blogRouter = require('express').Router()
const db = require('../db')

blogRouter.get('/', async (request, response, next) => {
	db.query(`SELECT * FROM posts`, (err, res) => {
		console.log(err, res)
		if (err) {
			return next(err)
		}
		response.json(res.rows)
	})
})

blogRouter.get('/:id', async (request, response, next) => {
	db.query(`SELECT * FROM posts WHERE id = $1`, [request.params.id], (err, res) => {
		console.log(err, res)
		if (err) {
			return next(err)
		}
		response.send(res.rows[0])
	})
})

blogRouter.post('/', async (request, response, next) => {
	console.log('posting...')
	db.query(`INSERT INTO posts (first_name, last_name) VALUES ($1, $2)`, [request.body.first_name, request.body.last_name], (err, res) => {
		if (err) {
			return next(err)
		}
	})
	response.status(204).end()
})

blogRouter.delete('/:id', async (request, response, next) => {
	db.query(`DELETE FROM posts WHERE id = $1`, [request.params.id], (err, res)  => {
		if (err) {
			return next(err)
		}
		response.status(204).end()
	})
})


module.exports = blogRouter