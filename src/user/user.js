const { decode } = require('punycode')
const { route } = require('../auth/auth')

const express = require('express')
    , router = express.Router()
    , fs = require('fs')
    , { User, Sensor } = require('../db/model')

router.get('/logout', async (req, res) => {

    const userCheck = await User.doc(req.user.session).get().then(it => {
        if (it.exists) {
            return it.data().logged_in
        } else {
            return false
        }
    })

    const logout = !userCheck ? false : await User.doc(req.user.session).update({
        logged_in: false,
        logout_on: new Date()
    }).then(it => {
        return true
    }).catch(err => console.log(err))

    res.status(logout == false ? 400 : 200)
    res.json({msg: logout})

})

router.get('/info', async (req, res) => {

    const getId = await User.doc(req.user.session).get().then(it => {
        if (it.exists) {
            return it.data().user_id
        } else {
            return false
        }
    })

    const getInfo = !getId ? false : await User.doc(getId).get().then(it => {
        if (it.exists) {
            return {
                name: it.data().name,
                email: it.data().email
            }
        } else {
            return false
        }
    })

    res.status(getInfo == false ? 400 : 200)
    res.json({name: getInfo.name, email: getInfo.email})
})

router.get('/sensor', async (req, res) => {

    const userCheck = await User.doc(req.user.session).get().then(it => {
        if (it.exists) {
            return it.data().user_id
        } else {
            return false
        }
    })

    const getData = !userCheck ? false : await Sensor.where('user_id', '==', userCheck)
                                                        .orderBy('write_on', 'desc')
                                                        .limit(1).get().then(it => {
                                                            if (!it.empty) {
                                                                let data
                                                                it.forEach(docs => {
                                                                    let tgl = docs.data().write_on.toDate()
                                                                    tgl = tgl.getDate() + "-" + tgl.getMonth() + "-" + tgl.getFullYear() + " " + tgl.getHours() + ":" + tgl.getMinutes() + ":" + tgl.getSeconds()
                                                                    data = {
                                                                        coughState: docs.data().cough_state,
                                                                        coughOdd: docs.data().cough_odd,
                                                                        tempState: docs.data().temp_state,
                                                                        tempOdd: docs.data().temp_odd,
                                                                        oxyState: docs.data().oxy_state,
                                                                        oxyOdd: docs.data().oxy_odd,
                                                                        locState: docs.data().loc_state,
                                                                        locOdd: docs.data().loc_odd,
                                                                        writeOn: tgl
                                                                    }
                                                                })
                                                                return data
                                                            } else {
                                                                return false
                                                            }
                                                        }).catch(err => console.log(err))
                                                
    res.status(!getData ? 400 : 200)
    res.json(getData)
})

router.post('/gps', async (req, res) => {

    const lat = req.body.lat
    const lon = req.body.lon

    if (!lat || !lon) {
        res.status(400)
        res.json({msg: 'Fill in the form carefully'})
    } else {

        const userCheck = await User.doc(req.user.session).get().then(it => {
            if (it.exists) {
                return it.data().user_id
            } else {
                return false
            }
        })
        
        const write = Sensor.add({
            user_id: userCheck,
            longitude: lon,
            latitude: lat,
            write_on: new Date()
        }).then(() => true).catch(err => console.log(err))

        res.status(write ? 200 : 400)
        res.json({msg: write})
    }
})

module.exports = router