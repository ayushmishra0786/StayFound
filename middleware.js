const Listing = require("./models/listing");
const User = require("./models/user.js");
const {listingSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const {reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to experiences this feature!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);

    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "you are not the owner of this post");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//real owner
module.exports.isRealOwner = async(req, res, next) => {
    let {id} = req.params;
    let userInfo = await User.findById(id);

    if(!userInfo._id.equals(res.locals.currUser._id)){
        req.flash("error", "you are not the owner of this profile");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//for validate listing
module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    console.log(error);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

//for validate review
module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    console.log(error);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

module.exports.isReviewAuthor = async(req, res, next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);

    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "you are not the creater of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};