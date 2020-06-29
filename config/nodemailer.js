const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');


let transporter = nodemailer.createTransport({
    service : 'gmail',
    host:'smtp.gmail.com',
    post: 587,
    secure:false,
    auth: {
        user: 'sender.email@gmail.com',
        pass: 'password'
    }
});

let renderTemplate = (data, relativePath) => {
    let mailHTML;
    //renderFile finction in ejs takes a view file and data and renders an html out of it. 
    ejs.renderFile(
        path.join(__dirname, '../views/mailers', relativePath),
        data,
        function(err, template){
            if(err){console.log('Error in redering template : '); return;}

            mailHTML = template;
        }
    )
    return mailHTML;
}

module.exports = {
    transporter: transporter,
    renderTemplate: renderTemplate
}