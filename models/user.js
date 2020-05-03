var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');
var userSchema=new mongoose.Schema({
    username:{type:String,unique:true,required:true},
    password:String,
    lastname:String,
    firstname:String,
    avatar:String,
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    email:{type:String,unique:true,required:true},
    isAdmin:{
        type:Boolean,
        default:false
    }
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',userSchema);