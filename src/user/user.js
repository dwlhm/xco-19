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
    res.json({msg: getInfo})
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
                                                        .orderBy('write_on', 'asc')
                                                        .limit(1).get().then(it => {
                                                            if (!it.empty) {
                                                                let data
                                                                it.forEach(docs => {
                                                                    data = {
                                                                        coughState: docs.data().cough_state,
                                                                        coughOdd: docs.data().cough_odd,
                                                                        tempState: docs.data().temp_state,
                                                                        tempOdd: docs.data().temp_odd,
                                                                        oxyState: docs.data().oxy_state,
                                                                        oxyOdd: docs.data().oxy_odd,
                                                                        locState: docs.data().loc_state,
                                                                        locOdd: docs.data().loc_odd,
                                                                        writeOn: docs.data().write_on
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

module.exports = router