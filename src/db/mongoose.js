const mongoose = require('mongoose');
const uri = "mongodb+srv://root:kanduri786@cluster0.6pb3d.mongodb.net/user-management?retryWrites=true&w=majority";
mongoose.connect( uri )
.then((data)=>console.log('Connected successfully'))
.catch((e)=>console.log(e));