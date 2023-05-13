import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { APIFeatures } from '../utils/apiFeatures.js';
//JS_Closures are functions that return functions which have access to the parent function's variables
const deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      const ModelName = Model.modelName.toLowerCase();
      return next(new AppError(`No ${ModelName} found with that ID`));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

const updateOne = Model =>
  catchAsync(async (req, res, next) => {
    if (Model.modelName === 'User') {
      if (req.body.password || req.body.passwordConfirm)
        return next(
          new AppError(
            'This route is not for password updates.Please use /updateMyPassword route ',
            400
          )
        );
    }
    const { id } = req.params;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      const Modelname = Model.modelName.toLowerCase();
      next(new AppError(`No ${Modelname} found with that ID`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        [Model.modelName.toLowerCase()]: doc
      }
    });
  });

const createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      message: 'success',
      data: {
        [Model.modelName.toLowerCase()]: doc
      }
    });
  });
const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      const ModelName = Model.modelName.toLowerCase();
      return next(new AppError(`No ${ModelName} found with that ID`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        [Model.modelName.toLowerCase()]: doc
      }
    });
  });

const getAll = Model =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        [Model.modelName.toLowerCase()]: doc
      }
    });
  });
const checkIfOwner = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    // console.log({ Review_user: review.user });
    // Review_user: { _id: new ObjectId("645642be4f33cb4502aaf301"), name: 'Armas' }
    // console.log({ req_user: req.user });
    // req_user: {
    //   _id: new ObjectId("645f31c09dff3dc336f50144"),
    //   name: 'admin',
    //   email: 'admin@gmail.com',
    //   role: 'admin',
    //   __v: 0
    // }
    if (!doc) {
      return next(new AppError('No review found with that ID', 404));
    }
    if (req.user.role !== 'admin' && doc.user.id !== req.user.id) {
      return next(
        new AppError(
          "You are not authorised to change/delete other user's review",
          401
        )
      );
    }
    next();
  });
export { deleteOne, updateOne, createOne, getOne, getAll,checkIfOwner };
