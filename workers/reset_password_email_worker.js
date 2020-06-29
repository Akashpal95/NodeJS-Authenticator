
const queue = require('../config/kue');

const resetPasswordMailer = require('../mailers/reset_password_mailer');
//Process the job of sending mail in the queue
queue.process('emails', function(job, done){
    console.log('emails worker is processing a job', job.data);
    resetPasswordMailer.resetPassword(job.data.user, job.data.token);
    done();
});
