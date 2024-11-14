const fs = require('fs');
const csv = require('csv-parser');

function modifyOnboardingFile(inputFile, outputFile) {
  const results = [];

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (row) => {
      // Modify Name_Installed_Product if it's not empty and both System_REF and Device_SN are present
      if (row['Name_Installed_Product'] && row['System_REF'] && row['Device_SN']) {
        row['Name_Installed_Product'] = `${row['System_REF']}:${row['Device_SN']}`;
      }
      results.push(row);
    })
    .on('end', () => {
      writeCSV(outputFile, results);
      console.log(`Finished processing ${inputFile}`);
    });
}

function writeCSV(outputFile, data) {
  const header = Object.keys(data[0]);
  const rows = data.map((row) => header.map((field) => row[field]).join(',')).join('\n');

  fs.writeFileSync(outputFile, header.join(',') + '\n' + rows);
}

// Usage
modifyOnboardingFile('Modified_ONBOARDING_NG.csv', 'Modified_ONBOARDING_NG.csv');


//name installed product name set for ONBOARDING