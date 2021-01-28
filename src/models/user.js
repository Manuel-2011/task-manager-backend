const mongoose =  require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minLength: [6, 'The password is too short'],
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('The password cant contain the sting password')
            }
        }
    },
    email : {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email invalid!.')
            }
        }
    },
    age: {
        type: Number,
        validate(value) {
            if (value<0) {
                throw new Error('The age cant be negative')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
}, {
    timestamps: true
})

// retalationship with Task model
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// get public user info replacing the toJSON method ensuring that is always called
userSchema.methods.toJSON = function () {
    const user = this
    const userOject = user.toObject() // delte user methods
    delete userOject.password
    delete userOject.tokens
    
    return userOject
}

// attaching instance method to generate auth token
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'task-manager-secret')

    // save the token in the database, it is an array so each device in which the user is loggedin has its own token
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login!')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// delete all tasks of the user before deleting the user
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User