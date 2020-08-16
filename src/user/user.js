const express = require('express')
    , router = express.Router()
    , fs = require('fs')
    , { User, Sensor, Location, Zone } = require('../db/model')
    , axios = require('axios')

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

    console.log(userCheck)

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
                                                                        tempState: docs.data().temp_state,
                                                                        oxyState: docs.data().oxy_state,
                                                                        location: docs.data().location_state,
                                                                        location_status: docs.data().location_odd,
                                                                        status: docs.data().user_status,
                                                                        writeOn: tgl
                                                                    }
                                                                })
                                                                return data
                                                            } else {
                                                                return false
                                                            }
                                                        }).catch(err => console.log(err))

                                                        console.log(getData)
                                                
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

        const userCity = await axios.get('http://api.positionstack.com/v1/reverse?access_key=eda34907d4f4305a065838523af6f860&query=' + lat + ',' + lon)
                                    .then(function (response) {
                                        // handle success
                                        console.log(response.data.data[0].locality);
                                        return response.data.data[0].locality
                                    })
                                    .catch(function (error) {
                                        // handle error
                                        console.log(error);
                                        return false
                                    })

        const checkZone = userCity == false ? false : await Zone.doc(userCity).get().then(it => {
            return it.exists ? it.data().title : false
        }).catch(err => console.log(err))

        const write = await Location.add({
            user_id: userCheck,
            longitude: lon,
            latitude: lat,
            location: userCity,
            location_status: checkZone,
            write_on: new Date()
        }).then(() => true).catch(err => console.log(err))

        axios({
            method: 'post',
            url: 'https://api.thebigbox.id/sms-notification/1.0.0/messages',
            data: 'msisdn=082121433085&content=take%20care%20of%20yourself,%20you%20are%20in%20the%20red%20zone%20of%20COVID-19',
            headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-api-key': 'sNXYeU73io97jeS3B0jHXWzuRNEHgHyU' }
            })
            .then(function (response) {
                //handle success
                console.log(response);
            })
            .catch(function (response) {
                //handle error
                console.log(response);
            });

        res.status(write ? 200 : 400)
        res.json({msg: write})
    }
})

module.exports = router