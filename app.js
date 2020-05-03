
var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var mongoose=require('mongoose');
var Comment = require('./models/comment');
var Campgrounds = require('./models/campgrounds');
// var seedDB=require('./seed');
var passport=require('passport');
var LocalStrategy=require('passport-local');
var passportLocalMongoose=require('passport-local-mongoose');
var session=require('express-session');
var User=require('./models/user');
var methodOverride=require('method-override');
var flash=require('connect-flash');
require('dotenv').config();
var PORT=process.env.PORT || 8080;

//Now moment is available for use in all of your view files via the variable named moment. 
//app.locals store local vars within the application
app.locals.moment=require('moment');// used to show created time
//mongodb+srv://admin:<password>@cluster0-7tqsg.mongodb.net/test?retryWrites=true&w=majority
mongoose.connect(process.env.DB_URL,{ useNewUrlParser: true,useUnifiedTopology:true,useFindAndModify:false});
// seedDB(); // sample data

var commentRoute=require('./routes/comment');
var campgroundRoute=require('./routes/campground');
var indexRoute=require('./routes/index');
var profileRoute=require('./routes/profile');
require('dotenv').config();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+'/public')); //'__dirname' stores current dir name
app.set('view engine','ejs');

app.use(session({
	secret:'any secrete key. do not share',
	resave:false,
	saveUninitialized:false
}));
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	// if no user is logged in then req.user will be undifined
	res.locals.user=req.user; // res.locals is available to every route
	res.locals.success=req.flash('success');
	res.locals.err=req.flash('err');
	next();
});

app.use('/campgrounds/:id/comments',commentRoute); // string here is common prefix in every route
app.use('/campgrounds',campgroundRoute);
app.use('/',indexRoute);
app.use('/user/:username_id',profileRoute);

app.listen(PORT,function(){
	console.log("Server has started!");
});















// var campgrounds=[{name:"Sunny Smiles",img:"https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Adirondack",img:"https://images.pexels.com/photos/45241/tent-camp-night-star-45241.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Barnabas",img:"https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Academy by the Sea",img:"https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Beaver Falls",img:"https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Best Bunks",img:"https://images.pexels.com/photos/2582818/pexels-photo-2582818.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Sunny Smiles",img:"https://images.pexels.com/photos/1309584/pexels-photo-1309584.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Adirondack",img:"https://images.pexels.com/photos/587976/pexels-photo-587976.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Barnabas",img:"https://images.pexels.com/photos/176381/pexels-photo-176381.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Academy by the Sea",img:"https://images.pexels.com/photos/1840394/pexels-photo-1840394.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Beaver Falls",img:"https://images.pexels.com/photos/2603681/pexels-photo-2603681.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
// 					 {name:"Best Bunks",img:"https://images.pexels.com/photos/2376989/pexels-photo-2376989.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"}];
// https://images.pexels.com/photos/1371798/pexels-photo-1371798.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940
// https://images.pexels.com/photos/2412023/pexels-photo-2412023.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260