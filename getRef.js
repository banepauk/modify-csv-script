const fs = require('fs');
const csvParser = require('csv-parser');
const fastCsv = require('fast-csv');

// Input and Output file paths
const inputFilePath = 'Modified_ONBOARDING_NG.csv';
const outputFilePath = 'Modified_ONBOARDING_NG.csv';

const processCsv = async () => {
  const rows = [];

  // Read and process the CSV file
  fs.createReadStream(inputFilePath)
    .pipe(csvParser())
    .on('data', (row) => {
      // Process the Name_Installed_Product column
      let nameInstalledProduct = row['Name_Installed_Product'] || '';
      const deviceSN = row['Device_SN'] || '';
      const materialNumber = row['Material_Number'] || '';
      const systemRef = row['System_REF'] || '';

      // Check if Device_SN is missing in Name_Installed_Product
      if (!deviceSN && nameInstalledProduct.endsWith(':')) {
        // If Device_SN is missing, change Name_Installed_Product to System_REF with a colon at the end
        nameInstalledProduct = `${systemRef}:`;
      } else if (!deviceSN) {
        // If Device_SN is missing, and Name_Installed_Product doesn't already have a colon at the end, add it
        nameInstalledProduct = `${systemRef}:`;
      }

      // Update the row with the processed value
      row['Name_Installed_Product'] = nameInstalledProduct;

      // Add the updated row to the array
      rows.push(row);
    })
    .on('end', () => {
      // Write the processed rows to a new CSV file
      const writeStream = fs.createWriteStream(outputFilePath);
      const csvStream = fastCsv.format({ headers: true });

      csvStream.pipe(writeStream).on('finish', () => {
        console.log(`Processed CSV file has been saved to ${outputFilePath}`);
      });

      rows.forEach((row) => csvStream.write(row));
      csvStream.end();
    })
    .on('error', (error) => {
      console.error('Error while processing the CSV file:', error);
    });
};

// Execute the script
processCsv();
