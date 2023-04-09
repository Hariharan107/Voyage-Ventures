import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();
import app from './app.js';

const DB = process.env.MONGODB_URL;
const connection = async () => {
  try {
    const DBConnection = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MONGO connection successful');
  } catch (err) {
    console.log(err);
  }
};

const port = process.env.PORT || 3000;
app.listen(port, () => {
  connection();
  console.log(`App running on port ${port}...`);
});

// const testTour = new Tour({
//   name: 'The Hari Rides',
//   price: 1999
// });
// const saveTour = async () => {
//   try {
//     const savedTour = await testTour.save();
//     console.log('Tour saved', savedTour);
//   } catch (err) {
//     console.log('Error 💣💣💣', err);
//   }
// };
