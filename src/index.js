const express = require('express')
    , cookieParser = require('cookie-parser')
    , cors = require('cors')
    , bodyParser = require('body-parser')
    , user = require('./user/user')
    , sensor = require('./sensor')


require('dotenv').config()

// Local
const logger = require('./logger')
const port = process.env.PORT

// Services
const auth = require('./auth/auth')
const jwt = require('./auth/jwt')
const { authenticateToken } = require('./auth/jwt')

// Configuration
const app = express()

// App Configure
    app.use(express.static('public'));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

app.use(logger)

app.use('/auth', auth)
app.use('/user', authenticateToken , user)

app.get('/sensor', sensor)

app.use( async (req, res, next) => {

    res.status(404)
    res.json({msg: 'not found'})

})

app.use((err, req, res, next) => {

    console.log(err)
    res.status(500)
    res.json({msg: 'system error'})

});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

  