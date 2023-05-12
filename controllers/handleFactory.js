import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

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
export { deleteOne, updateOne, createOne };
