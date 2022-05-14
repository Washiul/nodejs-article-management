const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const Blog = require('../models/blog');
const isAuthenticated = require('../middleware/auth');
const passport = require('passport');
const path = require('path');
const multer  = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname) );
  }
})

const upload = multer({ 
	storage: storage,
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

router.get('/register', (req, res)=>{
	res.render('signup');
});

router.post('/register', 
	check('name', 'Your name field is required').not().isEmpty(),
	check('email', 'Please enter correct email').isEmail().normalizeEmail(),
	check('password', 'The password must be 5+ chars long').isLength({ min: 5 }),
	async (req, res)=>{
		
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
	    return res.render('signup', { errors: errors.array(), user: req.body } );
	}

	const user = new User({name : req.body.name, email: req.body.email, phone : req.body.phone, gender : req.body.gender});
	User.register(user, req.body.password, function(err, user) {
        if (err) {
        	req.flash('error', 'Something went wrong!');
        	res.redirect('/register');
        }else{
          	req.flash('success', 'You have successfully created your account.');
        	res.redirect('/login');
        }
    });

}); 

router.get('/login', (req, res)=>{
	res.render('login');
});

router.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Invalid email or password.'
}),(req, res)=>{
    res.redirect('/dashboard');
});
   
router.get('/logout', isAuthenticated, async (req, res)=>{
	req.logOut();
	res.redirect('/login');
});

router.get('/dashboard', isAuthenticated, (req, res)=>{
	const user = req.user;
	res.render('dashboard', { user: user });
});

router.get('/dashboard/profile', isAuthenticated, (req, res)=>{
	const user = req.user;
	res.render('profile', { user: user });
});

router.post('/dashboard/profile', isAuthenticated, 
	upload.single('avater'),
	check('name', 'Your name field is required').not().isEmpty(), 
	async (req, res)=>{
	
	const user = req.user;
	const errors = validationResult(req);
    if (!errors.isEmpty()) {
	    return res.render('profile', { errors: errors.array() } );
	}

	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'phone','gender'];
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

	if( isValidOperation ){
		updates.forEach((update)=> req.user[update] = req.body[update]);
		if( req.file != undefined ){
			let thumbnail = '/uploads/' + req.file.filename;
			req.user.avater = thumbnail;
		}
		

		await req.user.save();

		req.flash('success', 'You have successfully updated your profile.');
	}
	res.redirect('profile');
});

router.get('/dashboard/blogs', isAuthenticated, async (req, res)=>{
	const user = req.user;
	await user.populate('blogs');
	const blogs = user.blogs;
	res.render('blog/blogs', { blogs });
});

router.get('/dashboard/blogs/add', isAuthenticated, async (req, res)=>{
	const user = req.user;
	res.render('blog/new-blog');
});

router.post('/dashboard/blogs/add', isAuthenticated, 
	upload.single('thumbnail'),
	check('title', 'Title field is required!').not().isEmpty(), 
	check('description', 'Description field is required!' ).not().isEmpty(), 
	async (req, res)=>{
	const user = req.user;
	const errors = validationResult(req);

	try{
		
		if (!errors.isEmpty()) {
	      	return res.render('blog/new-blog', { errors: errors.array(), user } );
	    }
	    
	    let thumbnail = '';
	    if( req.file != undefined  ){
			thumbnail = '/uploads/' + req.file.filename;
		}
		const blog = new Blog({
			...req.body,
			   thumbnail: thumbnail,
			   author: user._id
			});

		await blog.save();
		req.flash('success','Article has been successfully added.');
		res.redirect('/dashboard/blogs');

	}catch(e){
		req.flash('error','Something went wrong! Please try later!');
		res.redirect('/dashboard/blogs');
	}
	
});

router.get('/dashboard/blogs/:id', isAuthenticated, async (req, res)=>{
	const _id = req.params.id;
	const user = req.user;
	const blog = await Blog.findOne({ _id, author: user._id });
	blog.thumbnail = blog.thumbnail.toString('base64');
	res.render('blog/view-blog', { blog });
})

router.post('/dashboard/blogs/:id', isAuthenticated, upload.single('thumbnail'), async (req, res)=>{
	return console.log('blog id');
	const updates = Object.keys(req.body);
	const availableUpdates = ['title', 'description'];
	const isValidUpdate = updates.every((update)=> availableUpdates.includes(update));
	if( isValidUpdate ){

		const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id});
		updates.forEach((update)=> blog[update] = req.body[update]);
		if( req.file != undefined  ){
			let thumbnail = '/uploads/' + req.file.filename;
			blog.thumbnail = thumbnail;
		}
		await blog.save();
		req.flash('success','Article has been successfully updated.');
	}else{
		req.flash('error','Something went wrong! Please try later!');
	}
	res.redirect('/dashboard/blogs/'+req.params.id);

})

router.get('/dashboard/settings', isAuthenticated, async (req, res)=>{
	const user = req.user;
	res.render('settings');
});

module.exports = router;