const { query } = require("express");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    const { query: searchQuery } = req.query;

    let allListings;
    if (searchQuery) {
        // Search listings based on title, description, or category
        allListings = await Listing.find({
            $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
                { category: { $regex: searchQuery, $options: "i" } }
            ]
        }).populate("owner"); // Populate the owner field
    } else {
        // No search query, get all listings
        allListings = await Listing.find({}).populate("owner"); // Populate the owner field
    }

    // Render the listings page with filtered or all listings
    res.render("listings/index.ejs", { allListings, selectedCategory: req.query.category || null });
};



module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}   

module.exports.showListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing, mapToken: process.env.MAP_TOKEN });
};


module.exports.createListing = async (req, res) => {
    try {
        let response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
            })
            .send();

        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = response.body.features[0].geometry;

        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    } catch (e) {
        req.flash("error", "Failed to create listing");
        res.redirect("/listings/new");
    }
};


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}


module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("error", "Listing Deleted"); // Use "error" instead of "success" for red color
    res.redirect("/listings");
};