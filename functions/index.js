const admin = require('./admin')
admin.init()

exports.lobby = require('./lobby')
exports.game = require('./game')
