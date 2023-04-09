import { Tour } from '../models/tourModel.js';
import { APIFeatures } from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
const aliasTopTours = (req, res, next) => {
  (req.query.limit = '5'),
    (req.query.sort = '-price,ratingsAverage'),
    (req.query.fields = 'name,price,ratingsAverage,summary,difficulty'),
    next();
};

const getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort() 
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

//AGGREGATION
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

//CREATE TOUR
const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    message: 'success',
    data: {
      tour: newTour
    }
  });
});

//GET SPECIFIC TOUR
const getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});
//UPDATE TOUR
const updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
``
  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  })
  if(!tour){
    next(new AppError('No tour found with that ID',404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
   await Tour.findByIdAndDelete(id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});
export {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getMonthlyPlan,
  getTourStats
};
