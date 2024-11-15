const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const ONBOARDING_FILE = 'Modified_ONBOARDING_NG.csv';

// List of random real full names for the Coordinator field
const randomNames = [
  "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Emily White", "Michael Harris",
  "Sarah Lee", "David Walker", "Linda Clark", "James Lewis", "Roy Emerson", "Jared Butler", "Anna Mason", 
  "Mike Powell", "Mo Liamson", "Liam Grey", "Lora Waldon", "Reggie Jackson"
];

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

// Function to get a random full name for the Coordinator field
function getRandomName() {
  const randomIndex = Math.floor(Math.random() * randomNames.length);
  return randomNames[randomIndex];
}

// Function to update the ONBOARDING CSV file
async function updateOnboarding() {
  try {
    // Read the ONBOARDING CSV file
    const onboardingRows = await readCSV(ONBOARDING_FILE);

    let increment = 0;
    const onboardingIdMapping = new Map();  // Track OnboardingId changes
    const salesforceIdMapping = new Map();  // Track Salesforce ID changes

    // Function to normalize ID (trim and convert to string)
    const normalizeID = (id) => (id ? id.trim().toString() : "");

    // Go through each row in the ONBOARDING file
    onboardingRows.forEach((row) => {
      // 1. Update OnboardingId (ensure uniqueness and same replacement for duplicate IDs)
      const originalOnboardingId = normalizeID(row.Onboarding_id); // Use Onboarding_id correctly
      if (originalOnboardingId) {
        if (!onboardingIdMapping.has(originalOnboardingId)) {
          increment += 1;
          onboardingIdMapping.set(originalOnboardingId, `AutoGenOnbId${increment}`);
        }
        row.Onboarding_id = onboardingIdMapping.get(originalOnboardingId); // Update Onboarding_id
      }

      // 2. Handle Salesforce IDs: Primary_Contact_Salesforce_ID and Digital_Admin_Saleforce_ID
      const primaryContactId = normalizeID(row.Primary_Contact_Salesforce_ID);
      const digitalAdminId = normalizeID(row.Digital_Admin_Saleforce_ID);

      // Case 1: If both Salesforce IDs are non-empty and either both are the same or different
      if (primaryContactId || digitalAdminId) {
        // Case 1.1: If both Salesforce IDs are the same, replace both with the same new value
        if (primaryContactId && digitalAdminId && primaryContactId === digitalAdminId) {
          if (!salesforceIdMapping.has(primaryContactId)) {
            increment += 1;
            salesforceIdMapping.set(primaryContactId, `AutoGenSalesForce${increment}`);
          }
          row.Primary_Contact_Salesforce_ID = salesforceIdMapping.get(primaryContactId);
          row.Digital_Admin_Saleforce_ID = salesforceIdMapping.get(primaryContactId); // Same value for both
        }
        // Case 1.2: If Salesforce IDs are different, assign unique values to both
        else if (primaryContactId !== digitalAdminId) {
          if (!salesforceIdMapping.has(primaryContactId)) {
            increment += 1;
            salesforceIdMapping.set(primaryContactId, `AutoGenSalesForce${increment}`);
          }
          if (!salesforceIdMapping.has(digitalAdminId)) {
            increment += 1;
            salesforceIdMapping.set(digitalAdminId, `AutoGenSalesForce${increment}`);
          }

          // Assign unique values
          row.Primary_Contact_Salesforce_ID = salesforceIdMapping.get(primaryContactId);
          row.Digital_Admin_Saleforce_ID = salesforceIdMapping.get(digitalAdminId);
        }
      }

      // 3. Update Coordinator to a random full name
      const coordinator = row.Coordinator;
      if (coordinator && coordinator.trim()) {
        // Replace with random name if there's a value
        row.Coordinator = getRandomName();
      } else {
        // If empty, leave empty
        row.Coordinator = "";
      }
    });

    // Write the updated rows back to the CSV file
    await writeCSV(ONBOARDING_FILE, onboardingRows);

    console.log('Iiiide onboarding fajl.');
  } catch (err) {
    console.error('greska:', err);
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
updateOnboarding();


// change salesforce IDs (both), and cordinator name (onboarding file)