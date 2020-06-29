const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000; //port 80 for production level code
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { stringify } = require('querystring');

//Although these are not directly being used here, it needs to loaded here to work
const passportLocal = require('./config/passport-local-strategy');
const passportJWT = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

const db = require('./config/mongoose');
const MongoStore = require('connect-mongo')(session);
const sassMiddleware = require('node-sass-middleware');
const flash = require('connect-flash');
const customMiddleware = require('./config/middleware');


app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());


app.use(express.static('./assets'));
//make the uploads folder available to browser
app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(expressLayouts);//Put this line always before routes


//Extract Style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true)

//Setting up view engine
app.set('view engine', 'ejs');
app.set('views', './views');

//The order of these middlewares are very important
//mongo store is used to store the session in the db rather in the local
app.use(session({
    name:'codeial', 
    //TODO change the secret before deployment
    secret:'blahsomething',
    saveUninitialized: false, //When there is a session is not initialised i.e. user didn't login don't send extra data in cookie
    resave:false, //Identity is already established session data is present don't re-write the same thing
    cookie: {
        maxAge : (1000*60 *100)
    },
    store: new MongoStore({
        mongooseConnection : db,
        autoRemove: 'disabled'
    }, function(err){
        console.log(err || 'connect-mongodb setup ok');
    })
}));

app.use(passport.initialize());
app.use(passport.session());

//Sets the user from the session cookie to locals
app.use(passport.setAuthenticatedUser);

//For flash messages
app.use(flash());
app.use(customMiddleware.setFlash);

//use express router
app.use('/', require('./routes'))

app.listen(port, function(err){
    if(err){
        console.log(`Error in running the server : ${err}`);
    }
    console.log(`Server is running on port : ${port}`);
});
