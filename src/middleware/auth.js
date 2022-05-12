// const jwt = require('jsonwebtoken');
const User = require('../models/user');

const isAuthenticated = async (req, res, next ) =>{

	if( req.isAuthenticated()){
		return next();
	}

	req.flash('error', 'Session has expired! Please login to access.');
	res.redirect('/login');
}

module.exports = isAuthenticated;