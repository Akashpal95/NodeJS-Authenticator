
const User = require('../models/user');
module.exports.home = async function(req, res){
    
    res.render('home');
}
module.exports.contact = function(req, res){
    return res.end('<h1>Contact us here!</h1>');
}
