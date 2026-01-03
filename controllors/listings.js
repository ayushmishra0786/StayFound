const Listing = require("../models/listing.js");
const User = require("../models/user.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    let owner = listing.owner;
    if(!listing) {
        req.flash("error", "Such post you requested for does not exist!");
        res.redirect("/listings");
    } else {
        res.render("listings/show.ejs", {listing, owner});
    }
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    let newListing = new Listing (req.body.Listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Post Created");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    
    if(!listing){
        req.flash("error", "Such post doesnot exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.Listing});
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Post Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Post Deleted");
    res.redirect("/listings");
};

module.exports.searchInfo = async (req, res) => {
    let { q } = req.query;
    if (!q) {
        return res.redirect("/listings");
    } 

    // console.log(q);

    let user = await User.findOne({
        $or: [
            { name: { $regex: q, $options: "i" } },
            { username: { $regex: q, $options: "i" } }
        ]
    });

    // console.log(user);

    if (user) {
        return res.redirect(`/listings/owner/${user._id}/profile`);
    }
    let matchedListings = await Listing.find({
        $or: [
            { location: { $regex: q, $options: "i" } }, // "i" makes it case-insensitive
            { country: { $regex: q, $options: "i" } }
        ]
    });

    // console.log(matchedListings);

    if (matchedListings.length > 0) {
        if (matchedListings[0].country.toLowerCase() === q.toLowerCase()) {
            return res.render('listings/search/country.ejs', { q, matchedListings });
        } else {
            return res.render('listings/search/location.ejs', { q, matchedListings });
        }
    }
    return res.redirect("/listings");
};