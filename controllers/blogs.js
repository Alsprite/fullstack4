const router = require('express').Router()

const { Blog } = require('../models')

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll()
  res.json(blogs)
})

router.post('/', async (req, res) => {
  try {
    const blogs = await Blog.create(req.body)
    res.json(blogs)
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
  
  router.delete('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
      await req.blog.destroy()
    }
    res.status(204).end()
  })
  
  router.put('/:id', blogFinder, async (req, res) => {
    console.log('PUT /:id/likes - Request Body:', req.body);
    console.log('PUT /:id/likes - Found Blog:', req.blog);
  
    if (req.blog) {
      try {
        req.blog.likes = req.body.likes; // Assuming your request body contains the updated like amount
        await req.blog.save();
        console.log('Likes Updated:', req.blog.likes);
        res.json(req.blog);
      } catch (error) {
        console.error('Error Updating Likes:', error);
        res.status(400).json({ error });
      }
    } else {
      res.status(404).end();
    }
  })

module.exports = router