const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const UMS_FILE = 'Modified_UMS_NG.csv';
const ONBOARDING_FILE = 'Modified_ONBOARDING_NG.csv';

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

// update the Opportunity_IDs in both UMS and ONBOARDING files
async function updateOpportunityIDs() {
  try {
    const umsRows = await readCSV(UMS_FILE);
    const onboardingRows = await readCSV(ONBOARDING_FILE);

    let increment = 0;
    const opportunityIDMapping = new Map(); 

    const normalizeID = (id) => (id ? id.trim().toString() : "");

    // map UMS rows by Opportunity_ID for easy lookup (normalize IDs)
    const umsMap = new Map();
    umsRows.forEach(row => {
      const normalizedOpportunityID = normalizeID(row.Opportunity_ID);
      if (normalizedOpportunityID) {
        umsMap.set(normalizedOpportunityID, row);
      }
    });

    // map ONBOARDING rows and update Opportunity_IDs with new generated ones
    onboardingRows.forEach((row) => {
      const originalOpportunityID = normalizeID(row.Opportunity_ID);

      // if the Opportunity_ID is not empty, map it to a new ID
      if (originalOpportunityID) {
        if (!opportunityIDMapping.has(originalOpportunityID)) {
          increment += 1; 
          opportunityIDMapping.set(originalOpportunityID, `AutoGenOppId+${increment}`);
        }
        row.Opportunity_ID = opportunityIDMapping.get(originalOpportunityID);
      }
    });

    // ensure that all Opportunity_IDs in UMS are updated based on the mapping
    umsRows.forEach((row) => {
      const originalOpportunityID = normalizeID(row.Opportunity_ID);

      // if Opportunity_ID is not empty and exists in the mapping, update it
      if (originalOpportunityID && opportunityIDMapping.has(originalOpportunityID)) {
        row.Opportunity_ID = opportunityIDMapping.get(originalOpportunityID);
      } else if (!originalOpportunityID) {
        // if the Opportunity_ID is empty, leave it empty
        row.Opportunity_ID = ""; // (reminder) remove this line if you want it to remain null or undefined
      } else {
        // if UMS has an Opportunity_ID that is not in the mapping, assign it a new value
        increment += 1;
        const newOpportunityID = `AutoGenOppId+${increment}`;
        row.Opportunity_ID = newOpportunityID;
        opportunityIDMapping.set(originalOpportunityID, newOpportunityID);
      }
    });

    // write updated UMS and ONBOARDING CSVs back to files
    await writeCSV(UMS_FILE, umsRows);
    await writeCSV(ONBOARDING_FILE, onboardingRows);

    console.log('Uspesan update Opportunity_IDs u oba fajla, idemoooooo.');
  } catch (err) {
    console.error('opet neka greska:', err);
  }
}

// write updated rows back to CSV
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
updateOpportunityIDs();




// opportunity id is changed and synced, change all in onboadring then check if there is same in UMS and change there too