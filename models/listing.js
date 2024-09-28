const mongoose=require("mongoose");
let Schema=mongoose.Schema;

const listingSchema= new Schema({
    title: {
        type:String,
        required:true
    },
    description: String,
    image: {
        type: String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review" //so here we have added review schema in listing schema
    }]
})

const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;