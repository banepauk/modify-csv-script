const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Input and output file paths
const inputFile = 'NG User Data - UMS.csv';
const outputFile = 'Modified_UMS_NG.csv';

// Columns to clean
const columnsToClean = ['Modality_REF', 'Child_Material_Description'];

// Function to clean a string by removing semicolons and commas
const cleanString = (str) => {
    if (typeof str !== 'string') return str; // Ensure only strings are processed
    return str.replace(/[;,]/g, '');
};

// Read and process the CSV file
const processCsv = () => {
    const rows = [];

    fs.createReadStream(inputFile)
        .pipe(csv())
        .on('data', (row) => {
            // Clean specified columns
            columnsToClean.forEach((column) => {
                if (row[column]) {
                    row[column] = cleanString(row[column]);
                }
            });
            rows.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed.');

            // Write the cleaned data to a new CSV file
            const csvWriter = createCsvWriter({
                path: outputFile,
                header: Object.keys(rows[0]).map((key) => ({ id: key, title: key })),
            });

            csvWriter
                .writeRecords(rows)
                .then(() => console.log(`Cleaned data saved to ${outputFile}`))
                .catch((err) => console.error('Error writing cleaned data:', err));
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
        });
};

// Run the script
processCsv();
