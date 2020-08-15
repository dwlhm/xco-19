const db = require('firebase-admin')
const serviceAccount = require('../../secret/serviceAccountKey.json')

db.initializeApp({
    credential: db.credential.cert(serviceAccount),
    databaseURL: "https://garudahacks.firebaseio.com"
})

module.exports = db