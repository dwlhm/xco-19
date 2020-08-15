const { Sensor } = require('./db/model')

const sensor = async (req, res) => {

    const oxi = req.query.oxi
        , temp = req.query.temp
        , cough = req.query.cough
        , coughO = req.query.cougho
        , userId = req.headers.id

    if (!oxi || !temp || !cough || !userId) {
        res.status(400)
        res.json({msg: 'Fill in the forms carefully'})        
    } else {
        let sensor = await Sensor.add({
            oxy_state: oxi,
            temp_state: temp,
            cough_state: cough,
            cough_odd: coughO,
            user_id: userId,
            write_on: new Date()
        }).then(it => true).catch(err => console.log(err))

        res.status(!sensor ? 400 : 200)
        res.json({msg: 'success'})
    }
}

module.exports = sensor