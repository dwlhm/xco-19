const { Sensor, Location } = require('./db/model')

const sensor = async (req, res) => {

    const ht = req.query.ht
        , temp = req.query.temp
        , cough = req.query.cough
        , id = req.query.id

    if (!ht || !temp || !cough || !id) {
        res.status(400)
        res.json({msg: 'Fill in the forms carefully'})        
    } else {

        let score = 0
        let status

        if (60 > ht < 100) {
            score++
        }

        if (36.5 > temp < 37.5) {
            score++
        }

        if (cough == "normal") {
            score++
        }

        let myLoc

        const loc = await Location.where('user_id', '==', id).orderBy('write_on', 'asc').limit(1).get().then(it => {
            if (it.empty) {
                return false
            } else {
                
                return it.forEach(it => {
                    myLoc = {
                        location: it.data().location,
                        location_status: it.data().loc_status
                    }
                }).then(() => true).catch(err => console.log(err))
            }
        })

        if (score>=4) {
            status = "Not infected with COVID-19"
        } else {
            status = "Infected with COVID-19"
        }

        let sensor = await Sensor.add({
            oxy_state: ht,
            temp_state: temp,
            cough_state: cough,
            user_id: id,
            location_state: myLoc.location,
            location_odd: myLoc.location_status,
            user_status: status,
            write_on: new Date()
        }).then(it => true).catch(err => console.log(err))

        res.status(!sensor ? 400 : 200)
        res.json({msg: 'success'})
    }
}

module.exports = sensor