const fs = require('fs');
const fastCsv = require('fast-csv');

// Utility functions for autogenerating values
let accountCounter = 1;
let emailCounter = 1;
let customerNameCounter = 1;
let nameCounter = 1;

// Expanded list of realistic first and last names
const firstNames = [
    'John', 'Jane', 'Michael', 'Emily', 'James', 'Sarah', 'David', 'Sophia', 'Robert', 'Linda',
    'William', 'Elizabeth', 'Daniel', 'Laura', 'Matthew', 'Olivia', 'Charles', 'Isabella', 'Henry',
    'Chloe', 'Joseph', 'Charlotte', 'Thomas', 'Ava', 'Benjamin', 'Mia', 'Lucas', 'Amelia', 'Jack',
    'Ella', 'Jackson', 'Grace', 'Samuel', 'Harper', 'Daniel', 'Victoria', 'Ethan', 'Zoe', 'Mason',
    'Lily', 'Ryan', 'Aria', 'Christopher', 'Scarlett', 'Leo', 'Ruby', 'Jacob', 'Alice', 'Elijah',
    'Hannah', 'Daniela', 'Alexander', 'Layla', 'Matthew', 'Leah', 'Evelyn', 'Sebastian', 'Aurora',
    'Cameron', 'Carter', 'Natalie', 'Xander', 'Maya', 'Dylan', 'Luna', 'Aiden', 'Hazel', 'Elliot'
];

const lastNames = [
    'Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
    'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore',
    'Jackson', 'White', 'Harris', 'Clark', 'Lewis', 'Young', 'King', 'Scott', 'Adams', 'Baker',
    'Carter', 'Morris', 'Mitchell', 'Perez', 'Roberts', 'Gomez', 'Cook', 'Murphy', 'Bailey',
    'Rivera', 'Cooper', 'Reed', 'Bell', 'Graham', 'Parker', 'Wright', 'Evans', 'King', 'Campbell',
    'Nelson', 'Duncan', 'Flores', 'James', 'Murray', 'Mason', 'Cooke', 'Sullivan', 'Howard', 'Ward',
    'Fisher', 'Cole', 'Watson', 'Brooks', 'Chang', 'Bennett', 'Phillips', 'Evans', 'Hughes', 'Rogers',
    'Diaz', 'Kim', 'Chang', 'Harrison', 'Stewart', 'Lewis', 'Robinson', 'Russell', 'Bishop', 'Graham'
];

// Mappings
const emailMapping = {};
const firstNameMapping = {};
const lastNameMapping = {};
const accountIdMapping = {};  // Store the mapping for Account_Id changes
const customerNameMapping = {}; // Store customer name mappings

// Helper functions (generateAccountId, generateDeviceSN, etc.) remain the same

function generateAccountId() {
    return `2023AlasDooQaAccAutoGen${accountCounter++}`;
}

// Generate Email
function generateEmail(originalEmail) {
    if (!emailMapping[originalEmail]) {
        emailMapping[originalEmail] = `qtester90+autogen${emailCounter++}@gmail.com`;
    }
    return emailMapping[originalEmail];
}

// Generate First Name
function generateFirstName(originalFirstName) {
    if (!firstNameMapping[originalFirstName]) {
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        firstNameMapping[originalFirstName] = randomFirstName;
    }
    return firstNameMapping[originalFirstName];
}

// Generate Last Name
function generateLastName(originalLastName) {
    if (!lastNameMapping[originalLastName]) {
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        lastNameMapping[originalLastName] = randomLastName;
    }
    return lastNameMapping[originalLastName];
}

// Generate Phone Number
function generatePhoneNumber() {
    const random = () => Math.floor(1000 + Math.random() * 9000);
    return `1-${Math.floor(100 + Math.random() * 900)}-555-${random()}`;
}

// Generate Customer Name
function generateCustomerName(originalName) {
    if (originalName === '') return ''; // Keep empty if originally empty
    if (!customerNameMapping[originalName]) {
        customerNameMapping[originalName] = `AUTOGEN-clinic${customerNameCounter++}`;
    }
    return customerNameMapping[originalName];
}

// Modify AccountId in USERS table and apply changes to UMS and ONBOARDING
function modifyCsv(inputFilePath, outputFilePath, modifyRow, isUsersFile = false) {
    const modifiedRows = [];

    fs.createReadStream(inputFilePath)
        .pipe(fastCsv.parse({ headers: true }))
        .on('data', (row) => {
            // If it's the USERS table, track Account_Id changes
            if (isUsersFile && row['Account_Id']) {
                const originalAccountId = row['Account_Id'];
                const newAccountId = accountIdMapping[originalAccountId] || generateAccountId();
                accountIdMapping[originalAccountId] = newAccountId; // Map the original AccountId to new one
                row['Account_Id'] = newAccountId; // Apply the change
            } else if (row['Account_Id']) {
                // If it's not USERS file, just apply the existing mapping
                row['Account_Id'] = accountIdMapping[row['Account_Id']] || row['Account_Id'];
            }

            // Apply other modifications
            if (row['Email']) row['Email'] = generateEmail(row['Email']);  // Ensure email is consistent across files
            if (row['Phone_Number']) row['Phone_Number'] = generatePhoneNumber();
            if (row['Customer_Name']) row['Customer_Name'] = generateCustomerName(row['Customer_Name']);
            if (row['SAP_legal_customer_name']) row['SAP_legal_customer_name'] = row['Customer_Name'];
            if (row['Salesforce_Business_Name']) row['Salesforce_Business_Name'] = row['Customer_Name'];
            if (row['Contact_mobile']) row['Contact_mobile'] = row['Phone_Number'];  // Set Contact_mobile to Phone_Number
            if (row['Contact_FirstName']) row['Contact_FirstName'] = generateFirstName(row['Contact_FirstName']);  // Generate First Name
            if (row['Contact_LastName']) row['Contact_LastName'] = generateLastName(row['Contact_LastName']);  // Generate Last Name

            modifiedRows.push(row);
        })
        .on('end', () => {
            fastCsv.writeToPath(outputFilePath, modifiedRows, { headers: true })
                .on('finish', () => console.log(`File saved: ${outputFilePath}`));
        });
}

// Helper function to map IDs across files for consistency
function mapIdsAcrossFiles(filePaths, rowKey, mapping, generator) {
    return new Promise((resolve, reject) => {
        const promises = filePaths.map((filePath) => 
            new Promise((fileResolve, fileReject) => {
                fs.createReadStream(filePath)
                    .pipe(fastCsv.parse({ headers: true }))
                    .on('data', (row) => {
                        if (row[rowKey] && !mapping[row[rowKey]]) {
                            mapping[row[rowKey]] = generator(row[rowKey]);
                        }
                    })
                    .on('end', fileResolve)
                    .on('error', fileReject);
            })
        );
        Promise.all(promises).then(resolve).catch(reject);
    });
}

// Main function to execute steps
async function processFiles() {
    try {
        // Step 1: Map Account_Id from USERS, ONBOARDING, and UMS for consistency
        await mapIdsAcrossFiles(
            ['NG User Data - USERS_NG.csv', 'NG User Data - ONBOARDING_NG.csv', 'NG User Data - UMS.csv'],
            'Account_Id', accountIdMapping, generateAccountId
        );

        // Step 2: Modify the USERS file and apply Account_Id changes
        modifyCsv('NG User Data - USERS_NG.csv', 'Modified_USERS_NG.csv', (row) => {}, true);

        // Step 3: Modify ONBOARDING and UMS files by applying the Account_Id mappings
        modifyCsv('NG User Data - ONBOARDING_NG.csv', 'Modified_ONBOARDING_NG.csv', (row) => {});
        modifyCsv('NG User Data - UMS.csv', 'Modified_UMS_NG.csv', (row) => {});

    } catch (err) {
        console.error('you shall not pass:', err);
    }
}

// Run the main function to start processing files
processFiles();



//accountID accross all three, customer name, name and last name