const {Schema, model} = require('mongoose');

const SubordinateSchema = new Schema({
    bossId: {type: Schema.Types.ObjectId, ref: 'User'},
    userId: {type: Schema.Types.ObjectId, ref: 'User'}

})

module.exports = model('Subordinate', SubordinateSchema);
