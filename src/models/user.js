const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

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

userSchema.methods.generateAuthToken = async function(){
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, 'thisisarticlemanagement');
	user.tokens = user.tokens.concat({token});
	await user.save();
	return token;
}

const User = mongoose.model( 'User', userSchema );

module.exports = User;