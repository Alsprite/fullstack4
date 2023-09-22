const router = require('express').Router()
const { List } = require('../models')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')
const userFinder = require('../util/sessionChecker')

router.post('/', userFinder, async (req, res) => {
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

router.put('/:id', userFinder, async (req, res) => {
    try {
        const { read } = req.body
        const id = req.params.id
        const list = await List.findByPk(id)

        if (!list) {
            return res.status(404).json({ error: 'List not found' })
        }

        const currentId = req.decodedToken.id
        const listUserId = list.userId
        console.log(currentId, listUserId)

        if (currentId !== listUserId) {
            return res.status(500).json({
                error: 'You can only update your own reading list!'
            })
        }

        const updatedList = await List.update({ read }, {
            where: {
                id: id
            }
        });

        res.json(updatedList);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            error: 'Something went wrong. Please try again!'
        })
    }
});

module.exports = router