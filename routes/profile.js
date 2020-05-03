var express=require('express'),
router=new express.Router({mergeParams:true}),
User = require('../models/user'),
Campgrounds = require('../models/campgrounds'),
middleware=require('../middlewares/index');

//profile show
router.get('/',function(req,res){
	User.find({username:req.params.username_id},function(err,user){
		if(err || !user.length){
			req.flash('err','User not found!');
			res.redirect('/campgrounds');
		}else {
			Campgrounds.find({'author.id':user[0]._id},function(err,campgrounds){
				if(err){
					console.log('something went wrong');
					res.redirect('/campgrounds');
				}else{
					res.render('user/show',{usere:user[0],currentUser:req.user,campgrounds:campgrounds});
				}
			});
		}
	});
	
});

// profile edit

router.get('/edit',middleware.profileChecker,function(req,res){
	User.find({username:req.params.username_id},function(err,user){
		res.render("user/edit",{usere:user[0]});
	});
});

//profile update

router.put('/',middleware.profileChecker,function(req,res){
	User.findOne({email:req.body.user.email},function(err,user){
		if(!user || user.username===req.params.username_id){
			User.findOneAndUpdate({username:req.params.username_id},req.body.user,function(err,user){
				if(err){
					req.flash('err',err.message);
					res.redirect('/user/'+req.params.username_id);			
				}else{
					req.flash('success','Profile updated successfully!');
					res.redirect('/user/'+req.params.username_id);
				}
			});
		}else{
			req.flash('err','Email entered is already registered!');
			res.redirect('back');
		}
	});
	
});

module.exports=router;