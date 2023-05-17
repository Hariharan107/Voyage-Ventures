import mongoose from 'mongoose';
import { Tour } from './tourModel.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      min: [5, 'The review should have more than 5 characters']
    },
    rating: {
      type: Number,
      min: [1, 'Rating should be minimum 1'],
      max: [5, "Rating can't be above 5"],
      set: val => Math.round(val * 10) / 10 //4.66666 = 4.7
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour', //this is the name of the model
      required: [true, 'review must belong to a tour']
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', //this is the name of the model
      required: [true, 'review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre('save', async function(next) {
  const existingReview = await this.constructor.findOne({
    tour: this.tour,
    user: this.user
  });
  if (existingReview) {
    // If a review already exists for the same tour and user combination, prevent saving the new review
    const error = new Error('Sorry, you have already reviewed this tour');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // })
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageStatistics = async function(tourId) {
  // console.log({ tourId }); { tourId: new ObjectId("6464ad7f8c8fa8f4d7d87c0d") }
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' }
      }
    }
  ]);

  // console.log({ status: stats[0] });
  // {
  //   _id: new ObjectId("6464ad7f8c8fa8f4d7d87c0d"),
  //   nRatings: 10,
  //   avgRatings: 4.2
  // }
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRatings
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    });
  }
};
reviewSchema.post('save', function() {
  this.constructor.calcAverageStatistics(this.tour); //'this.constructor is used to access the constructor function of the model, which is Review in this case. It allows you to access the static methods defined on the model itself.
});
reviewSchema.post(/^findOneAnd/, async function(doc, next) {
  await doc.constructor.calcAverageStatistics(doc.tour);
  // doc.constructor refers to the constructor function of the document, which is the model itself. This allows you to access the static methods defined on the model.
});
const Review = mongoose.model('Review', reviewSchema);
export { Review };
