const fs = require("fs");
const csvParser = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");

// Random value selection helper function
function getRandomValue(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Lists for random values
const titles = ["Ms.", "Miss", "Mrs.", "Mr.", "M.", "Dr.", "Prof.", "Test"];
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

// Input and output file paths
const inputFile = "Modified_USERS_NG.csv";
const outputFile = "Modified_USERS_NG.csv";

// Parse and process the CSV
const records = [];

fs.createReadStream(inputFile)
  .pipe(csvParser())
  .on("data", (row) => {
    // Modify fields
    if (row.Contact_title && row.Contact_title.trim() !== "") {
        row.Contact_title = getRandomValue(titles);
      }
      if (row.Position_in_clinic && row.Position_in_clinic.trim() !== "") {
        row.Position_in_clinic = getRandomValue(positionsInClinic);
      }
      if (row.Profession && row.Profession.trim() !== "") {
        row.Profession = getRandomValue(professions);
      }

    // Collect the modified row
    records.push(row);
  })
  .on("end", () => {
    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: outputFile,
      header: Object.keys(records[0]).map((key) => ({ id: key, title: key }))
    });

    // Write modified records to a new file
    csvWriter
      .writeRecords(records)
      .then(() => {
        console.log(`CSV file updated successfully: ${outputFile}`);
      })
      .catch((err) => {
        console.error("Error writing to CSV file:", err);
      });
  })
  .on("error", (err) => {
    console.error("Error reading the CSV file:", err);
  });
