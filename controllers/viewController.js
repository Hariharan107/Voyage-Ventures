import { Tour } from '../models/tourModel.js';
import { catchAsync } from '../utils/catchAsync.js';
const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});
const getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  });
};
export { getOverview, getTour };
