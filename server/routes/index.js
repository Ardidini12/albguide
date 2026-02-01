import { authRouter } from './authRoutes.js';
import { destinationRouter } from './destinationRoutes.js';
import { healthRouter } from './healthRoutes.js';
import { bookingRouter } from './bookingRoutes.js';
import { favoriteRouter } from './favoriteRoutes.js';
import { packageAvailabilityRouter } from './packageAvailabilityRoutes.js';
import { packageRouter } from './packageRoutes.js';
import { reviewRouter } from './reviewRoutes.js';
import { uploadRouter } from './uploadRoutes.js';
import { userRouter } from './userRoutes.js';

export function mountRoutes(app) {
  app.use(healthRouter);
  app.use(authRouter);
  app.use(destinationRouter);
  app.use(packageRouter);
  app.use(packageAvailabilityRouter);
  app.use(bookingRouter);
  app.use(favoriteRouter);
  app.use(reviewRouter);
  app.use(uploadRouter);
  app.use(userRouter);
}
