import dotenv from "dotenv"
import app from "./src/app.js"
import connectDB from "./src/config/db.js"

dotenv.config()

const PORT = process.env.PORT || 3000

const startServer = async()=>{
    try{
        await connectDB();

        app.listen(3000,()=>{
            console.log("server is running on port 3000")
        })
    }catch(error){
        console.error("failed to start server : ",error.message);
        process.exit(1);
    }
}

startServer();