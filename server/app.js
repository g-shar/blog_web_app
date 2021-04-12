const express = require('express')
const app = express()
const cors = require('cors')
const postsRouter = require('./controllers/posts')
app.use(express.json())

app.use('/api/posts', postsRouter)

module.exports = app