import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';

import CollegeURL from './models/CollegeURL';
import UnknownSchool from './models/UnknownSchool';
import WhitelistedEmail from './models/WhitelistedEmail';

import credentials from './credentials.json';
import adminPass from './adminPass.json';

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
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());


    // admin panel, add whitelisted email
    app.post('/whitelisted-emails', (req, res) => {
      if(req.headers.authorization !== undefined && req.headers.authorization !== `Basic ${adminPass.password}`) {
        console.log('/whitelisted-emails - Unauthorized');
        console.log('Headers:')
        console.log(JSON.stringify(req.headers, null, '\t'));
        return res.status(401).json({ message: 'Unauthorized' });
      }

      new WhitelistedEmail(req.body)
        .save((err: Error) => {
          if(err) {
            console.log('/whitelisted-emails - Internal server error')
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
          }

          if(req.body.domain !== undefined) {
            UnknownSchool
              .deleteOne({ url: req.body.domain })
              .exec(err => {
                if(err) {
                  console.log('/whitelisted-emails - Internal server error')
                  console.log(err);
                  return res.status(500).json({ message: 'Internal server error' });
                }

                return res.status(200).json({ message: 'Success' })
              });
          }
          else {
            return res.status(200).json({ message: 'Success' });
          }
        });
    });


    // admin panel, add college url
    app.post('/college-urls', (req, res) => {
      if(req.headers.authorization !== undefined && req.headers.authorization !== `Basic ${adminPass.password}`) {
        console.log('/college-urls - Unauthorized');
        console.log('Headers:')
        console.log(JSON.stringify(req.headers, null, '\t'));
        return res.status(401).json({ message: 'Unauthorized' });
      }

      new CollegeURL(req.body)
        .save((err: Error) => {
          if(err) {
            console.log('/college-urls- Internal server error')
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
          }

          if(req.body.url !== undefined) {
            UnknownSchool
              .deleteOne({ url: req.body.url })
              .exec(err => {
                if(err) {
                  console.log('/college-urls - Internal server error')
                  console.log(err);
                  return res.status(500).json({ message: 'Internal server error' });
                }

                return res.status(200).json({ message: 'Success' })
              });
          }
          else {
            return res.status(200).json({ message: 'Success' });
          }
        })
    });


    // admin panel, return unknown schools
    app.get('/admin', (req, res) => {
      if(req.headers.authorization !== undefined && req.headers.authorization !== `Basic ${adminPass.password}`) {
        console.log('/admin - Unauthorized');
        console.log('Headers:')
        console.log(JSON.stringify(req.headers, null, '\t'));
        return res.status(401).json({ message: 'Unauthorized' });
      }

      UnknownSchool
        .find()
        .select('-_id -__v')
        .lean()
        .exec((err, unknownSchools) => {
          if(err) {
            console.log('/admin - Internal server error');
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' })
          }

          return res.status(200).json(unknownSchools);
        })
    });


    // client-facing, report an unknown school
    app.post('/unknown-school', (req, res) => {
      UnknownSchool
        .findOne({ url: req.body.url })
        .exec((err, unknownSchool) => {
          if(err) {
            console.log('/unknown-school - Internal server error');
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
          }

          // new school, need to create a new unknownschool
          if(unknownSchool === null) {
            new UnknownSchool({ url: req.body.url, count: 1 })
              .save((err: Error) => {
                if(err) {
                  console.log('/whitelisted-emails - Internal server error')
                  console.log(err);
                  return res.status(500).json({ message: 'Internal server error' });
                }

                return res.status(200).json({ message: 'Success' });
              })
          }

          // increment count of existing document by 1
          else {
            UnknownSchool
              .findOneAndUpdate({ _id: unknownSchool._id }, { $inc: { 'count': 1 } })
              .exec(err => {
                if(err) {
                  console.log('/unknown-school - Internal server error');
                  console.log(err);
                  return res.status(500).json({ message: 'Internal server error' });
                }

                return res.status(200).json({ message: 'Success' })
              })
          }
        });
    })


    // client-facing, returns all whitelisted emails
    app.get('/whitelisted-emails', (req, res) => {
      WhitelistedEmail
        .find()
        .select('-_id -__v')
        .lean()
        .exec((err, whitelistedEmails) => {
          if(err) {
            console.log('/whitelisted-emails - Internal server error');
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' })
          }

          return res.status(200).json(whitelistedEmails);
        })
    })


    // client-facing, returns all college URLs
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


    app.listen(8002);
    console.log('Listening on port 8002')
  })