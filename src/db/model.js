const db = require('./firestore')

const User = db.firestore().collection('user')

const Sensor = db.firestore().collection('sensor')

const Location = db.firestore().collection('location')

const Zone = db.firestore().collection('zona')

module.exports = { User, Sensor, Location, Zone }