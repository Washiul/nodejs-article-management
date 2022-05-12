const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt');
// var jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
		name:{
			type: String,
			required: true,
			trim: true
		},
		email:{
			type: String,
			required: true,
			trim: true,
			unique: true
		},
		phone:{
			type: String,
			trim: true
		},
		gender:{
			type: String,
			trim: true
		},
		// password:{
		// 	type: String,
		// 	required: true,
		// 	trim: true
		// },
		avater:{
			type: String,
		},
		tokens:[{
			token:{
				type: String,
				required: true
			}
		}]
});

// plugin for passport-local-mongoose
userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

userSchema.virtual('blogs', {
    ref: 'Blog',
    localField: '_id',
    foreignField: 'author'
});

userSchema.statics.findUserByCred = async function( email, password ){
	const user = await this.findOne({email});
	const isMatch = await bcrypt.compare( password, user.password );
	console.log(isMatch);
	if( !isMatch ){
		throw new Error('Unable to login');
	}
	return user;
}

userSchema.methods.generateAuthToken = async function(){
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, 'thisisarticlemanagement');
	user.tokens = user.tokens.concat({token});
	await user.save();
	return token;
}

userSchema.pre('save', async function(next){
	const user = this;
	if( user.isModified('password') ){
		user.password = await bcrypt.hash( user.password, 10 );
	}

	next();
});

const User = mongoose.model( 'User', userSchema );

module.exports = User;