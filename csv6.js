const fs = require('fs');
const csvParser = require('csv-parser');
const fastcsv = require('fast-csv');

// Random modalities to assign
const modalities = ['NdYAG', 'ResurFX', 'QSwitch', 'IPL', 'OPT', 'TrueSpot', 'Incisional', 'CPG', 'DeepFX', 'Test'];

// Function to randomize modality
const randomizeModality = () => {
    const index = Math.floor(Math.random() * modalities.length);
    return modalities[index];
};

// Material to family mapping
const materialToFamily = {
    "GA-0000070BE": "Acupulse",
    "GA-0000070BEGR": "Acupulse",
    "GA-0000070CNBE": "Acupulse",
    "GA-0000070DEBE": "Acupulse",
    "GA-0000070GRBE": "Acupulse",
    "GA-0000070SH": "Acupulse",
    "GA-0000080BE": "Acupulse",
    "GA-0000080CN": "Acupulse",
    "GA-0000080CNBE": "Acupulse",
    "GA-0000110BE": "Acupulse",
    "GA-0000120BE": "Acupulse",
    "GA-0000120CNBE": "Acupulse",
    "GA-0000130BE": "Acupulse",
    "GA-0000130CNBE": "Acupulse",
    "GA-0000170BE": "Acupulse",
    "GA-0000170CNBE": "Acupulse",
    "GA-0000180BE": "Acupulse",
    "GA-0000180CNBE": "Acupulse",
    "GA-0000777BE": "Acupulse",
    "RG-0000070BE": "Acupulse",
    "RG-0000110BE": "Acupulse",
    "RG-0000120BE": "Acupulse",
    "RG-0000130BE": "Acupulse",
    "RG-0000180": "Acupulse",
    "RG-0000180BE": "Acupulse",
    "GA-0000070": "AcuPulse",
    "GA-0000070CN": "AcuPulse",
    "GA-0000070DE": "AcuPulse",
    "GA-0000070GR": "AcuPulse",
    "GA-0000080": "AcuPulse",
    "GA-0000110": "AcuPulse",
    "GA-0000120": "AcuPulse",
    "GA-0000120CN": "AcuPulse",
    "GA-0000130": "AcuPulse",
    "GA-0000130CN": "AcuPulse",
    "GA-0000170": "AcuPulse",
    "GA-0000170CN": "AcuPulse",
    "GA-0000180": "AcuPulse",
    "GA-0000180CN": "AcuPulse",
    "GA-0000777": "AcuPulse",
    "RG-0000070": "AcuPulse",
    "RG-0000110": "AcuPulse",
    "RG-0000120": "AcuPulse",
    "RG-0000130": "AcuPulse",
    "GA-5200000": "NuEra Tight",
    "GA-5200000US": "NuEra Tight",
    "GA-5200000BE": "NuEra Tight",
    "GA-5200000USBE": "NuEra Tight",
    "GA-5200000W": "NuEra Tight",
    "GA-5200000WBE": "NuEra Tight",
    "GA-5200000WUS": "NuEra Tight",
    "GA-5200000WUSBE": "NuEra Tight",
    "GA-520000WUS": "NuEra Tight",
    "GA-520000WUSBE": "NuEra Tight",
    "30020000BE": "Legend Pro",
    "30020000UBE": "Legend Pro",
    "30020000": "Legend Pro",
    "30020000U": "Legend Pro",
    "GASB00000": "LightSheer Duet",
    "GASB00000CN": "LightSheer Duet",
    "GASB00000DE": "LightSheer Duet",
    "GASB00000GR": "LightSheer Duet",
    "GASB00001": "LightSheer Duet",
    "GASB00002": "LightSheer Duet",
    "GASB00002CN": "LightSheer Duet",
    "RGASB0000": "LightSheer Duet",
    "RGASB00000": "LightSheer Duet",
    "GASB00000BE": "LightSheer Duet",
    "GASB00000CNBE": "LightSheer Duet",
    "GASB00000DEBE": "LightSheer Duet",
    "GASB00000GRBE": "LightSheer Duet",
    "GASB00001BE": "LightSheer Duet",
    "GASB00002BE": "LightSheer Duet",
    "GASB00002CNBE": "LightSheer Duet",
    "RGASB00000BE": "LightSheer Duet",
    "RGASB0000BE": "LightSheer Duet",
    "0642-403-01BE": "UltraPulse",
    "0642-404-01BE": "UltraPulse",
    "0642-407-01BE": "UltraPulse",
    "0642-408-01BE": "UltraPulse",
    "0642-409-01BE": "UltraPulse",
    "0642-409-01-CN": "UltraPulse",
    "0642-409-01-CNBE": "UltraPulse",
    "0642-409-01DE": "UltraPulse",
    "0642-409-01DEBE": "UltraPulse",
    "0642-409-01GR": "UltraPulse",
    "0642-409-01GRBE": "UltraPulse",
    "0642-410-01BE": "UltraPulse",
    "0642-413-01BE": "UltraPulse",
    "0642-415-01BE": "UltraPulse",
    "0642-627-01BE": "UltraPulse",
    "0642-628-01": "UltraPulse",
    "0642-628-01BE": "UltraPulse",
    "0642-629-01BE": "UltraPulse",
    "GA-0000430BE": "UltraPulse",
    "GA-0000440BE": "UltraPulse",
    "GA-0000460BE": "UltraPulse",
    "GA-0000460CNBE": "UltraPulse",
    "GA-0000470BE": "UltraPulse",
    "GA-0000470CNBE": "UltraPulse",
    "GA-0000480BE": "UltraPulse",
    "GA-0000480CNBE": "UltraPulse",
    "GA-0000530BE": "UltraPulse",
    "GA-0000540BE": "UltraPulse",
    "GA-0000550BE": "UltraPulse",
    "GA-0000550DE": "UltraPulse",
    "GA-0000550DEBE": "UltraPulse",
    "GA-0000550GRBE": "UltraPulse",
    "GA-0000560BE": "UltraPulse",
    "GA-0000560CNBE": "UltraPulse",
    "GA-0000560DE": "UltraPulse",
    "GA-0000560DEBE": "UltraPulse",
    "GA-0000560GRBE": "UltraPulse",
    "GA-0000570BE": "UltraPulse",
    "RG-0000470BE": "UltraPulse",
    "RG-0000560BE": "UltraPulse",
    "RGA-0000470BE": "UltraPulse",
    "RGA-0000560BE": "UltraPulse",
    "0642-403-01": "UltraPulse",
    "0642-404-01": "UltraPulse",
    "0642-407-01": "UltraPulse",
    "0642-408-01": "UltraPulse",
    "0642-409-01": "UltraPulse",
    "0642-410-01": "UltraPulse",
    "0642-413-01": "UltraPulse",
    "0642-415-01": "UltraPulse",
    "0642-627-01": "UltraPulse",
    "0642-629-01": "UltraPulse",
    "GA-0000430": "UltraPulse",
    "GA-0000440": "UltraPulse",
    "GA-0000460": "UltraPulse",
    "GA-0000460CN": "UltraPulse",
    "GA-0000470": "UltraPulse",
    "GA-0000470CN": "UltraPulse",
    "GA-0000480": "UltraPulse",
    "GA-0000480CN": "UltraPulse",
    "GA-0000530": "UltraPulse",
    "GA-0000540": "UltraPulse",
    "GA-0000550": "UltraPulse",
    "GA-0000550GR": "UltraPulse",
    "GA-0000560": "UltraPulse",
    "GA-0000560CN": "UltraPulse",
    "GA-0000560GR": "UltraPulse",
    "GA-0000570": "UltraPulse",
    "RG-0000470": "UltraPulse",
    "RG-0000560": "UltraPulse",
    "RGA-0000470": "UltraPulse",
    "RGA-0000560": "UltraPulse",
    "GA-0006200": "Stellar M22",
    "GA-0006200JP": "Stellar M22",
    "GA-0006200LMX": "Stellar M22",
    "GA-0006200BE": "Stellar M22",
    "GA-0006200CN": "Stellar M22",
    "GA-0006200DE": "Stellar M22",
    "GA-0006200DEBE": "Stellar M22",
    "GA-0006200GR": "Stellar M22",
    "GA-0006200GRBE": "Stellar M22",
    "GA-0006200LMXGR": "Stellar M22",
    "GA-0006400BE": "Stellar M22",
    "GA-0006400": "Stellar M22",
    "GA-0006200LMXBE": "Stellar M22",
    "35000020AS": "Geneo",
    "35000020ASBE": "Geneo",
    "35000020BE": "Geneo",
    "35000020UBE": "Geneo",
    "35000020": "Geneo",
    "35000020U": "Geneo",
    "GA-5000000BE": "Splendor X",
    "GA-5000019": "Splendor X",
    "GA-5000019BE": "Splendor X",
    "GA-5100000BE": "Splendor X",
    "GA-5000000": "Splendor X",
    "GA-5100000": "Splendor X",
    "30020000BK": "triLift",
    "30020000BKBE": "triLift",
    "35000300U": "Geneo X",
    "35000300": "Geneo X",
    "35000300BE": "Geneo X",
    "35000300UBE": "Geneo X",
    "GA-0005200BE": "M22",
    "GA-0005200CNBE": "M22",
    "GA-0005200DEBE": "M22",
    "GA-0005200GRBE": "M22",
    "GA-0005200JPBE": "M22",
    "GA-0005200SH": "M22",
    "GA-0005201CNBE": "M22",
    "GA-0005201DE": "M22",
    "GA-0005201DEBE": "M22",
    "GA-0005201SH": "M22",
    "GA-0005300BE": "M22",
    "RG-0005200BE": "M22",
    "GA-0005200": "M22",
    "GA-0005200CN": "M22",
    "GA-0005200DE": "M22",
    "GA-0005200GR": "M22",
    "GA-0005200JP": "M22",
    "GA-0005201CN": "M22",
    "GA-0005300": "M22",
    "RG-0005200": "M22",
    "GA-2000011": "ULTRApulse Alpha",
    "GA-2000021": "ULTRApulse Alpha",
    "GA-0005500AESBE": "Optilight",
    "GA-0005500BE": "Optilight",
    "GA-0005500DIG": "Optilight",
    "GA-0005500DIGAESBE": "Optilight",
    "GA-0005500DIGBE": "Optilight",
    "GA-0005500DIGDE": "Optilight",
    "GA-0005500DIGDEBE": "Optilight",
    "GA-0005500DIGGR": "Optilight",
    "GA-0005500DIGGRBE": "Optilight",
    "GA-0005500JP": "Optilight",
    "GA-0005500JPBE": "Optilight",
    "GA-0006200VNLBE": "Optilight",
    "GA-0005500": "OptiLight",
    "GA-0005500AES": "OptiLight",
    "GA-0005500DIGAES": "OptiLight",
    "GA-0006200VNL": "OptiLight",
    "GA-1170000BE": "LightSheer DESIRE",
    "GA-1170000CNBE": "LightSheer DESIRE",
    "GA-1170000DEBE": "LightSheer DESIRE",
    "GA-1170000GRBE": "LightSheer DESIRE",
    "GA-1170000USBE": "LightSheer DESIRE",
    "RG-1170000BE": "LightSheer DESIRE",
    "RG-1170000": "LightSheer DESIRE",
    "GA-1170000CN": "LightSheer DESIRE",
    "GA-1170000DE": "LightSheer DESIRE",
    "GA-1170000GR": "LightSheer DESIRE",
    "GA-1170000US": "LightSheer DESIRE",
    "GA-1170000": "LightSheer DESIRE",
    "GA-1200000BE": "Desire Light",
    "GA-1200000DEBE": "Desire Light",
    "GA-1200000GRBE": "Desire Light",
    "GA-1200000": "Desire Light",
    "GA-1200000DE": "Desire Light",
    "GA-1200000GR": "Desire Light",
    "GA-1140000DE": "LightSheer QUATTRO",
    "GA-1140000DEBE": "LightSheer QUATTRO",
    "GA-1140000GR": "LightSheer QUATTRO",
    "GA-1140000GRBE": "LightSheer QUATTRO",
    "GA-1140000JPBE": "LightSheer QUATTRO",
    "GA-1140000": "LightSheer QUATTRO",
    "GA-1140000JP": "LightSheer QUATTRO",
    "GA-1140000BE": "LightSheer QUATTRO",
    "GA-1160000BE": "Quattro Beauty",
    "GA-1160000": "Quattro Beauty",
    "GA-3000001": "FoLix",
    "GA-6200000US": "OptiPLUS",
    "AT-TEST000": "AUTOTEST",
    "GA-4000080": "PiQo4",
    "GA-4000081": "PiQo4",
    "RGA-4000081": "PiQo4",
    "GA-4000000": "PiQo4",
    "GA-4000001": "PiQo4",
    "RGA-4000001": "PiQo4",
    "GA-4000070": "PiQo4",
    "GA-4000071": "PiQo4",
    "RGA-4000071": "PiQo4",
    "GA-4000071CE": "PiQo4",
    "RGA-4000071CE": "PiQo4",
    "GA-4000090": "PiQo4",
    "GA-4000091": "PiQo4",
    "RGA-4000091": "PiQo4",
    "GA-4000070CE": "PiQo4",
    "RGA-4000080": "PiQo4",
    "GA-4300001": "PiQo4",
    "RGA-4000000": "PiQo4",
    "RGA-4000070": "PiQo4",
    "GA-3000090CE": "PiQo4",
    "RGA-4000090": "PiQo4"
};


// Function to generate a new unique contract number
let contractNumCounter = 1;
const generateContractNum = () => `AutoGenContractNum${contractNumCounter++}`;

// Function to generate a new unique child material description
let childMatDescCounter = 1;
const generateChildMatDesc = () => `AutoGenChildMatDesc${childMatDescCounter++}`;

// Function to generate a new unique child material number
let childMatNumCounter = 1;
const generateChildMatNum = () => `AutoGenChildMatNumb${childMatNumCounter++}`;

// Function to process each row
const processCSV = (inputFile, outputFile) => {
    const rows = [];
    const modalityMap = new Map();
    const contractNumMap = new Map();
    const childMatDescMap = new Map();
    const childMatNumMap = new Map();

    // Read the CSV
    fs.createReadStream(inputFile)
        .pipe(csvParser())
        .on('data', (row) => {
            // Handle Modality_REF: Randomize with unique values
            if (row.Modality_REF) {
                if (!modalityMap.has(row.Modality_REF)) {
                    modalityMap.set(row.Modality_REF, randomizeModality());
                }
                row.Modality_REF = modalityMap.get(row.Modality_REF);
            }

            // Handle Contract_Number: Unique auto-generated numbers
            if (row.Contract_Number) {
                if (!contractNumMap.has(row.Contract_Number)) {
                    contractNumMap.set(row.Contract_Number, generateContractNum());
                }
                row.Contract_Number = contractNumMap.get(row.Contract_Number);
            }

            // Handle Child_Material_Description: Unique auto-generated descriptions
            if (row.Child_Material_Description) {
                if (!childMatDescMap.has(row.Child_Material_Description)) {
                    childMatDescMap.set(row.Child_Material_Description, generateChildMatDesc());
                }
                row.Child_Material_Description = childMatDescMap.get(row.Child_Material_Description);
            }

            // Handle Child_Material_Number: Unique auto-generated numbers
            if (row.Child_Material_Number) {
                if (!childMatNumMap.has(row.Child_Material_Number)) {
                    childMatNumMap.set(row.Child_Material_Number, generateChildMatNum());
                }
                row.Child_Material_Number = childMatNumMap.get(row.Child_Material_Number);
            }

            // Handle Item_Material_Family: Based on Material_Number
            if (row.Material_Number && materialToFamily[row.Material_Number]) {
                row.Item_Material_Family = materialToFamily[row.Material_Number];
            }

            // Push processed row
            rows.push(row);
        })
        .on('end', () => {
            // Write processed rows back to a new CSV file
            const ws = fs.createWriteStream(outputFile);
            fastcsv
                .write(rows, { headers: true })
                .pipe(ws)
                .on('finish', () => {
                    console.log('spojeniii material numbersss!');
                });
        });
};

// Call the processCSV function
processCSV('Modified_UMS_NG.csv', 'Modified_UMS_NG.csv');
