var express = require("express"),
	router = express.Router(),
	Campground = require("../models/campground"),
	Comment = require("../models/comment");

router.get("/", function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/campgrounds", {campgrounds: allCampgrounds});
		}
	})
})

router.get("/new", isLoggedIn, function(req, res){
	res.render("campgrounds/new");
})

router.post("/", isLoggedIn, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCapmground = {name: name, image: image, description: description, author: author};
	Campground.create(newCapmground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");	
		}
	})
})

router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	})
})

router.get("/:id/edit", checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(foundCampground){
			res.render("campgrounds/edit", {campground: foundCampground});
	})
})

router.put("/:id", checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(updatedCampground){
			res.redirect("/campgrounds/" + req.params.id);
	})
})

router.delete("/:id", checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndDelete(req.params.id, function(campgroundRemoved){
		Comment.deleteMany({_id: {$in: campgroundRemoved.comments}}, (err) => {
			if(err){
				console.log(err);
			}
			res.redirect("/campgrounds");
		})
	})
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err){
				res.redirect("back");
			}
			else{
				if(foundCampground.author.id.equals(req.user._id)){
					next();
				}
				else{
					res.redirect("back");
				}
			}
		})
	}
	else{
		res.redirect("back");
	}
}

module.exports = router;