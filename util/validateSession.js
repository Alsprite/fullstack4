const { Session } = require('../models/session')

const validateSession = async ({id, token}) => {
    const session = await Session.findOne({
        where: {
            userId: id
        }
    })
    if (!session || !(session.token == token)) {
        return false
    }
    return true
}

module.exports = validateSession