const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')

const currentYear = new Date().getFullYear();

router.get('/', async (req, res) => {
  const where = {}
  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.substring]: req.query.search } },
      { author: { [Op.substring]: req.query.search } }
    ]
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [['likes', 'DESC']]
  })
  res.json(blogs)
})

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('Authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      const token = authorization.substring(7);
      const decodedToken = jwt.verify(token, SECRET);
      req.decodedToken = decodedToken
    } catch (error) {
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }

  next()
}

router.post('/', tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const { author, url, title, likes, year } = req.body
    console.log(req.body)
    if (!req.body.year || req.body.year < 1991 || req.body.year > currentYear ) {
      throw Error('The year should be at least 1991 and no greater than current year!')
    }
    const blog = await Blog.create({
      author,
      url,
      title,
      likes,
      year,
      userId: user.id
    })
    console.log(blog)
    res.json(blog)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    if (req.blog) {
        req.likes = req.body.likes
        next()
    } else {
        res.status(404).end()
    }
  }
  
  router.get('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
      res.json(req.blog)
    } else {
      res.status(404).end()
    }
  })
  
  router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
    if (req.blog) {
      if (req.blog.userId !== req.currentUser.id) {
        return res.status(403).json({ error: 'You do not have permission to delete this blog.' });
      }
      
      await req.blog.destroy();
      return res.status(204).end();
    } else {
      return res.status(404).end();
    }
  });
  
  router.put('/:id', blogFinder, async (req, res) => {
    console.log('PUT /:id/likes - Request Body:', req.body);
    console.log('PUT /:id/likes - Found Blog:', req.blog);
  
    if (req.blog) {
      try {
        req.blog.likes = req.body.likes
        await req.blog.save()
        console.log('Likes Updated:', req.blog.likes)
        res.json(req.blog)
      } catch (error) {
        console.error('Error Updating Likes:', error)
        res.status(400).json({ error })
      }
    } else {
      res.status(404).end()
    }
  })

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  const errorHandler = (error, request, response, next) => {
    console.error(error) // Log the error for debugging purposes
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({
        error: 'invalid token'
      })
    }
  
    next(error)
  }

router.use(unknownEndpoint)
router.use(errorHandler)

module.exports = router