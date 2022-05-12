const mongoose = require('mongoose');
const uri = "";
mongoose.connect( uri )
.then((data)=>console.log('Connected successfully'))
.catch((e)=>console.log(e));