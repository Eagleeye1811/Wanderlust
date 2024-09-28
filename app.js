const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const Review = require("./models/review.js");
    


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get("/",(req,res)=>{
    console.log("Website is working");
})


//Index route
app.get("/listings",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings})
})

//New route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//Show route
app.get("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing})
})

//Create route
app.post("/listings",async(req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})

//Edit route
app.get("/listings/:id/edit",async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
})

//Update route
app.put("/listings/:id",async (req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect(`/listings/${id}`)
})

//Delete route
app.delete("/listings/:id", async (req,res)=>{
    let {id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
})

//Review
//POST Route
app.post("/listings/:id/reviews",async (req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await newReview.save();

    console.log("new review saved");
    res.send("new review saved");
});

// app.get("/testlisting",async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India",
//     })

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");

// })


app.listen(8080,()=>{
    console.log("server is listening to port 8080");
})

