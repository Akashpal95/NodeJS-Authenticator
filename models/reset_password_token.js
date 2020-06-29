const mongoose = require('mongoose');

const RPTSchema = mongoose.Schema({
    accessToken:{
        type :String,
        required: true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    isValid:{
        type :Boolean,
        required: true,
        default: true
    }
},{ timestamps:true});

const RPT = mongoose.model('ResetPasswordToken', RPTSchema);
module.exports = RPT;