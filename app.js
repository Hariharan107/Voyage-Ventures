import express from 'express';
import morgan from 'morgan';
import AppError from './utils/appError.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import viewRouter from './routes/viewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import globalErrorHandler from './controllers/errorController.js';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import xss from 'xss-clean';
import helmet from 'helmet';
import compression from 'compression';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// PUG ENGINE SETUP
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);
// 1)GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers

//Use helmet to protect HTTP Header
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
//cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// {"$gt":""}

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
app.use(compression());
// 3) ROUTES
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(req.cookies);
//   next();
// });
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
export default app;
