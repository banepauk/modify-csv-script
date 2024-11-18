const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const ONBOARDING_FILE = 'Modified_ONBOARDING_NG.csv';

const randomNames = [
  "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Emily White", "Michael Harris",
  "Sarah Lee", "David Walker", "Linda Clark", "James Lewis", "Roy Emerson", "Jared Butler", "Anna Mason", 
  "Mike Powell", "Mo Liamson", "Liam Grey", "Lora Waldon", "Reggie Jackson"
];

// read a CSV file and return its rows as an array of objects
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

function getRandomName() {
  const randomIndex = Math.floor(Math.random() * randomNames.length);
  return randomNames[randomIndex];
}

//function to update the ONBOARDING CSV file
async function updateOnboarding() {
  try {
    const onboardingRows = await readCSV(ONBOARDING_FILE);

    let increment = 0;
    const onboardingIdMapping = new Map();  
    const salesforceIdMapping = new Map();  

    const normalizeID = (id) => (id ? id.trim().toString() : "");

    // go through each row in the ONBOARDING file and update OnbaordingID
    onboardingRows.forEach((row) => {
      const originalOnboardingId = normalizeID(row.Onboarding_id); 
      if (originalOnboardingId) {
        if (!onboardingIdMapping.has(originalOnboardingId)) {
          increment += 1;
          onboardingIdMapping.set(originalOnboardingId, `AutoGenOnbId${increment}`);
        }
        row.Onboarding_id = onboardingIdMapping.get(originalOnboardingId); 
      }

      // handle Salesforce IDs
      const primaryContactId = normalizeID(row.Primary_Contact_Salesforce_ID);
      const digitalAdminId = normalizeID(row.Digital_Admin_Saleforce_ID);

      // if both Salesforce IDs are non empty and either both are the same or different
      if (primaryContactId || digitalAdminId) {
        // if both Salesforce IDs are the same, replace both with the same new value
        if (primaryContactId && digitalAdminId && primaryContactId === digitalAdminId) {
          if (!salesforceIdMapping.has(primaryContactId)) {
            increment += 1;
            salesforceIdMapping.set(primaryContactId, `AutoGenSalesForce${increment}`);
          }
          row.Primary_Contact_Salesforce_ID = salesforceIdMapping.get(primaryContactId);
          row.Digital_Admin_Saleforce_ID = salesforceIdMapping.get(primaryContactId);
        }
        // if Salesforce IDs are different, assign unique values to both
        else if (primaryContactId !== digitalAdminId) {
          if (!salesforceIdMapping.has(primaryContactId)) {
            increment += 1;
            salesforceIdMapping.set(primaryContactId, `AutoGenSalesForce${increment}`);
          }
          if (!salesforceIdMapping.has(digitalAdminId)) {
            increment += 1;
            salesforceIdMapping.set(digitalAdminId, `AutoGenSalesForce${increment}`);
          }

          row.Primary_Contact_Salesforce_ID = salesforceIdMapping.get(primaryContactId);
          row.Digital_Admin_Saleforce_ID = salesforceIdMapping.get(digitalAdminId);
        }
      }

      // update Coordinator to a random full name
      const coordinator = row.Coordinator;
      if (coordinator && coordinator.trim()) {
        row.Coordinator = getRandomName();
      } else {
        row.Coordinator = "";
      }
    });

    // write the updated rows back to the CSV file
    await writeCSV(ONBOARDING_FILE, onboardingRows);

    console.log('Iiiide onboarding fajl.');
  } catch (err) {
    console.error('greska:', err);
  }
}

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
updateOnboarding();


// change salesforce IDs (both), and cordinator name (onboarding file)