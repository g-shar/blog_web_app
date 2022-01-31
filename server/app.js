const express = require('express')
const app = express()
const cors = require('cors')
const postsRouter = require('./controllers/posts')
const membersRouter = require('./controllers/members')
const loginRouter = require('./controllers/login')
app.use(express.static('build'))
app.use(express.json())
app.use(cors())

app.use('/api/posts', postsRouter)
app.use('/api/members', membersRouter)
app.use('/api/login', loginRouter)
module.exports = app