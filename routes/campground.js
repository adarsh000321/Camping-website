
var express=require('express'),
router=new express.Router(),
Campgrounds=require('../models/campgrounds'),
User=require('../models/user');
middleware=require('../middlewares'),// no need to add file name , by defalut it searches for'index.js'
NodeGeocoder=require('node-geocoder');
var options = {
	provider: 'here',
	httpAdapter:'https',
	apiKey: process.env.MAP_API, 
	formatter: null
};

var geocoder=NodeGeocoder(options);


//index route
router.get('/',function(req,res){
	var isEmpty='';
	if(req.query.search && req.query.search.length>0){
		var regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campgrounds.find({name:regex},function(err,campgrounds){
			if (err) {
				console.log('Something Went Wrong!');
				console.log(err);
			}else{
				if(campgrounds.length==0)isEmpty='No campgrounds found. Please try again!'
				res.render('campgrounds/campgrounds',{campgrounds:campgrounds,page:'campgrounds',isEmpty:isEmpty});
			}
		});
	}else{
		Campgrounds.find({},function(err,campgrounds){
			if (err) {
				console.log('Something Went Wrong!');
				console.log(err);
			}else{
				res.render('campgrounds/campgrounds',{campgrounds:campgrounds,page:'campgrounds',isEmpty:isEmpty});
			}
		});
	}
	
});

//create route
router.post('/',middleware.isLoggedIn,function(req,res){
	var name=req.body.name;
	var url=req.body.url;
	var desc=req.body.desc;
	var author={id:req.user._id,username:req.user.username};
	var price=req.body.price;
	
	geocoder.geocode(req.body.location,function(err,data){
		if(err || !data.length){
			req.flash('err','Invalid address');
			return res.redirect('back');
		}
		var obj={name:name,url:url,desc:desc,author:author,price:price,location:req.body.location};
		obj.lat=data[0].latitude;
		obj.lng=data[0].longitude;

		Campgrounds.create(obj,function(err,campground){
			if (err) {
				console.log('Something Went Wrong!');
				console.log(err);
			}else{
				req.flash('success','Campground added successfully!');
				res.redirect('/campgrounds');// default is get
			}
		});
	})
	// console.log(obj);
	
	// campgrounds.push(obj);
	
});

//new route
router.get('/new',middleware.isLoggedIn,function(req,res){
	res.render('campgrounds/new');
});

//show route
router.get('/:id',function(req,res){
	Campgrounds.findById(req.params.id).populate('comments').exec(function(err,campground){
		if(err){
			console.log('Something went wrong');
		}else{
			User.findById(campground.author.id,function(err,user){
				if(err){
					console.log('Something went wrong');
				}else{
					res.render('campgrounds/show',{campground:campground,campgroundUser:user.username});
				}
			});
		}
	});
});

//edit
router.get('/:id/edit',middleware.checkCampgroundAuthorization,function(req,res){
	Campgrounds.findById(req.params.id,function(err,campground){
		res.render('campgrounds/edit',{campground:campground});
	});
});

//update
router.put('/:id',middleware.checkCampgroundAuthorization,function(req,res){
	geocoder.geocode(req.body.location,function(err,data){
		if(err || !data.length){
			req.flash('err','Invalid address');
			return res.redirect('back');
		}
		req.body.campground.location=req.body.location;
		req.body.campground.lat=data[0].latitude;
		req.body.campground.lng=data[0].longitude;
		Campgrounds.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedGround){
			if(err){
				res.redirect('/campgrounds');
			}else{
				res.redirect('/campgrounds/'+req.params.id);
			}
		});
	});
});

//delete
router.delete('/:id',middleware.checkCampgroundAuthorization,function(req,res){
	Campgrounds.findByIdAndDelete(req.params.id,function(err){
		res.redirect('/campgrounds');
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports=router;