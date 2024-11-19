const fs = require('fs');
const csv = require('csv-parser');
const fastcsv = require('fast-csv'); // Use fast-csv for proper CSV formatting

// Reusable mappings and generators
const randomSixDigitNumber = () => Math.floor(100000 + Math.random() * 900000);
const randomWebsite = () => `https://testsite${Math.floor(Math.random() * 1000)}.com`;

const usCities = {
  "New York": { 
    state: "New York", 
    street: ["5th Ave", "Broadway", "Wall St", "Madison Ave", "Park Ave"], 
    zip: ["10001", "10002", "10003", "10004", "10005"] 
  },
  "Los Angeles": { 
    state: "California", 
    street: ["Sunset Blvd", "Hollywood Blvd", "Rodeo Dr", "Santa Monica Blvd", "Wilshire Blvd"], 
    zip: ["90001", "90002", "90003", "90004", "90005"] 
  },
  "Chicago": { 
    state: "Illinois", 
    street: ["Michigan Ave", "State St", "Wacker Dr", "Lake Shore Dr", "Roosevelt Rd"], 
    zip: ["60601", "60602", "60603", "60604", "60605"] 
  },
  "San Francisco": { 
    state: "California", 
    street: ["Market St", "Mission St", "Van Ness Ave", "Geary Blvd", "Folsom St"], 
    zip: ["94101", "94102", "94103", "94104", "94105"] 
  },
  "Miami": { 
    state: "Florida", 
    street: ["Ocean Dr", "Collins Ave", "Biscayne Blvd", "Washington Ave", "Flagler St"], 
    zip: ["33101", "33102", "33103", "33104", "33105"] 
  },
  "Dallas": { 
    state: "Texas", 
    street: ["Main St", "Elm St", "Lamar St", "Harwood St", "Pacific Ave"], 
    zip: ["75201", "75202", "75203", "75204", "75205"] 
  },
  "Seattle": { 
    state: "Washington", 
    street: ["1st Ave", "2nd Ave", "Pike St", "Broadway", "Alaskan Way"], 
    zip: ["98101", "98102", "98103", "98104", "98105"] 
  },
  "Houston": { 
    state: "Texas", 
    street: ["Main St", "Westheimer Rd", "Katy Fwy", "Richmond Ave", "Buffalo Bayou"], 
    zip: ["77001", "77002", "77003", "77004", "77005"] 
  },
  "Atlanta": { 
    state: "Georgia", 
    street: ["Peachtree St", "Canton Rd", "Ponce De Leon Ave", "Boulevard SE", "North Ave"], 
    zip: ["30301", "30302", "30303", "30304", "30305"] 
  }
};

const sapIdMap = {};
const salesforceContactIdMap = {};
const phoneMapping = {};
let salesforceContactIdCounter = 1;

// Generate random phone number
const generateRandomPhoneNumber = () => {
  const areaCode = Math.floor(Math.random() * 800) + 200;1
  const lineNumber = Math.floor(Math.random() * 10000);
  return `1-${areaCode}-555-${lineNumber.toString().padStart(4, '0')}`;
};

// Utility function to pick a random item
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Function to modify and process rows
function modifyRow(row) {
  // Only modify if field is non-empty
  if (row['SapID__c'] && row['SapID__c'].trim()) {
    if (!sapIdMap[row['SapID__c']]) sapIdMap[row['SapID__c']] = randomSixDigitNumber().toString();
    row['SapID__c'] = sapIdMap[row['SapID__c']];
  }


  if (row['BillingCity'] && row['BillingCity'].trim()) {
    let cityName = row['BillingCity'].trim();
  
    // check if the city is valid; if not, replace it with a random valid city
    if (!usCities[cityName]) {
      cityName = getRandomItem(Object.keys(usCities));
      row['BillingCity'] = cityName; // update BillingCity to the valid random city
    }
  
    // retrieve the details of the selected or replaced city
    const cityDetails = usCities[cityName];
  
    // update all related fields based on the updated or original city
    row['BillingStreet'] = getRandomItem(cityDetails.street);
    row['BillingState'] = cityDetails.state;
    row['BillingPostalCode'] = getRandomItem(cityDetails.zip);
  } else {
    console.log(`Invalid or missing BillingCity, skipping row:`, row);
  }
  
  
  // if (row['BillingCity'] && row['BillingCity'].trim()) {
  //   if (!usCities[row['BillingCity']]) row['BillingCity'] = getRandomItem(Object.keys(usCities));
  //   const cityDetails = usCities[row['BillingCity']];
  //   if (!row['BillingStreet']) row['BillingStreet'] = getRandomItem(cityDetails.street);
  //   if (!row['BillingState']) row['BillingState'] = cityDetails.state;
  //   if (!row['BillingPostalCode']) row['BillingPostalCode'] = getRandomItem(cityDetails.zip);
  // }

  if (row['Account_website'] && row['Account_website'].trim()) {
    row['Account_website'] = randomWebsite();
  }

  if (row['Phone'] && row['Phone'].trim()) {
    if (!phoneMapping[row['Phone']]) phoneMapping[row['Phone']] = generateRandomPhoneNumber();
    row['Phone'] = phoneMapping[row['Phone']];
  }

  if (row['Salesforce_Contact_ID'] && row['Salesforce_Contact_ID'].trim()) {
    if (!salesforceContactIdMap[row['Salesforce_Contact_ID']]) {
      salesforceContactIdMap[row['Salesforce_Contact_ID']] = `AutoGenSalesContactId${salesforceContactIdCounter++}`;
    }
    row['Salesforce_Contact_ID'] = salesforceContactIdMap[row['Salesforce_Contact_ID']];
  }

  if (!row['Contact_mobile'] && row['Phone']) {
    row['Contact_mobile'] = row['Phone'];
  }

  return row;
}

// main function to process CSV
function processCSV(inputFile, outputFile) {
  const results = [];

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (row) => {
      try {
        const modifiedRow = modifyRow(row);
        results.push(modifiedRow);
      } catch (error) {
        console.error('Error modifying row:', error);
      }
    })
    .on('end', () => {
      writeCSV(outputFile, results);
      console.log(`Processing complete. Modified file saved as: ${outputFile}`);
    })
    .on('error', (error) => {
      console.error(`Error reading file: ${error.message}`);
    });
}

// write modified rows to a new CSV file
function writeCSV(outputFile, data) {
  const ws = fs.createWriteStream(outputFile);

  fastcsv
    .write(data, { headers: true, quoteColumns: true })
    .pipe(ws)
    .on('finish', () => {
      console.log('File successfully written.');
    })
    .on('error', (error) => {
      console.error(`Error writing file: ${error.message}`);
    });
}


const inputFile = 'Modified_USERS_NG.csv';
const outputFile = 'Modified_USERS_NG.csv';
processCSV(inputFile, outputFile);
