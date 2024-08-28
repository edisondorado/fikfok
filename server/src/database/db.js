const mongoose = require("mongoose");

const connectDb = async (DB_URI) => {
    try{
        await mongoose.connect(DB_URI)
        console.log("Connected to MongoDB successfully");
    } catch(e){
        console.error(`Error connecting to MongoDB: ${e}`);
        process.exit(1);
    }
}

module.exports = connectDb;