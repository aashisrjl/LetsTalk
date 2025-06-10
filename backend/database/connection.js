const ConnectionString = process.env.mongoURI;
const mongoose = require('mongoose');

async function connectToDatabase(){
    try{
    await mongoose.connect(ConnectionString,{
        dbName:"test",
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to database successfully");
    }
    catch(err){
        console.log("Error in connecting to database",err);
    }
}

module.exports = connectToDatabase;