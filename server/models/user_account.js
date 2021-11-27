import mongoose from 'mongoose';

let userAccountSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:false
    },
    password:{
        type:String,
        required:true,
        unique:false
    },
    email:{
        type:String,
        required:true
    }
  });
const User = mongoose.model("user_accounts",userAccountSchema);
export {User};
