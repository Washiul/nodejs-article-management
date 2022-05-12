const express = require('express');
// require('dotenv').config();
require('./db/mongoose.js');
const User = require('./models/user');
const userRouter = require('./routers/user');
const blogRouter = require('./routers/blog');
const hbs = require('hbs');
const path = require('path');
const flash = require('connect-flash');
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// var cookieParser = require('cookie-parser')

const publicDirectoryPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname, '../templates/views');
const partialPath = path.join(__dirname, '../templates/partials');

const app = express();
const port = process.env.PORT|3000;
console.log('yehhh');
app.set( 'view engine', 'hbs' );
app.set( 'views', viewPath );
hbs.registerPartials( partialPath ); 

hbs.registerHelper('isTrue', function (a) {
  return a?true:false;
});

hbs.registerHelper('isEqual', function (a,b) {
  return a == b;
});

hbs.registerHelper('toString', function (a) {
	if( a ){
		return a.toString('base64');
	}
  	return '';
});

app.use(express.static(publicDirectoryPath));
// app.use(cookieParser());
// for parsing application/json
app.use(bodyParser.json()); 
// app.use(express.json())
// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(session({
	secret: 'my first project',
	resave: true,
	saveUninitialized: true,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField: 'email'}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
	res.locals.user = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use( userRouter );
// app.use( blogRouter );
 
app.listen( port, () => console.log( 'Server running on port '+port ) );