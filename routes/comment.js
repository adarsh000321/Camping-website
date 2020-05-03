//comment routes

var express=require('express'),
router=new express.Router({mergeParams:true}),//with mergeParams:true, we can access :id from common prefix that is not present here
Campgrounds=require('../models/campgrounds'),
Comment=require('../models/comment'),
middleware=require('../middlewares');// no need to add file name , by defalut it searches for'index.js'

//new 
router.get('/new',middleware.isLoggedIn,function(req,res){
	Campgrounds.findById(req.params.id,function(err,campground){
		res.render('comments/new',{campground:campground});
	});
});

//create
router.post('/',middleware.isLoggedIn,function(req,res){
	Campgrounds.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}else{
			Comment.create(req.body.comment,function(err,comment){
				if(err)console.log(err);
				else {
					comment.author={id:req.user._id,username:req.user.username};
					comment.save();
					// console.log(comment);
					campground.comments.push(comment);
					campground.save();
					req.flash('success','Successfully added comment');
					res.redirect('/campgrounds/'+campground._id);
				}
			});
		}
	});
});

//edit
router.get('/:comment_id/edit',middleware.checkCommentAuthorization,function(req,res){
	Comment.findById(req.params.comment_id,function(err,comment){
		if(err){
			console.log(err);
			res.redirect('/campgrounds');
		}else{
			res.render('comments/edit',{comment:comment,campground_id:req.params.id});
		}
	});
});

//update
router.put('/:comment_id',middleware.checkCommentAuthorization,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,comment){
		if(err){
			console.log(err);
			res.redirect('back');
		}else{
			res.redirect('/campgrounds/'+req.params.id);
		}
	});
});

//delete
router.delete('/:comment_id',middleware.checkCommentAuthorization,function(req,res){
	Comment.findByIdAndDelete(req.params.comment_id,function(err){
		if(err)res.redirect('back');
		req.flash('success','Comment deleted');
		res.redirect('/campgrounds/'+req.params.id);
	});
});



module.exports=router;
