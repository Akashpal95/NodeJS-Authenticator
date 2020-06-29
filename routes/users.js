const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../controllers/users_controller');

router.get('/profile/:id',passport.checkAuthentication, usersController.profile);
router.post('/update/:id',passport.checkAuthentication, usersController.update);

// router.get('/activity', usersController.activity);


router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);
router.get('/sign-out', usersController.destroySession);

router.post('/create', usersController.create);
//Use passport as a middleware to authenticate(This is the main middleware needed to authenticate everytime a user signs in)
router.post('/check-captcha',usersController.recaptcha)
router.post('/create-session',passport.authenticate(
    'local',
    {failureRedirect : '/users/sign-in'}
),usersController.createSession);

router.get('/auth/google', passport.authenticate('google', {scope : ['profile', 'email']}));
router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect : 'user/sign-in'
}), usersController.createSession);

//In case of forgot password route to find account
router.get('/forgot-password', usersController.forgotPassword);
router.post('/find-account', usersController.findAccount);

//To reset password
router.get('/reset-password/:accessToken', usersController.resetPasswordCheck);
router.get('/reset-password', usersController.resetPassword)
router.post('/reset-password', usersController.updatePassword)
module.exports = router;