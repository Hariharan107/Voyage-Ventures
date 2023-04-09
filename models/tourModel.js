import mongoose from 'mongoose';
import slugify from 'slugify';
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
      minlength: [10, 'Tour name should have atleast 10 characters'],
      maxlength: [40, 'Tour name cant have more have 40 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have a price']
    },
    discount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
//VIRTUAL PROPERTY
tourSchema.virtual('durationWeeks').get(function() {
  let durationInweeks = this.duration / 7;
  return `${durationInweeks.toFixed(2)} weeks `;
});
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// QUERY MIDDLEWARE
//Pre
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
//POST
tourSchema.post(/^find/, function(docs, next) {
  // console.log(docs);
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});
//AGGREAGTE MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  // this.pipeline().unshift({ $match: { $secretTour: { $ne: true } } });
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

export { Tour };
