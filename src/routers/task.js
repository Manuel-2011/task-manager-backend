const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

// add a task
router.post('/tasks', auth,  (req, res) => {
    const newTask = new Task({
      ...req.body,
      owner: req.user._id
    })
    newTask.save().then(() => {
      res.status(201).send(newTask)
    }).catch(err => {
      res.status(400).send(err)
    })
  })
  
  //get tasks?completed=true
  //get tasks?limit=10&skip=20 pagination
  //get tasks?sortBy=createdAt:desc
  router.get('/tasks', auth,  async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
      match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
      await req.user.populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      }).execPopulate()

      res.send(req.user.tasks)
    } catch (error) {
      res.status(500).send()
    }
    
    Task.find().then((tasks) => {
      res.status(200).send(tasks)
    }).catch(e => {
      res.status(400).send(e)
    })
  })
  
  //get a task by id
  router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
      const task = await Task.findOne({ _id, owner: req.user._id })

      if (!task) {
        return res.status(404).send()
      }

      res.send(task)
    } catch (error) {
      res.status(500).send(error)
    }
  })
  
  //remove a task by id and count incomplete tasks
  router.delete('/tasks/:id', auth, (req, res) => {
    const _id = req.params.id
    Task.findOneAndDelete({_id, owner: req.user._id}).then((task) => {
      if (!task) {
        res.status(404).send()
      }
      console.log('tarea eliminada')
      return Task.where({completed: false}).countDocuments()
    }).then((count) => {
      console.log('cuenta de tareas icompleta:', count)
      res.status(200).send({'count':count})
    }).catch(e => {
      res.status(500).send(e)
    })
  })
  
  // update a task
router.put('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
  
    if (!isValidOperation) {
      return res.status(400).send({error: 'Invalid fields to update!'})
    }
  
    try {
  
      const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
      updates.forEach(update => task[update] = req.body[update])
      await task.save()

      if (!task) {
        return res.status(404).send()
      }
      res.status(200).send(task)
    } catch(e) {
      res.status(500).send(e)
    }
    
  })
  
  // delete a task
  router.delete('/tasks/:id', async (req, res) => {
    try {
  
      const task = await Task.findByIdAndDelete(req.params.id)
      if (!task) {
        res.status(404).send()
      }
      return res.status(200).send(task)
    } catch(e) {
      res.status(400).send(e)
    }
    
  })

  module.exports = router