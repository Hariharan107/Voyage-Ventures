import { Tour } from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import sharp from 'sharp';
import multer from 'multer';
import { catchAsync } from '../utils/catchAsync.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne
} from './handleFactory.js';
const aliasTopTours = (req, res, next) => {
  (req.query.limit = '5'),
    (req.query.sort = '-price,ratingsAverage'),
    (req.query.fields = 'name,price,ratingsAverage,summary,difficulty'),
    next();
};

//AGGREGATION

//GeoSpatial Queries
const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: {
          $concat: [
            { $substr: [{ $round: ['$distance', 2] }, 0, -1] },
            { $cond: [{ $eq: [unit, 'mi'] }, ' miles', ' km'] }
          ]
        },
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: distances
  });
});

const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours
  });
});

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        noOfTours: { $sum: 1 },
        ratingsQuantity: { $sum: '$ratingsQuantity' },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match:{_id:{$ne:"EASY"}}
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

//BUSIEST MONTHS
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
//Image uploads
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  //Check if file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!Please upload only images', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 13 }
]);
const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  console.log(req.files);
  //1) Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  const resizedCoverImage = await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 });
  await resizedCoverImage.toFile(`public/img/tours/${req.body.imageCover}`);
  next();
});
// upload.single('image')
// upload.array('imageCover')
//GET SPECIFIC TOUR
const getAllTours = getAll(Tour);
const getTour = getOne(Tour, { path: 'reviews' });
const createTour = createOne(Tour);
const updateTour = updateOne(Tour);
const deleteTour = deleteOne(Tour);
export {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  getToursWithin,
  deleteTour,
  aliasTopTours,
  getMonthlyPlan,
  getTourStats,
  resizeTourImages,
  uploadTourImages,
  getDistances
};
