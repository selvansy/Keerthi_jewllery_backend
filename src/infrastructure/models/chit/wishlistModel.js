import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    id_customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer'
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Product"
    },
    id_branch: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Branch"
    },
    // wishlistType: {
    //     type: String,
    //     enum: ['product', 'offer', 'newarrival'],
    //     required: true
    // },
    // price: {
    //     type: Number,
    //     default: null
    // },
    createDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model("Wishlist", wishlistSchema);