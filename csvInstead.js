const fs = require('fs');
const fastCsv = require('fast-csv');

let accountCounter = 1;
let emailCounter = 1;
let customerNameCounter = 1;

const firstNames = [
    'John', 'Jane', 'Michael', 'Emily', 'James', 'Sarah', 'David', 'Sophia', 'Robert', 'Linda',
    'William', 'Elizabeth', 'Daniel', 'Olivia', 'Matthew', 'Isabella', 'Benjamin', 'Charlotte',
    'Ethan', 'Amelia', 'Andrew', 'Mia', 'Joshua', 'Avery', 'Joseph', 'Chloe', 'Samuel', 'Hannah',
    'Alexander', 'Madison', 'Lucas', 'Zoe', 'Christopher', 'Lily', 'Jack', 'Grace', 'Ryan', 'Victoria',
    'Henry', 'Aidan', 'Liam', 'Ella', 'Nathan', 'Aria', 'Leo', 'Scarlett', 'David', 'Sophie',
    'Sebastian', 'Addison', 'Elijah', 'Megan', 'Daniel', 'Nora', 'Owen', 'Leah', 'Isaiah', 'Natalie',
    'Cameron', 'Evelyn', 'Thomas', 'Zoey', 'Gabriel', 'Hazel', 'Samuel', 'Savannah', 'Isaac', 'Audrey',
    'Mason', 'Lillian', 'Caleb', 'Alice', 'Maxwell', 'Aurora', 'Jaxon', 'Mackenzie', 'Wyatt', 'Sienna',
    'Jack', 'Juliana', 'Wyatt', 'Penelope', 'Charlie', 'Riley', 'Grayson', 'Lucy', 'Dominic', 'Aidan',
    'Carter', 'Victoria', 'Jesse', 'Camila', 'Austin', 'Stella', 'Eli', 'Eva', 'Miles', 'Anna'
];

const lastNames = [
    'Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
    'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore',
    'Jackson', 'White', 'Harris', 'Clark', 'Lewis', 'Young', 'Allen', 'King', 'Wright', 'Scott',
    'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Evans', 'Turner', 'Collins',
    'Morgan', 'Cooper', 'Murphy', 'Reed', 'Bailey', 'Gomez', 'Howard', 'Ward', 'Diaz', 'Torres',
    'Ramirez', 'Shaw', 'Morris', 'Ross', 'Cook', 'Bailey', 'Bell', 'Sanders', 'Price', 'Kelly',
    'Parker', 'Long', 'Hughes', 'Flores', 'Wood', 'James', 'Stewart', 'Foster', 'Barnes', 'Ross',
    'Graham', 'Kim', 'Grant', 'Riley', 'Bryant', 'Jameson', 'Cameron', 'Murray', 'Jameson', 'Reyes',
    'Hamilton', 'Chapman', 'Johnston', 'Kimberly', 'Carson', 'Douglas', 'Gibson', 'Mendoza', 'Warren',
    'Hughes', 'Williamson', 'Hunter', 'Webb', 'Simpson', 'Jenkins', 'Hicks', 'Chavez', 'George',
    'Sullivan', 'Palmer', 'Morris', 'Nichols', 'Grant', 'Davidson', 'Cameron', 'Holland', 'Bishop',
    'Montgomery', 'Richards', 'Mason', 'Franklin', 'Stone', 'Shannon', 'Nicholson', 'Wheeler', 'Harrison',
    'Black', 'Curtis', 'Simmons', 'Hayes', 'Chavez', 'Richardson', 'Fisher', 'Wells', 'Cunningham', 'George'
];


const accountIdMapping = {};
const emailMapping = {};
const customerNameMapping = {};
const firstNameMapping = {};
const lastNameMapping = {};

function generateAccountId() {
    return `2023AlasDooQaAccAutoGen${accountCounter++}`;
}

function generateEmail(originalEmail) {
    if (!emailMapping[originalEmail]) {
        emailMapping[originalEmail] = `qtester90+autogen${emailCounter++}@gmail.com`;
    }
    return emailMapping[originalEmail];
}

function generateCustomerName(originalName) {
    if (originalName === '') return ''; // Keep empty if originally empty
    if (!customerNameMapping[originalName]) {
        customerNameMapping[originalName] = `AUTOGEN-clinic${customerNameCounter++}`;
    }
    return customerNameMapping[originalName];
}

function generateFirstName(originalFirstName) {
    if (!firstNameMapping[originalFirstName]) {
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        firstNameMapping[originalFirstName] = randomFirstName;
    }
    return firstNameMapping[originalFirstName];
}

function generateLastName(originalLastName) {
    if (!lastNameMapping[originalLastName]) {
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        lastNameMapping[originalLastName] = randomLastName;
    }
    return lastNameMapping[originalLastName];
}

function generatePhoneNumber() {
    const random = () => Math.floor(1000 + Math.random() * 9000);
    return `1-${Math.floor(100 + Math.random() * 900)}-555-${random()}`;
}

function modifyCsv(inputFilePath, outputFilePath, isUsersFile = false) {
    const modifiedRows = [];

    fs.createReadStream(inputFilePath)
        .pipe(fastCsv.parse({ headers: true }))
        .on('data', (row) => {
            // Map and modify Account_Id for USERS file
            if (isUsersFile && row['Account_Id']) {
                const originalAccountId = row['Account_Id'];
                const newAccountId = accountIdMapping[originalAccountId] || generateAccountId();
                accountIdMapping[originalAccountId] = newAccountId;
                row['Account_Id'] = newAccountId;
            } else if (row['Account_Id']) {
                // Apply existing Account_Id mapping
                row['Account_Id'] = accountIdMapping[row['Account_Id']] || row['Account_Id'];
            }

            // Modify other fields
            if (row['Email']) row['Email'] = generateEmail(row['Email']);
            if (row['Phone_Number']) row['Phone_Number'] = generatePhoneNumber();
            if (row['Customer_Name']) row['Customer_Name'] = generateCustomerName(row['Customer_Name']);
            if (row['SAP_legal_customer_name']) row['SAP_legal_customer_name'] = row['Customer_Name'];
            if (row['Salesforce_Business_Name']) row['Salesforce_Business_Name'] = row['Customer_Name'];
            if (row['Contact_mobile']) row['Contact_mobile'] = row['Phone_Number'];
            if (row['Contact_FirstName']) row['Contact_FirstName'] = generateFirstName(row['Contact_FirstName']);
            if (row['Contact_LastName']) row['Contact_LastName'] = generateLastName(row['Contact_LastName']);

            modifiedRows.push(row);
        })
        .on('end', () => {
            fastCsv
                .writeToPath(outputFilePath, modifiedRows, { headers: true, quoteColumns: true })
                .on('finish', () => console.log(`File saved: ${outputFilePath}`))
                .on('error', (error) => console.error(`Error writing file: ${error.message}`));
        })
        .on('error', (error) => console.error(`Error reading file: ${error.message}`));
}

async function processFiles() {
    try {
        // Map Account_Id across all files for consistency
        await mapIdsAcrossFiles(
            ['NG User Data - USERS_NG.csv', 'NG User Data - ONBOARDING_NG.csv', 'NG User Data - UMS.csv'],
            'Account_Id',
            accountIdMapping,
            generateAccountId
        );

        // Modify USERS file
        modifyCsv('NG User Data - USERS_NG.csv', 'Modified_USERS_NG.csv', true);

        // Modify ONBOARDING and UMS files
        modifyCsv('NG User Data - ONBOARDING_NG.csv', 'Modified_ONBOARDING_NG.csv');
        modifyCsv('NG User Data - UMS.csv', 'Modified_UMS_NG.csv');
    } catch (err) {
        console.error('Processing failed:', err);
    }
}

function mapIdsAcrossFiles(filePaths, rowKey, mapping, generator) {
    return Promise.all(
        filePaths.map(
            (filePath) =>
                new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe(fastCsv.parse({ headers: true }))
                        .on('data', (row) => {
                            if (row[rowKey] && !mapping[row[rowKey]]) {
                                mapping[row[rowKey]] = generator(row[rowKey]);
                            }
                        })
                        .on('end', resolve)
                        .on('error', reject);
                })
        )
    );
}

processFiles();
