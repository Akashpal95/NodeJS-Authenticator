const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user')
//To encrypt password
const bcrypt = require('bcrypt');
const rounds = 10
//Callback function to check if the password matches or not.
let passwordCheck = async function(req,email, password, done){
     //find a user and establish identity
    await User.findOne({email:email}, async function(err, user){
        if(err){
            req.flash('error', err);
            console.log('Error in finding user --> passport');
            return done(err);//done takes 2 argument : 1 is error, 2 is user(No user here and js is capable of taking one argument even when two are mentioned)
        }
        try{
            //Compare encrypted password
            let passwordMatch = await bcrypt.compare(password, user.password);
            if(!user || !passwordMatch){
                req.flash('error', 'Invalid Username/Password');
                console.log('Invalid Username/Password');
                return done(null, false);//done takes 2 argument : 1 is error, 2 is user(here it is false because no user is found)
            }
            //the user is found and sent
            return done(null, user);
        }catch(error){
            console.log('Error in matching user information :', error);
        }      
    });
}
//authentication using passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback:true //let's us pass the req object to the call back function
    },passwordCheck
    //done is a call back function
    //if the user is found it is returned through this call back function
    // function(req,email, password, done){
        
    //     //find a user and establish identity
    //     User.findOne({email:email}, function(err, user){
    //         if(err){
    //             req.flash('error', err);
    //             console.log('Error in finding user --> passport');
    //             return done(err);//done takes 2 argument : 1 is error, 2 is user(No user here and js is capable of taking one argument even when two are mentioned)
    //         }
    //         if(!user || user.password != password){
    //             req.flash('error', 'Invalid Username/Password');
    //             console.log('Invalid Username/Password');
    //             return done(null, false);//done takes 2 argument : 1 is error, 2 is user(here it is false because no user is found)
    //         }
    //         //the user is found and sent
    //         return done(null, user);
    //     });
    // }
));

//Serializing the user to decide which key to be kept in the cookies
passport.serializeUser(function(user, done){
    done(null, user.id);
});


//Deserializing the user from the key in the cookies
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        if(err){
            console.log('Error in fetching user logged in.-->Passport');
            return done(err);
        }
        return done(null, user);//done takes 2 argument : 1 is error, 2 is user found
    });
});


passport.checkAuthentication = function(req, res, next){
    //if the user is signed in then pass on the request ot next function which is my controller function
    if (req.isAuthenticated()){
        return next();
    }
    //if the user is not signed in
    return res.redirect('/users/sign-in');
}

passport.setAuthenticatedUser = function(req, res, next){
    if(req.isAuthenticated()){
        //req.user containes the currentsigned in user from the session cookie and we are just sending this to the locals for the views
        res.locals.user = req.user;
    }
    next();
}

module.exports = passport;



