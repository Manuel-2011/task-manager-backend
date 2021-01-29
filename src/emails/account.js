const sgMail = require('@sendgrid/mail')

const sendgridAPIkey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIkey)

const msg = {
    
  }

const sendWelcome = (email, name) => {
    sgMail({
        to: email,
        from: 'mosquera.manuel2011@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    })
}

module.exports = {
    sendWelcome,
}