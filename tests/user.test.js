const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneId, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)


test('Signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'manuel',
        email: 'manuel@example.com',
        password: 'pas1234',
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Asertion about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'manuel',
            email: 'manuel@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('pas1234')
})

test('Login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOne._id)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Login non-existing user', async() => {
    await request(app).post('/users/login').send({
        email: 'mmm@example.com',
        password: 'ppp1234'
    }).expect(400)
})

test('Get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Get profile for non-existing user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Delete account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOne._id)
    expect(user).toBeNull()
})

test('Delete account non-existing user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update user data', async () => {
    await request(app).put('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name: 'Angie'})
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Angie')
})

test('Not update invalidated fields', async () => {
    await request(app).put('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name: 'Angie', location: 'colombia'})
        .expect(400)

})