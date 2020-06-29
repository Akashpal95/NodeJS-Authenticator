const User = require('../models/user');
const RPT = require('../models/reset_password_token');
const resetPasswordMailer = require('../mailers/reset_password_mailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const rounds = 10;
const queue = require('../config/kue');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { stringify } = require('querystring');
const resetPasswordWorker = require('../workers/reset_password_email_worker');
//filesystem module
const fs = require('fs');
const path = require('path');

module.exports.profile = async function(req, res){
    try{
        let user = await User.findById(req.params.id);

        return res.render('user_profile', {
            title: 'Codeial | User Profile',
            profile_user:user
        });
    }catch(err){
        console.log('Error in finding user profile : ', err);
        return res.redirect('back');
    }
 
}

module.exports.update = async function(req, res){
    // if(req.user.id == req.params.id){
    //     //req.body can be sent or expanded for {name:req.body.name, email:req.body.email} which is basically same as req.body
    //     User.findByIdAndUpdate(req.params.id, req.body,function(err, user){
    //         return res.redirect('back');
    //     });
    // }else{
    //     //If update fails return http status code for error
    //     return res.status(401).send('Unauthorised');
    // }
    if(req.user.id == req.params.id){
        try{
            let user = await User.findById(req.params.id);
            User.uploadAvatar(req, res, function(err){
                if(err){console.log('Multer Error : ', err)}
                
                user.name = req.body.name;
                user.email = req.body.email;
                
                if(req.file){
                    
                    if(user.avatar){
                        if(fs.existsSync(path.join(__dirname, '..',user.avatar))){
                            fs.unlinkSync(path.join(__dirname, '..',user.avatar))
                        }
                    }
                    
                    //Saving the path of the uploaded file in avatar field in user
                    user.avatar = User.avatarPath +"/" +req.file.filename;
                }
                user.save();
                return res.redirect('back');
            });   
        }catch(err){
            req.flash('error', err);
            return res.redirect('back');
        }
    }else{
        req.flash('error', 'Unauthorized');
        //If update fails return http status code for error
        return res.status(401).send('Unauthorised');
    }
}

// render the sign up page
module.exports.signUp = function(req, res){
    if(req.isAuthenticated()){
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_up', {
        title: "Codeial | Sign Up"
    })
}


// render the sign in page
module.exports.signIn = function(req, res){
    if(req.isAuthenticated()){
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_in', {
        title: "Codeial | Sign In"
    })
}

// get the sign up data
module.exports.create = async function(req, res){
    // console.log(req.body);
    try{
        if (req.body.password != req.body.confirm_password){
            req.flash('error', 'Passwords didn\'t match.Try again!');
            return res.redirect('back');
        }

        let user = await User.findOne({email: req.body.email}); 

        if (!user){
            console.log(req.body);
            let hash = await bcrypt.hash(req.body.password, rounds);
            console.log(hash)
            req.body.password = hash;
            console.log(req.body);
            User.create(req.body, function(err, user){
                if(err){console.log('error in creating user while signing up'); return}
                req.flash('success', 'You have signed up successfully!')
                return res.redirect('/users/sign-in');
            })
        }else{
            req.flash('error', 'User already exists!');
            console.log(user);
            return res.redirect('back');
        }
    }
    catch(err){
        console.log('Error in checking if the user already exists : ', err);
        return res.redirect('back');
    }
}


// sign in and create a session for the user
module.exports.createSession = function(req, res){
    console.log('Coming here');
    //First argument is type of flash message
    req.flash('success', 'Logged in Successfully');
    return res.redirect('/');
}

module.exports.destroySession = function(req, res){
    req.logout();
    req.flash('success', 'You have logged out');
    return res.redirect('/');
}

module.exports.forgotPassword = function(req, res){
    if(req.isAuthenticated()){
        return res.redirect('/');
    }
    return res.render('find_account');
}
//Find account exists or not and schedule a job to send reset link mail
module.exports.findAccount = async function(req, res){
    console.log(req.body);
    try{
        let user = await User.findOne(req.body);
        console.log(user);
        if(user){
            let token = await RPT.create({
                accessToken: crypto.randomBytes(20).toString('hex'),
                user:user._id
            })
            console.log(token);
            // resetPasswordMailer.resetPassword(user, token);
            //Add the job of sending mail in th queue 'emails'
            let job = queue.create('emails', {user:user, token:token}).save(function(err){
                if(err){
                console.log('Error in creating a queue : ', err)
                }
                console.log('Job enqueued : ',job.id);
            });
            req.flash('success', 'A reset password Link has been sent to your mail.');
        }else{
            req.flash('error', 'User not found!');
            console.log('User not found');
        }
        res.redirect('back');
    }catch(err){
        console.log('Error in finding account to reset password: ', err);
        return res.redirect('back');
    }    
}
//Check if the reset link token valid and redirect to reset password page
module.exports.resetPasswordCheck = async function(req, res){
    try{
        let token = await RPT.findOne({accessToken:req.params.accessToken});
        if(token && token.isValid){
            let user = await User.findById(token.user);
            console.log(user);
            console.log('User ID : ', user._id);
            return res.render('reset_password', {
                userID : user._id,
                tokenID: token._id
            })
            
            // return res.redirect('/users/sign-in');
        }else{
            req.flash('error', 'Link has expired');
            console.log('Token doesn\'t exist or it has expired');
            return res.redirect('/');
        }
    }catch(err){
        console.log('Error in reset password check: ', err);
        return res.redirect('/');
    }      
}
//reset the password
module.exports.resetPassword = async function(req, res){
    if(req.isAuthenticated()){
        console.log('coming here');
        return res.render('reset_password');
    }
    if (req.body.password != req.body.confirm_password){
        req.flash('error', 'Passwords didn\'t match.Try again!!');
        return res.redirect('back');
    }
    console.log('inside here');
    let user = await User.findById(req.body.userID);
    let hash = await bcrypt.hash(req.body.password, rounds);
    console.log(hash);
    user.password = hash;
    user.save();

    RPT.findByIdAndDelete(req.body.tokenID, function (err, docs) { 
        if (err){ 
            console.log(err) 
        } 
        else{ 
            console.log("Deleted : ", docs); 
        } 
    });
    req.flash('success', 'Your password was successfully reset.');
    res.redirect('/users/sign-in');
}

//update the password after logged
module.exports.updatePassword = async function(req, res){
    console.log('Inside update')
    if (req.body.password != req.body.confirm_password){
        req.flash('error', 'Passwords didn\'t match.Try again!');
        return res.redirect('back');
    }
    let user = await User.findById(req.body.userID);
    if(req.body.tokenID){
        RPT.findByIdAndDelete(req.body.tokenID, function (err, docs) { 
            if (err){ 
                console.log(err) 
            } 
            else{ 
                console.log("Deleted : ", docs); 
            } 
        });
    }
    let hash = await bcrypt.hash(req.body.password, rounds);
    user.password = hash;
    user.save();
    req.flash('success', 'Your password was successfully reset.');
    res.redirect('/');
}
//To check if captcha is checked and valid
module.exports.recaptcha = async function(req, res){
    console.log('RECAPTCHA')
    if (!req.body.captcha){
        console.log('Please select captcha!!');
        // req.flash('error', 'Please select Captcha!');
        // return res.redirect('/');
        return res.json({ success: false, msg: 'Please select captcha' });
    }

  // Secret key
  const secretKey = '6LdnsaoZAAAAALH9FYw7R9trhW9zIAVJK_NQM-6g';

  // Verify URL
  const query = stringify({
    secret: secretKey,
    response: req.body.captcha,
    remoteip: req.connection.remoteAddress
  });
  const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

  // Make a request to verifyURL
  const body = await fetch(verifyURL).then(res => res.json());

  // If not successful
  if (body.success !== undefined && !body.success){
    return res.json({ success: false, msg: 'Failed captcha verification' });
    // console.log('Failed captcha verification');
  }

  // If successful
  return res.json({ success: true, msg: 'Captcha passed' });
    // console.log('Captcha passed');
}