const fs = require('fs');
const csvParser = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

// Function to generate a random US phone number in the format 1-XXX-555-XXXX
function generateRandomPhoneNumber() {
  const areaCode = Math.floor(Math.random() * 800) + 200; // Avoid area codes starting with 0 or 1
  const lineNumber = Math.floor(Math.random() * 10000); // 4-digit line number
  return `1-${areaCode}-555-${lineNumber.toString().padStart(4, '0')}`;
}

// Read and update the CSV file
function updatePhoneNumbers(filePath) {
  const records = [];
  const outputFilePath = 'Modified_USERS_NG.csv'; // Updated output file
  const phoneNumbers = Array.from({ length: 10 }, generateRandomPhoneNumber); // Pre-generate random phone numbers

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      // Only replace the phone number if it is empty (null or undefined)
      if (!row.Phone || row.Phone.trim() === '') {
        row.Phone = phoneNumbers.pop() || generateRandomPhoneNumber(); // Use a pre-generated number or create a new one
      }

      // Similarly for 'Mobile' field (if present)
      if (!row.Mobile || row.Mobile.trim() === '') {
        row.Mobile = phoneNumbers.pop() || generateRandomPhoneNumber(); // Use a pre-generated number or create a new one
      }

      records.push(row);
    })
    .on('end', () => {
      console.log(`CSV file successfully processed. Updating phone numbers...`);
      
      // Write updated data back to a new CSV
      const csvWriter = createObjectCsvWriter({
        path: outputFilePath,
        header: Object.keys(records[0]).map((key) => ({ id: key, title: key }))
      });

      csvWriter
        .writeRecords(records)
        .then(() => console.log(`Updated CSV saved as ${outputFilePath}`))
        .catch((err) => console.error(`Error writing CSV file: ${err.message}`));
    })
    .on('error', (err) => console.error(`Error reading CSV file: ${err.message}`));
}

// Run the script with your CSV file
updatePhoneNumbers('Modified_USERS_NG.csv');

