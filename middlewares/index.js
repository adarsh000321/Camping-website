var Campgrounds=require('../models/campgrounds'),
Comment = require('../models/comment');

function checkCommentAuthorization(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,comment){
			if(err){
				req.flash('err','Campground not found!');
				res.redirect('/campgrounds');
			}else {
				if(comment.author.id.equals(req.user._id) || req.user.isAdmin){ // use mongoose's .equals() to compare objects 
					next();
				}else {
					req.flash('err','Pesmission denied!');
					res.redirect('back');// we go one step back using 'back'
				}
			}
		});
	}else{
		req.flash('err','Pesmission denied!');
		res.redirect('/login'); 
	}
}

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash('err','Please Login First!');// this will show this error on the next redirected page 
	res.redirect('/login');
}

function checkCampgroundAuthorization(req,res,next){
	if(req.isAuthenticated()){
		Campgrounds.findById(req.params.id,function(err,campground){
			if(err){
				req.flash('err','Campground not found!');
				res.redirect('/campgrounds');
			}
			else {
				if(campground.author.id.equals(req.user._id) || req.user.isAdmin){ // use mongoose's .equals() to compare objects 
					next();
				}else {
					req.flash('err','Pesmission denied!');
					res.redirect('back');// we go one step back using 'back'
				}
			}
		});
	}else{
		req.flash('err','Pesmission denied!');
		res.redirect('/login'); 
	}
}


function profileChecker(req,res,next){
	if(req.isAuthenticated){
		if(req.user && req.user.username===req.params.username_id){
			return next();
		}else {
			req.flash('err','Permission denied!');
			res.redirect('/campgrounds');
		}
	}else{
		req.flash('err','Please login to edit the info!');
		res.redirect('/login');
	}
}

module.exports={
    checkCampgroundAuthorization:checkCampgroundAuthorization,
    isLoggedIn:isLoggedIn,
	checkCommentAuthorization:checkCommentAuthorization,
	profileChecker:profileChecker
};