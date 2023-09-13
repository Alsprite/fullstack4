const router = require('express').Router()
const { List } = require('../models')

router.post('/', async (req, res) => {
    try {
        console.log('LIST: ', List)
        const list = await List.create(req.body)
        res.json(list)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            error: 'Something went wrong. Please try again!'
        })
    }
})

module.exports = router