const Listing = require("../models/listing.js");
const User = require("../models/user.js");

module.exports.profile = async (req, res) => {
    let {id} = req.params;
    let allListings = await Listing.find({});
    let ownerInfo = await User.findById(id);

    if(ownerInfo.image.url == undefined || ownerInfo.image.url == "" || ownerInfo.image.url == null){
        ownerInfo.image.url = "https://www.sid.cam.ac.uk/themes/custom/sidney/assets/img/default-profile-gray.png";
    }
    res.render("listings/profile.ejs", {ownerInfo, allListings});
};

module.exports.editProfile = async(req, res) => {
   let {id} = req.params;
   let ownerInfo = await User.findById(id);
   if(ownerInfo.image.url == undefined || ownerInfo.image.url == ""){
        ownerInfo.image.url = "https://www.sid.cam.ac.uk/themes/custom/sidney/assets/img/default-profile-gray.png";
    }
   let image = ownerInfo.image;
   res.render("listings/editProfile.ejs", {ownerInfo, image});
};

module.exports.updateProfilePhoto = async (req, res) => {
    let {id} = req.params;
    let ownerInfo = await User.findByIdAndUpdate(id, {...req.body.User});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        ownerInfo.image = {url, filename};
        await ownerInfo.save();
    }
    req.flash("success", "Profile Photo Updated");
    res.redirect(`/listings/owner/${id}/profile`);
};