import mongoose from "mongoose";

const citySchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    }, 
    location : {
        type: {
            type: String,   // 'Point'
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },
}, {
    timestamps: true,
});

// creating a 2dsphere index for geospatial queries
citySchema.index({ location: '2dsphere'});

const city = mongoose.model("City", citySchema);
export default city;