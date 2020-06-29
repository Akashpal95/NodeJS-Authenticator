const nodeMailer = require('../config/nodemailer');

//Another way of importing a method
exports.resetPassword = (user, token) => {
    // let htmlString  = `<p>Reset Link:</p><p>http://localhost:8000/users/reset-password/${token.accessToken}</p>`
    let htmlString =nodeMailer.renderTemplate({token: token , username:user.name}, '/password/reset_password.ejs');
    nodeMailer.transporter.sendMail({
        from: 'sender.email@gmail.com',
        to:user.email,
        subject: "Reset Password",
        html : htmlString
    }, (err, info) => {
        if(err){
            console.log('Error in sending mail', err);
            return;
        }
        console.log('Message sent', info);
        return;
    });
}