import mongoose from 'mongoose';

let xdbAccountSchema = new mongoose.Schema({
    pk:{
        type:String,
        required:true
    },
    sk:{
        type:String,
        required:true,
    },
    createdBy:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:false
    }
  });
const XdbAccount = mongoose.model("xdb_accounts",xdbAccountSchema);
export {XdbAccount};
