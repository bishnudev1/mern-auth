const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mernAuth',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
    console.log('Connected to Database');
}).catch((err) => {
    console.log(err);
});