const router = require('express').Router()
const sequelize = require('sequelize')
const { Blog, User } = require('../models/')

router.get('/', async (req, res) => {
    const blogs = await Blog.findAll({
        attributes: [
            'author',
            [sequelize.fn('COUNT', sequelize.col('id')), 'blogs'],
            [sequelize.fn('SUM', sequelize.col('likes')), 'likes']
        ],
        group: ['author']
    })
    res.json(blogs)
})

module.exports = router