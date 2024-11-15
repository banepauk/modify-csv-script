const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

// Define file paths
const inputFilePath = path.join(__dirname, 'Modified_USERS_NG.csv');
const outputFilePath = path.join(__dirname, 'Modified_USERS_NG.csv');

// Random generators for different fields
const randomSixDigitNumber = () => Math.floor(100000 + Math.random() * 900000);
const randomWebsite = () => `https://testsite${Math.floor(Math.random() * 1000)}.com`;

// Preset values
const usCities = {
  "New York": { state: "New York", street: ["5th Ave", "Broadway", "Wall St"], zip: ["10001", "10002", "10003"] },
  "Los Angeles": { state: "California", street: ["Sunset Blvd", "Hollywood Blvd", "Rodeo Dr"], zip: ["90001", "90002", "90003"] },
  "Chicago": { state: "Illinois", street: ["Magnificent Mile", "Wacker Dr", "State St"], zip: ["60601", "60602", "60603"] },
  "Houston": { state: "Texas", street: ["Westheimer Rd", "Kirby Dr", "Fannin St"], zip: ["77001", "77002", "77003"] },
  "Phoenix": { state: "Arizona", street: ["Camelback Rd", "Glendale Ave", "Central Ave"], zip: ["85001", "85002", "85003"] },
  "Philadelphia": { state: "Pennsylvania", street: ["Market St", "Broad St", "Chestnut St"], zip: ["19101", "19102", "19103"] },
  "Miami": { state: "Florida", street: ["Ocean Dr", "Collins Ave", "Biscayne Blvd"], zip: ["33101", "33102", "33103"] },
  "Denver": { state: "Colorado", street: ["Colfax Ave", "Broadway St", "16th St"], zip: ["80201", "80202", "80203"] },
  "Boston": { state: "Massachusetts", street: ["Beacon St", "Boylston St", "Commonwealth Ave"], zip: ["02101", "02102", "02103"] },
  "Seattle": { state: "Washington", street: ["Pike St", "Broadway Ave", "4th Ave"], zip: ["98101", "98102", "98103"] },
  "Minneapolis": { state: "Minnesota", street: ["Hennepin Ave", "Washington Ave", "Lake St"], zip: ["55101", "55102", "55103"] }

};

const clinicTypes = [
  "Aesthetic Provider", "Ambulatory Surgery Center", "Cosmetic Surgeon", "Day Spa", "Day Spa / Wellness", 
  "Dentist", "Dermatology", "Facial Plastic Surgery", "Family Medicine", "Gynecology / OBGYN", "Hospital",
  "MedSpa", "National Accounts", "Ophthalmology", "Optometry", "Other", "Plastic Surgery", "Regenerative Medicine",
  "Surgical / OBGYN", "Vision Provider", "Wellness Center", "Test"
];
const professions = [
  "Administrator", "Aesthetician", "Business entrepreneur", "Dentist", "Dermatologist", "Marketing manager",
  "Nurse practitioner", "ObGyn", "Ophthalmologist", "Optometrist", "Physician", "Physician’s assistant", 
  "Plastic surgeon", "Procurement manager", "Registered nurse", "Test"
];
const positionsInClinic = [
  "Administrative assistant", "Finance", "Marketing manager", "Medical director", 
  "Medical director & practitioner", "Owner/manager", "Owner/manager & practitioner", 
  "Practitioner", "Procurement manager", "Test"
];

// Track generated values for repeat mapping
const sapIdMap = {};
const cityMap = {};
const salesforceContactIdMap = {};
let salesforceContactIdCounter = 1;

// Function to pick a random item from an array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Process CSV
const processCSV = () => {
  const rows = [];

  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Modify fields as per requirements

      // 1. SapID__c
      if (row.SapID__c) {
        if (!sapIdMap[row.SapID__c]) {
          sapIdMap[row.SapID__c] = randomSixDigitNumber().toString();
        }
        row.SapID__c = sapIdMap[row.SapID__c];
      }

      // 2. BillingCity
      if (!cityMap[row.BillingCity]) {
        cityMap[row.BillingCity] = getRandomItem(Object.keys(usCities));
      }
      row.BillingCity = cityMap[row.BillingCity];

      // 3. BillingStreet
      row.BillingStreet = getRandomItem(usCities[row.BillingCity].street);

      // 4. BillingState
      row.BillingState = usCities[row.BillingCity].state;

      // 5. BillingPostalCode
      row.BillingPostalCode = getRandomItem(usCities[row.BillingCity].zip);

      // 6. Account_website
      if (row.Account_website) {
        row.Account_website = randomWebsite();
      }

      // 7. Contact_mobile = Phone
      row.Contact_mobile = row.Phone;

      // 8. Salesforce_Contact_ID
      if (row.Salesforce_Contact_ID) {
        if (!salesforceContactIdMap[row.Salesforce_Contact_ID]) {
          salesforceContactIdMap[row.Salesforce_Contact_ID] = `AutoGenSalesContactId${salesforceContactIdCounter++}`;
        }
        row.Salesforce_Contact_ID = salesforceContactIdMap[row.Salesforce_Contact_ID];
      }

      // 9. Clinic_Type, Business_type
      row.Clinic_Type = getRandomItem(clinicTypes);
      row.Business_type = getRandomItem(clinicTypes);

      // 10. Customer_Type
      row.Customer_Type = "Test";

      // 11. Profession
      row.Profession = getRandomItem(professions);

      // 12. Position_in_clinic
      row.Position_in_clinic = getRandomItem(positionsInClinic);

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
          console.log('Useri su kompletiraniiiii.');
        })
        .catch(err => console.error('Opet neko sranje:', err));
    });
};

processCSV();





//Users - sapID, biling city, biling street, biling state, biling postal code, website, contact mobile, sales contact id, busines i clinc type, customer type, profession, position in clinc