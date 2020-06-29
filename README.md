# Nodejs-Authenticator(Starter Code)

## Description

A complete authentication system which can be used as a starter code(with a little customisation) for creating any
new application.User information is stored using mongoDB along with the session token.Authentication and session management is handled using passport.Nodemailer is used to mail the reset link for reset password.The system comes fully equiped with starter code for different functionalities and the required library setup.

The functionalities include:
1. Sign up/Sign in with email(Implemented using passport local strategy)
2. Password encryption before storing in database.(Bcrypt)
3. Sign out.
4. Reset password after login.
5. Google login/signup(Implemented using passport OAuth2Strategy)
6. Forgot password(Nodemailer is used to send the reset link)
7. Google reCaptcha v2 verification.
8. Flash notifications.(Implemented using flash and Noty)
9. Parallel jobs for sending mail.(Implemented using Kue and Redis)


## Setting up the project
1. Clone at your local system.
2. Open the folder in visual studio code.
3. Open terminal and make the project folder as your current directory
4. Install all the dependencies as mentioned in the package.json :
```
npm install
```
5. Configure google authetication by adding **client id** and **client secret** in the`config\passport-google-oauth2-stratergy.js` file
   - To configure your own clinet id and secret, please refer: [Google developer docs](https://developers.google.com/adwords/api/docs/guides/authentication#create_a_client_id_and_client_secret).
6. Configure mailer:
   - Add **username** and **password** for the email address being used for sending the email in the`config\nodemailer.js` file  
   - Add the from email address in `config\nodemailer.js`
7. Configure captcha:
   - To configure your own keys, please refer: [google reCAPTCHA](https://www.google.com/recaptcha/admin/create).
   - Add the captcha **site key** in the   `assets\js\signin.js and signup.js`
   - Add the captcha **secret key** in the `controllers\users_controller.js` in the *secret key const*

8.  input the command `npm start` on terminal

9. Pat yourself in the back for making it so far!!

