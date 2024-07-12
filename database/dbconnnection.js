import mongoose from "mongoose";

const dbconnetion = ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        dbName: "Portfolio"
    }).then(()=>{
        console.log("Connected to database");
    }).catch(err=>{
        console.log(`some error occured while connecting to database: ${err}`)
    });
}

export default dbconnetion;