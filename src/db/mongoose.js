const mongoose = require('mongoose');
const uri = process.env.MONGODB_URL;
mongoose.connect( uri )
.then((data)=>console.log('Connected successfully'))
.catch((e)=>console.log(e));