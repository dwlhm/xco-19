const { Sensor } = require('./db/model')

const sensor = async (req, res) => {

    const ht = req.query.ht
        , temp = req.query.temp
        , cough = req.query.cough
        , id = req.query.id

    if (!ht || !temp || !cough || !id) {
        res.status(400)
        res.json({msg: 'Fill in the forms carefully'})        
    } else {
        let sensor = await Sensor.add({
            oxy_state: ht,
            temp_state: temp,
            cough_state: cough,
            user_id: id,
            write_on: new Date()
        }).then(it => true).catch(err => console.log(err))

        res.status(!sensor ? 400 : 200)
        res.json({msg: 'success'})
    }
}

module.exports = sensor