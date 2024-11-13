const fs = require('fs');
const csvParser = require('csv-parser');
const csvWriter = require('csv-writer').createObjectCsvWriter;

// Define file paths
const onboardingFilePath = 'Modified_ONBOARDING_NG.csv';
const umsFilePath = 'Modified_UMS_NG.csv';

// Define replacement values for System_REF and Material_Number
const replacementValues = [
    'GA-0000070BE', 'GA-0000070BEGR', 'GA-0000070CNBE', 'GA-0000070DEBE', 'GA-0000070GRBE', 'GA-0000070SH',
    'GA-0000080BE', 'GA-0000080CN', 'GA-0000080CNBE', 'GA-0000110BE', 'GA-0000120BE', 'GA-0000120CNBE',
    'GA-0000130BE', 'GA-0000130CNBE', 'GA-0000170BE', 'GA-0000170CNBE', 'GA-0000180BE', 'GA-0000180CNBE',
    'GA-0000777BE', 'RG-0000070BE', 'RG-0000110BE', 'RG-0000120BE', 'RG-0000130BE', 'GA-0000070', 
    'GA-0000070CN', 'GA-0000070DE', 'GA-0000070GR', 'GA-0000080', 'GA-0000110', 'GA-0000120', 'GA-0000120CN',
    'GA-0000130', 'GA-0000130CN', 'GA-0000170', 'GA-0000170CN', 'GA-0000180', 'GA-0000180CN', 'GA-0000777',
    'RG-0000070', 'RG-0000110', 'RG-0000120', 'RG-0000130', 'GA-5200000', 'GA-5200000US', 'GA-5200000BE',
    'GA-5200000USBE', 'GA-5200000W', 'GA-5200000WBE', 'GA-5200000WUS', 'GA-5200000WUSBE', 'GA-520000WUS',
    'GA-520000WUSBE', '30020000BE', '30020000UBE', '30020000', '30020000U', 'GASB00000', 'GASB00000CN',
    'GASB00000DE', 'GASB00000GR', 'GASB00001', 'GASB00002', 'GASB00002CN', 'RGASB0000', 'RGASB00000',
    'GASB00000BE', 'GASB00000CNBE', 'GASB00000DEBE', 'GASB00000GRBE', 'GASB00001BE', 'GASB00002BE',
    'GASB00002CNBE', 'RGASB00000BE', 'RGASB0000BE', '0642-403-01BE', '0642-404-01BE', '0642-407-01BE',
    '0642-408-01BE', '0642-409-01BE', '0642-409-01-CN', '0642-409-01-CNBE', '0642-409-01DE', '0642-409-01DEBE',
    '0642-409-01GR', '0642-409-01GRBE', '0642-410-01BE', '0642-413-01BE', '0642-415-01BE', '0642-627-01BE',
    '0642-628-01', '0642-628-01BE', '0642-629-01BE', 'GA-0000430BE', 'GA-0000440BE', 'GA-0000460BE',
    'GA-0000460CNBE', 'GA-0000470BE', 'GA-0000470CNBE', 'GA-0000480BE', 'GA-0000480CNBE', 'GA-0000530BE',
    'GA-0000540BE', 'GA-0000550BE', 'GA-0000550DE', 'GA-0000550DEBE', 'GA-0000550GRBE', 'GA-0000560BE',
    'GA-0000560CNBE', 'GA-0000560DE', 'GA-0000560DEBE', 'GA-0000560GRBE', 'GA-0000570BE', 'RG-0000470BE',
    'RG-0000560BE', 'RGA-0000470BE', 'RGA-0000560BE', '0642-403-01', '0642-404-01', '0642-407-01', '0642-408-01',
    '0642-409-01', '0642-410-01', '0642-413-01', '0642-415-01', '0642-627-01', '0642-629-01', 'GA-0000430',
    'GA-0000440', 'GA-0000460', 'GA-0000460CN', 'GA-0000470', 'GA-0000470CN', 'GA-0000480', 'GA-0000480CN',
    'GA-0000530', 'GA-0000540', 'GA-0000550', 'GA-0000550GR', 'GA-0000560', 'GA-0000560CN', 'GA-0000560GR',
    'GA-0000570', 'RG-0000470', 'RG-0000560', 'RGA-0000470', 'RGA-0000560', 'GA-0006200', 'GA-0006200JP',
    'GA-0006200LMX', 'GA-0006200BE', 'GA-0006200CN', 'GA-0006200DE', 'GA-0006200DEBE', 'GA-0006200GR',
    'GA-0006200GRBE', 'GA-0006200LMXGR', 'GA-0006400BE', 'GA-0006400', 'GA-0006200LMXBE', '35000020AS',
    '35000020ASBE', '35000020BE', '35000020UBE', '35000020', '35000020U', 'GA-5000000BE', 'GA-5000019',
    'GA-5000019BE', 'GA-5100000BE', 'GA-5000000', 'GA-5100000', '30020000BK', '30020000BKBE', '35000300U',
    '35000300', '35000300BE', '35000300UBE', 'GA-0005200BE', 'GA-0005200CNBE', 'GA-0005200DEBE',
    'GA-0005200GRBE', 'GA-0005200JPBE', 'GA-0005200SH', 'GA-0005201CNBE', 'GA-0005201DE', 'GA-0005201DEBE',
    'GA-0005201SH', 'GA-0005300BE', 'RG-0005200BE', 'GA-0005200', 'GA-0005200CN', 'GA-0005200DE', 'GA-0005200GR',
    'GA-0005200JP', 'GA-0005201CN', 'GA-0005300', 'RG-0005200', 'GA-2000011', 'GA-2000021', 'GA-0005500AESBE',
    'GA-0005500BE', 'GA-0005500DIG', 'GA-0005500DIGAESBE', 'GA-0005500DIGBE', 'GA-0005500DIGDE', 'GA-0005500DIGDEBE',
    'GA-0005500DIGGR', 'GA-0005500DIGGRBE', 'GA-0005500JP', 'GA-0005500JPBE', 'GA-0006200VNLBE', 'GA-0005500',
    'GA-0005500AES', 'GA-0005500DIGAES', 'GA-0006200VNL', 'GA-1170000BE', 'GA-1170000CNBE', 'GA-1170000DEBE',
    'GA-1170000GRBE', 'GA-1170000USBE', 'RG-1170000BE', 'RG-1170000', 'GA-1170000CN', 'GA-1170000DE',
    'GA-1170000GR', 'GA-1170000US', 'GA-1170000', 'GA-1200000BE', 'GA-1200000DEBE', 'GA-1200000GRBE',
    'GA-1200000', 'GA-1200000DE', 'GA-1200000GR', 'GA-1140000DE', 'GA-1140000DEBE', 'GA-1140000GR',
    'GA-1140000GRBE', 'GA-1140000JPBE', 'GA-1140000', 'GA-1140000JP', 'GA-1140000BE', 'GA-1160000BE',
    'GA-1160000', 'GA-3000001', 'GA-6200000US', 'AT-TEST000', 'GA-4000080', 'GA-4000081', 'RGA-4000081',
    'GA-4000000', 'GA-4000001', 'RGA-4000001', 'GA-4000070', 'GA-4000071', 'RGA-4000071', 'GA-4000071CE',
    'RGA-4000071CE', 'GA-4000090', 'GA-4000091', 'RGA-4000091', 'GA-4000070CE', 'RGA-4000080', 'GA-4300001',
    'RGA-4000000', 'RGA-4000070', 'GA-3000090CE', 'RGA-4000090'
];

let replacementIndex = 0; // Keep track of which replacement value to use

// Initialize device serial number
let deviceSerialCounter = 1;

// Helper function to get a replacement System_REF or Material_Number
const getReplacementValue = () => replacementValues[replacementIndex++ % replacementValues.length];

// Helper function to generate the Device_SN
const generateDeviceSN = () => `AutoGenWEDOQA${deviceSerialCounter++}`;

// Dictionaries to track replacement mappings for consistent values
const deviceSNMap = {};
const systemRefMap = {};
const materialNumberMap = {};

// Function to get or create a consistent replacement value
const getOrCreateReplacement = (originalValue, map, generator) => {
    if (!originalValue) return ""; // If the original value is empty, return it as-is
    if (!map[originalValue]) {
        map[originalValue] = generator();
    }
    return map[originalValue];
};

// Read CSV file
const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => data.push(row))
            .on('end', () => resolve(data))
            .on('error', reject);
    });
};

// Write CSV file
const writeCSV = (filePath, data) => {
    const header = Object.keys(data[0]).map((key) => ({ id: key, title: key }));
    const writer = csvWriter({ path: filePath, header });
    return writer.writeRecords(data);
};

// Main function
(async () => {
    try {
        // Load both CSV files
        const onboardingData = await readCSV(onboardingFilePath);
        const umsData = await readCSV(umsFilePath);

        // Create a map to track all existing entries based on their Name_Installed_Product for cross-file consistency
        const allDataMap = {}; // { Name_Installed_Product: { Device_SN, System_REF/Material_Number } }

        // Populate the map with entries from ONBOARDING and UMS for a global reference of original values
        onboardingData.forEach((row) => {
            const { Name_Installed_Product, Device_SN, System_REF } = row;
            if (!allDataMap[Name_Installed_Product]) allDataMap[Name_Installed_Product] = {};
            allDataMap[Name_Installed_Product].Device_SN = Device_SN;
            allDataMap[Name_Installed_Product].System_REF = System_REF;
        });

        umsData.forEach((row) => {
            const { Name_Installed_Product, Device_SN, Material_Number } = row;
            if (!allDataMap[Name_Installed_Product]) allDataMap[Name_Installed_Product] = {};
            allDataMap[Name_Installed_Product].Device_SN = Device_SN;
            allDataMap[Name_Installed_Product].Material_Number = Material_Number;
        });

        // Update ONBOARDING and UMS data with consistent new values
        onboardingData.forEach((row) => {
            const { Name_Installed_Product, Device_SN, System_REF } = row;
            row.Device_SN = getOrCreateReplacement(allDataMap[Name_Installed_Product].Device_SN, deviceSNMap, generateDeviceSN);
            row.System_REF = getOrCreateReplacement(allDataMap[Name_Installed_Product].System_REF, systemRefMap, getReplacementValue);
        });

        umsData.forEach((row) => {
            const { Name_Installed_Product, Device_SN, Material_Number } = row;
            row.Device_SN = getOrCreateReplacement(allDataMap[Name_Installed_Product].Device_SN, deviceSNMap, generateDeviceSN);
            row.Material_Number = getOrCreateReplacement(allDataMap[Name_Installed_Product].Material_Number, materialNumberMap, getReplacementValue);
        });

        // Write the modified data back to the CSV files
        await writeCSV(onboardingFilePath, onboardingData);
        await writeCSV(umsFilePath, umsData);

        console.log("Files updated successfully with consistent replacements!");
    } catch (error) {
        console.error("Error processing files:", error);
    }
})();




//set system_REF, device_SN, material_Number