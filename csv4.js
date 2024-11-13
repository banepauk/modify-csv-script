const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const UMS_FILE = 'Modified_UMS_NG.csv';
const ONBOARDING_FILE = 'Modified_ONBOARDING_NG.csv';

// Function to read a CSV file and return its rows as an array of objects
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}

// Function to update the Opportunity_IDs in both UMS and ONBOARDING files
async function updateOpportunityIDs() {
  try {
    // Read the UMS and ONBOARDING CSV files
    const umsRows = await readCSV(UMS_FILE);
    const onboardingRows = await readCSV(ONBOARDING_FILE);

    let increment = 0; // To track the increment for Opportunity_IDs
    const opportunityIDMapping = new Map(); // Track the new Opportunity_IDs by original ID

    // Normalize Opportunity_IDs by trimming whitespace and converting to string
    const normalizeID = (id) => (id ? id.trim().toString() : "");

    // Map UMS rows by Opportunity_ID for easy lookup (normalize IDs)
    const umsMap = new Map();
    umsRows.forEach(row => {
      const normalizedOpportunityID = normalizeID(row.Opportunity_ID);
      if (normalizedOpportunityID) {
        umsMap.set(normalizedOpportunityID, row); // Save the UMS row by normalized Opportunity_ID
      }
    });

    // Go through the ONBOARDING rows and update Opportunity_IDs
    onboardingRows.forEach((row) => {
      const originalOpportunityID = normalizeID(row.Opportunity_ID);

      // If this Opportunity_ID has not been updated yet, create a new one
      if (originalOpportunityID && !opportunityIDMapping.has(originalOpportunityID)) {
        increment += 1; // Increment the Opportunity_ID format for each found ID
        opportunityIDMapping.set(originalOpportunityID, `AlasDooQaAutoGenJjkkll+${increment}`);
      }

      // Update the ONBOARDING Opportunity_ID with the new mapped ID
      if (originalOpportunityID) {
        row.Opportunity_ID = opportunityIDMapping.get(originalOpportunityID);
      }
    });

    // Now, ensure that all Opportunity_IDs in UMS are updated based on the mapping
    umsRows.forEach((row) => {
      const originalOpportunityID = normalizeID(row.Opportunity_ID);
      if (originalOpportunityID && opportunityIDMapping.has(originalOpportunityID)) {
        row.Opportunity_ID = opportunityIDMapping.get(originalOpportunityID);
      }
    });

    // Write updated UMS and ONBOARDING CSVs back to files
    await writeCSV(UMS_FILE, umsRows);
    await writeCSV(ONBOARDING_FILE, onboardingRows);

    console.log('Opportunity_IDs updated successfully in both files.');
  } catch (err) {
    console.error('Error updating Opportunity_IDs:', err);
  }
}

// Function to write updated rows back to CSV
function writeCSV(filePath, rows) {
  return new Promise((resolve, reject) => {
    const header = Object.keys(rows[0]);
    const csvWriter = createCsvWriter({
      path: filePath,
      header: header.map(col => ({ id: col, title: col }))
    });

    csvWriter
      .writeRecords(rows)
      .then(() => resolve())
      .catch((err) => reject(err));
  });
}

// Run the update process
updateOpportunityIDs();



// opportunity id is changed and synced, change all in onboadring then check if there is same in UMS and change there too