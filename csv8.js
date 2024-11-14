const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

// Define file paths
const inputFilePath = path.join(__dirname, 'Modified_USERS_NG.csv');
const outputFilePath = path.join(__dirname, 'Modified_USERS_NG.csv');

// Mapping of state abbreviations to full names
const stateFullNames = {
  "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", 
  "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia", 
  "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", 
  "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", 
  "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", 
  "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", 
  "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", 
  "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", 
  "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", 
  "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
};

// Process CSV
const processCSV = () => {
  const rows = [];

  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Check and replace BillingState abbreviation with full state name
      if (row.BillingState && stateFullNames[row.BillingState]) {
        row.BillingState = stateFullNames[row.BillingState];
      }

      rows.push(row);
    })
    .on('end', () => {
      // Write modified data back to CSV
      const csvWriter = createObjectCsvWriter({
        path: outputFilePath,
        header: Object.keys(rows[0]).map(column => ({ id: column, title: column }))
      });

      csvWriter.writeRecords(rows)
        .then(() => {
          console.log('CSV file successfully processed and saved with full state names.');
        })
        .catch(err => console.error('Error writing CSV file:', err));
    });
};

processCSV();



// corection to state