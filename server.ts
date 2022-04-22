import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';

import CollegeURL from './models/CollegeURL';
import credentials from './credentials.json';

mongoose
  .connect(`mongodb://${credentials.host}:${credentials.port}/${credentials.db}`, {
    user: credentials.username,
    pass: credentials.password
  })
  .then(() => {
    const app = express();

    app.disable('x-powered-by');
    app.use(helmet());
    app.use(cors({ origin: [/collegespamguard\.com$/, /localhost:[0-9]+$/] }));

    app.get('/college-urls', (req, res) => {
      CollegeURL
        .find()
        .select('-_id -__v')
        .lean()
        .exec((err, collegeURLs) => {
          if(err) {
            console.log('/college-urls - Internal server error');
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
          }

          return res.status(200).json(collegeURLs);
        });
    });

    app.listen(80);
    console.log('Listening on port 80')
  })