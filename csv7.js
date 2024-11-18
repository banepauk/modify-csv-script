const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const inputFilePath = path.join(__dirname, 'Modified_USERS_NG.csv');
const outputFilePath = path.join(__dirname, 'Modified_USERS_NG.csv');

// generators for different fields
const randomSixDigitNumber = () => Math.floor(100000 + Math.random() * 900000);
const randomWebsite = () => `https://testsite${Math.floor(Math.random() * 1000)}.com`;

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
  "Aesthetic Provider", "Ambulatory Surgery Center", "Cosmetic Surgeon", "Day Spa",
  "Dentist", "Dermatology", "MedSpa", "Plastic Surgery", "Wellness Center", "Test"
];
const professions = [
  "Administrator", "Aesthetician", "Business entrepreneur", "Dermatologist",
  "Physician", "Nurse practitioner", "Plastic surgeon", "Test"
];
const positionsInClinic = [
  "Administrative assistant", "Marketing manager", "Owner/manager",
  "Practitioner", "Procurement manager", "Test"
];
const titles = ["Ms.", "Miss", "Mrs.", "Mr.", "Dr.", "Prof.", "Test"];

//generated values for repeat mapping
const sapIdMap = {};
const salesforceContactIdMap = {};
let salesforceContactIdCounter = 1;

function generateRandomPhoneNumber() {
  const areaCode = Math.floor(Math.random() * 800) + 200; // Avoid area codes starting with 0 or 1
  const lineNumber = Math.floor(Math.random() * 10000); // 4-digit line number
  return `1-${areaCode}-555-${lineNumber.toString().padStart(4, '0')}`;
}


const phoneNumbers = Array.from({ length: 10 }, generateRandomPhoneNumber);

// Function to pick a random item from an array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// process CSV
const processCSV = () => {
  const rows = [];

  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => {

      // SapID__c
      if (row.SapID__c && row.SapID__c.trim()) {
        if (!sapIdMap[row.SapID__c]) {
          sapIdMap[row.SapID__c] = randomSixDigitNumber().toString();
        }
        row.SapID__c = sapIdMap[row.SapID__c];
      }

      // BillingCity
      if (row.BillingCity && row.BillingCity.trim()) {
        if (!usCities[row.BillingCity]) {
          row.BillingCity = getRandomItem(Object.keys(usCities));
        }
      }

      // BillingStreet
      if (row.BillingStreet && row.BillingCity && usCities[row.BillingCity]) {
        row.BillingStreet = getRandomItem(usCities[row.BillingCity].street);
      }

      // BillingState
      if (row.BillingState && row.BillingCity && usCities[row.BillingCity]) {
        row.BillingState = usCities[row.BillingCity].state;
      }

      // BillingPostalCode
      if (row.BillingPostalCode && row.BillingCity && usCities[row.BillingCity]) {
        row.BillingPostalCode = getRandomItem(usCities[row.BillingCity].zip);
      }

      // Account_website
      if (row.Account_website && row.Account_website.trim()) {
        row.Account_website = randomWebsite();
      }

      // Contact_mobile
      if (row.Phone && row.Phone.trim()) {
        row.Phone = generateRandomPhoneNumber();
      }
      
       row.Contact_mobile = row.Phone
      // Salesforce_Contact_ID
      if (row.Salesforce_Contact_ID && row.Salesforce_Contact_ID.trim()) {
        if (!salesforceContactIdMap[row.Salesforce_Contact_ID]) {
          salesforceContactIdMap[row.Salesforce_Contact_ID] = `AutoGenSalesContactId${salesforceContactIdCounter++}`;
        }
        row.Salesforce_Contact_ID = salesforceContactIdMap[row.Salesforce_Contact_ID];
      }

      // // Clinic_Type
      // if (row.Clinic_Type && row.Clinic_Type.trim()) {
      //   row.Clinic_Type = getRandomItem(clinicTypes);
      // }

      // // Business_type
      // if (row.Business_type && row.Business_type.trim()) {
      //   row.Business_type = getRandomItem(clinicTypes);
      // }

      // // Contact_title
      // if (row.Contact_title && row.Contact_title.trim()) {
      //   row.Contact_title = getRandomItem(titles);
      // }

      // // Profession
      // if (row.Profession && row.Profession.trim()) {
      //   row.Profession = getRandomItem(professions);
      // }

      // // Position_in_clinic
      // if (row.Position_in_clinic && row.Position_in_clinic.trim()) {
      //   row.Position_in_clinic = getRandomItem(positionsInClinic);
      // }

      // // Customer_Type
      // if (row.Customer_Type && row.Customer_Type.trim()) {
      //   row.Customer_Type = "Test";
      // }

      rows.push(row);
    })
    .on('end', () => {
      const csvWriter = createObjectCsvWriter({
        path: outputFilePath,
        header: Object.keys(rows[0]).map(column => ({ id: column, title: column }))
      });

      csvWriter.writeRecords(rows)
        .then(() => {
          console.log('CSV processing completed.');
        })
        .catch(err => console.error('Error writing CSV:', err));
    });
};

processCSV();
