const fs = require('fs');
const csv = require('csv-parser');

function modifyUMSFile(inputFile, outputFile) {
  const results = [];

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (row) => {
      // Modify Name_Installed_Product if it's not empty and both Material_Number and Device_SN are present
      if (row['Name_Installed_Product'] && row['Material_Number'] && row['Device_SN']) {
        row['Name_Installed_Product'] = `${row['Material_Number']}:${row['Device_SN']}`;
      }
      results.push(row);
    })
    .on('end', () => {
      writeCSV(outputFile, results);
      console.log(`gotov installed product name, opaaa`);
    });
}

function writeCSV(outputFile, data) {
  const header = Object.keys(data[0]);
  const rows = data.map((row) => header.map((field) => row[field]).join(',')).join('\n');

  fs.writeFileSync(outputFile, header.join(',') + '\n' + rows);
}

// Usage
modifyUMSFile('Modified_UMS_NG.csv', 'Modified_UMS_NG.csv');


//name installed product name set for UMS