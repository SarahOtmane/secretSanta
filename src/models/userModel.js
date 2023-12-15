const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    email:{
        type : String,
        required : true,
        unique : true,
    },
    password:{
        type : String,
        required : true
    },
    //boolean qui va me permettre de savoir si le compte a été créer par le user lui meme ou pas
    created:{
        type: Boolean,
        default: true,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);