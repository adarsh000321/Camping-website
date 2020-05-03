
var express=require('express'),
router=new express.Router(),
passport=require('passport'),
User = require('../models/user'),
Campgrounds = require('../models/campgrounds'),
nodemailer=require('nodemailer'),
async=require('async'),
crypto=require('crypto');


router.get('/',function(req,res){
	res.render('home');
});

//auth routes

router.get('/register',function(req,res){
	res.render('register',{page:'register'});
});

router.post('/register',function(req,res){
	User.findOne({email:req.body.email},function(err,user){
		if(!user){
			var newUser=new User({
				username:req.body.username,
				lastname:req.body.lastname,
				email:req.body.email,
				avatar:req.body.avatar,
				firstname:req.body.firstname
			});
			
			if(req.body.adminCode==='anyadmincode')newUser.isAdmin=true;//secrete admin code
			User.register(newUser,req.body.password,function(err,user){
				if(err){
					req.flash('err',err.message);
					return res.redirect('/register');
				}
				passport.authenticate('local')(req,res,function(){
					req.flash('success','Welcome to YelpCamp '+user.username);
					res.redirect('/campgrounds');
				});
			});
		}else{
			req.flash('err','Email entered is already registered!');
			res.redirect('back');
		}
	});
	
});

router.get('/login',function(req,res){
	res.render('login',{page:'login'});
});

//middleware
router.post('/login',passport.authenticate('local',{successRedirect:'/campgrounds',failureRedirect:'/login'}));

router.get('/logout',function(req,res){
	req.logOut();
	req.flash('success','Logged you out!')
	res.redirect('/campgrounds');
});

//forgot password
router.get('/forgot',function(req,res){
	res.render('forgot');
});

router.post('/forgot',function(req,res,next){
	async.waterfall([ // array of functions
		function(done){
			crypto.randomBytes(20,function(err,buf){
				var token=buf.toString('hex');
				done(err,token);
			});
		},
		function(token,done){
			User.findOne({email:req.body.email},function(err,user){
				if(!user){
					req.flash('err','No account with that email address exist.');
					return res.redirect('/forgot');
				}

				user.resetPasswordToken=token;
				user.resetPasswordExpires=Date.now()+3600000 // expires in 1 hr
				user.save(function(err){
					done(err,token,user);
				});
			});
		},
		function(token,user,done){
			var smtpTransport=nodemailer.createTransport({
				service:'Gmail',
				auth:{
					user:'developmentmail000321@gmail.com',
					pass: process.env.GMAILPWD
				}
			});
			var mailOptions = {
				to:user.email,
				form:'developmentmail000321@gmail.com',
				subject:'YelpCamp Password Reset',
				text:'You are recieving this mail because you (or someone else) have requested the reset of the passowrd.'+
				'Please click on the following link or paste it into the browser to complete the process'+
				' http://'+req.headers.host+'/reset/'+token+'\n\n'+
				'If you did not request this, please ignore this email and your password will remain unchanged.'
			};
			smtpTransport.sendMail(mailOptions,function(err){
				if(err){
					console.log(process.env.GMAILPWD);
					console.log(err);
					return res.redirect('/forgot');
				}
				console.log('mail sent');
				req.flash('success','An e-mail has been sent to '+user.email+' with further instructions.');
				done(err,'done');
			});
		}
	],function(err){
		if(err)return next(err);
		res.redirect('/forgot');
	});
});

// new password form
router.get('/reset/:token',function(req,res){
	User.findOne({resetPasswordToken:req.params.token,resetPasswordExpires:{$gt: Date.now()}},function(err,user){
		if(!user){
			req.flash('err','Password reset token is invalid or has expired.');
			return res.redirect('/forgot');
		}
		res.render('reset',{token:req.params.token});
	});
});

// post route new password
router.post('/reset/:token',function(req,res){
	async.waterfall([
		function(done){
			User.findOne({resetPasswordToken:req.params.token,resetPasswordExpires:{$gt:Date.now()}},function(err,user){
				if(!user){
					req.flash('err','Password reset token is invalid or has expired.');
					res.redirect('back');
				}
				if(req.body.password===req.body.confirm){
					user.setPassword(req.body.password,function(err){
						user.resetPasswordExpires=undefined;
						user.resetPasswordToken=undefined;
						user.save(function(err){
							req.logIn(user,function(err){
								done(err,user);
							});
						});
					});
				}else{
					req.flash('err','Password do not match.');
					return res.redirect('back');
				}
			});
		},
		function(user,done){
			var smtpTransport=nodemailer.createTransport({
				service:'Gmail',
				auth:{
					user:'developmentmail000321@gmail.com',
					pass: process.env.GMAILPWD
				}
			});
			var mailOptions = {
				to:user.email,
				form:'developmentmail000321@gmail.com',
				subject:'Your password has been changed',
				text:'Hello,\n\n'+
				'This is a confirmation that password for your account '+user.email+' has just changed.'
			};
			smtpTransport.sendMail(mailOptions,function(err){
				console.log('mail sent');
				req.flash('success','Your password has been changed successfully!');
				done(err);
			});
		}
	],function(err){
		res.redirect('/campgrounds');
	});
});







module.exports=router;