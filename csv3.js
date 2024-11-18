const fs = require('fs');
const csv = require('csv-parser');
const fastcsv = require('fast-csv'); // Use fastcsv for proper CSV formatting

function modifyUMSFile(inputFile, outputFile) {
  const results = [];

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (row) => {
      // Modify Name_Installed_Product if conditions are met
      if (row['Name_Installed_Product'] && row['Material_Number'] && row['Device_SN']) {
        row['Name_Installed_Product'] = `${row['Material_Number']}:${row['Device_SN']}`;
      }
      results.push(row);
    })
    .on('end', () => {
      // Write the modified results to a new CSV file
      writeCSV(outputFile, results);
      console.log(`Processing complete. Modified file saved as: ${outputFile}`);
    })
    .on('error', (error) => {
      console.error(`Error reading file: ${error.message}`);
    });
}

function writeCSV(outputFile, data) {
  const ws = fs.createWriteStream(outputFile);

  fastcsv
    .write(data, { headers: true, quoteColumns: true }) // Properly handles special characters
    .pipe(ws)
    .on('finish', () => {
      console.log('File successfully written.');
    })
    .on('error', (error) => {
      console.error(`Error writing file: ${error.message}`);
    });
}

// Run the function
const inputFile = 'Modified_UMS_NG.csv';
const outputFile = 'Modified_UMS_NG.csv'; // Safer to write to a new file
modifyUMSFile(inputFile, outputFile);
