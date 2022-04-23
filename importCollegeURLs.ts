import mongoose from 'mongoose';
import fs from 'fs';
import { parseFile } from 'fast-csv';

import CollegeURL from './models/CollegeURL';
import credentials from './credentials.json';

mongoose
  .connect(`mongodb://${credentials.host}:${credentials.port}/${credentials.db}`, {
    user: credentials.username,
    pass: credentials.password
  })
  .then(() => {
    const rows: { url: String, isEdu: Boolean, name: String }[] = [];
    parseFile('./university-college-list.csv', { headers: true })
      .on('data', d => {
        const hostname = new URL(d.URL!).hostname;
        rows.push({
          url: hostname,
          isEdu: hostname.substring(hostname.length - 4) === '.edu',
          name: d['School Name']
        });
      })
      .on('end', () => {
        CollegeURL.insertMany(rows).then(() => {
          console.log('Inserted.');
          mongoose.connection.close();
        })
      })
  });