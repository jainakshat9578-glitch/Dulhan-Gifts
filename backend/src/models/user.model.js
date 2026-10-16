import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
     email: {type:String, required: true, unique: true},
     contact: {type:String, required: false, unique: true},
     password: {
          type:String, 
          required: function(){
             return !this.googleId
          }
     },
     fullName: {type:String, required: true},
     role: {type:String, enum:["buyer","seller"], default: "buyer"},
     googleId: {type: String,}
})

// pre-middleware-> DB me kuch bhi data save krne se pehle ye chalega!
userSchema.pre("save",async function(){
     // password modify nhi hua toh return hojao
     if(!this.isModified("password")) return

     const hash = await bcrypt.hash(this.password, 10);
     // 10 salt rounds makes this secure yet fast
     this.password = hash
})

userSchema.methods.comparePassword = async function(password){
     return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("User", userSchema)

export default userModel