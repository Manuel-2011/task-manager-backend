// run the file to connect to the database
require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express()


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

module.exports = app