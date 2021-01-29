// run the file to connect to the database
require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express()

const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})

const Task = require('./models/task')
const User= require('./models/user')

// const main = async () => {
//   // const task = await Task.findById('6012f8d056245a5ea0eb6aef').populate('owner').populate()
//   // // await task
//   // console.log(task)

//   // const user = await (await User.findById('6012f8be56245a5ea0eb6aed'))
//   // await user.populate('tasks').execPopulate()
//   // console.log(user.tasks)
// }

// main()