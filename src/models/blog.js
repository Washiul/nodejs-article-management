const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
		title:{
			type: String,
			require: true,
			trim: true
		},
		description:{
			type: String,
			required: true,
			trim: true
		},
		thumbnail:{
			type: String,
		},
		author:{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		}
}, { timestamps: true });

blogSchema.toJSON = function(){
	const blog = this;
	console.log(blog);
}

const blog = mongoose.model( 'Blog', blogSchema );

module.exports = blog; 