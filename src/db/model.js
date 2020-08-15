const db = require('./firestore')

const User = db.firestore().collection('user')

const Sensor = db.firestore().collection('sensor')

module.exports = { User, Sensor }