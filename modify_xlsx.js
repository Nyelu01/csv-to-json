const xlsx = require("xlsx");

function modifyCouncilNames(filePath, outputFilePath) {
  // Read the XLSX file
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
  const sheet = workbook.Sheets[sheetName];

  // Convert the sheet to JSON
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  // Modify the "Council" column
  const modifiedData = jsonData.map(row => {
    if (row.Council) {
      row.Council = row.Council.replace(/DISTRICT COUNCIL$/, "DC")
                               .replace(/TOWN COUNCIL$/, "TC")
                               .replace(/MUNICIPAL COUNCIL$/, "MC")
                               .replace(/CITY COUNCIL$/, "CC");
    }
    return row;
  });

  // Convert the modified data back to a sheet
  const newSheet = xlsx.utils.json_to_sheet(modifiedData);

  // Replace the original sheet in the workbook
  workbook.Sheets[sheetName] = newSheet;

  // Write the modified workbook to a new file
  xlsx.writeFile(workbook, outputFilePath);

  console.log("Council names updated successfully!");
}

// Example usage
const inputFilePath = "data.xlsx"; // Replace with your file path
const outputFilePath = "modified_data.xlsx"; // Replace with your desired output file path
modifyCouncilNames(inputFilePath, outputFilePath);
