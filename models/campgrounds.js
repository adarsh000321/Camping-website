var mongoose=require('mongoose');

var schema=new mongoose.Schema({
	name:String,
	url:String,
    desc:String,
    price:String,
    lat:Number,
    lng:Number,
    location:String,
    createdAt:{
        type:Date,
        default:Date.now
    },
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        username:String
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }]
});

module.exports = mongoose.model('Campgrounds',schema);