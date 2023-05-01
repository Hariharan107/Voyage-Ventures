import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      min: [5, 'The review should have more than 5 characters']
    },
    rating: {
      type: Number,
      min: [1, 'Rating should be minimum 1'],
      max: [5, "Rating can't be above 5"]
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'review must belong to a tour']
      }
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'review must belong to a user']
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
const Review = mongoose.model('Review', reviewSchema);
export { Review };
