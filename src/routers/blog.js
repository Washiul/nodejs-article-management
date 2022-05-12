const express = require('express');
const { check, validationResult } = require('express-validator');
const Blog = require('../models/blog');
const auth = require('../middleware/auth');
const multer  = require('multer');
const sharp = require('sharp');

const upload = multer({ 
	// storage: storage,
	limits:{
		fileSize: 2000000
	},
	fileFilter(req, file, cb){
		if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
			return cb(new Error('Please upload an image'));
		}
		
		cb(undefined, true);
	}
})

const router = new express.Router();

router.get('/', async (req, res)=>{

	const user = req.user;
	const blogs = await Blog.find({}).populate('author');
	res.render( 'home',{user, blogs} );
});

router.get('*', (req, res)=>{
	res.send( '404' );
});

module.exports = router;