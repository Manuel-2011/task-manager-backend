const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const task= require('../../src/models/task')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'mike',
    email: 'mike@example.com',
    password: 'pas1234',
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'angie',
    email: 'angie@example.com',
    password: 'myCat123',
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
} 

const taskOneId = mongoose.Types.ObjectId()
const taskOne = {
    _id: taskOneId,
    description: 'This is test task one',
    completed: false,
    owner: userOneId
}

const taskTwo = {
    _id: mongoose.Types.ObjectId(),
    description: 'This is test task two.',
    completed: true,
    owner: userOneId
}

const taskThree = {
    _id: mongoose.Types.ObjectId(),
    description: 'This is test task three.',
    owner: userTwoId
}

const setupDatabase = async () => {
    await User.deleteMany() //delete every user
    await Task.deleteMany() //delete every task
    await new User(userOne).save() // create a sample user
    await new User(userTwo).save() // create a second sample user
    await new Task(taskOne).save() // task sample
    await new Task(taskTwo).save() // task sample
    await new Task(taskThree).save() // task sample
}

module.exports = {
    userOne,
    userOneId,
    userTwo,
    taskOneId,
    setupDatabase
}