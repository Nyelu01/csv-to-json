const xlsx = require('xlsx');
const fs = require('fs');

// Function to convert Excel to CSV
function convertExcelToCsv(excelFilePath, sheetName, outputCsvFilePath) {
    try {
        // Read the Excel file
        const workbook = xlsx.readFile(excelFilePath);

        // Get the specified sheet or the first sheet if no sheet name is provided
        const sheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];

        if (!sheet) {
            console.error('Sheet not found!');
            return;
        }

        // Convert sheet data to CSV
        const csvData = xlsx.utils.sheet_to_csv(sheet);

        // Write the CSV data to a file
        fs.writeFileSync(outputCsvFilePath, csvData);
        console.log(`CSV file saved to ${outputCsvFilePath}`);
    } catch (error) {
        console.error('Error during conversion:', error.message);
    }
}

// Usage
const excelFilePath = 'data.xlsx'; // Path to your Excel file
const outputCsvFilePath = 'data.csv'; // Desired output CSV file path
const sheetName = 'Sheet1'; // Name of the sheet to convert (optional)

convertExcelToCsv(excelFilePath, sheetName, outputCsvFilePath);
