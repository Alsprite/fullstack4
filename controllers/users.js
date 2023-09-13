const router = require('express').Router()

const { User, Blog } = require('../models')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

router.put('/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.username = req.body.username;
    await user.save();

    console.log('Username updated:', user.username);
    res.json(user);
  } catch (error) {
    return res.status(400).json({ error });
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    console.log(id)
    const user = await User.findByPk(id, {
      attributes: { exclude: [''] },
      include: [{
        model: Blog,
        as: 'readings',
        attributes: ['id', 'author', 'title', 'url', 'likes', 'year'],
        through: { attributes: [] }
      }]
    })
    res.json(user)
  } catch (error) {
    return res.status(400).json({ error })
  }
})

module.exports = router