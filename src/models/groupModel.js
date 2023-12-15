const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let groupSchema = new Schema({
    name:{
        type : String,
        required : true,
    },
    admin_id:{
        type : String,
        required : true
    },
    members_id:{
        type: Array,
        required : true
    },
    membresInvited:{
        type: Array,
        required : true
    }
});

module.exports = mongoose.model('Group', groupSchema);