const mongoose = require('mongoose')

const LogSchema = new mongoose.Schema({
    details: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Log = mongoose.model('Log', LogSchema)

module.exports = Log;
