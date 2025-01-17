const fs = require('fs');
const xlsx = require('xlsx');

/**
 * Processes an Excel file to extract all data and convert it into a nested JSON structure.
 * @param {string} filePath - The path to the input Excel file.
 * @param {function} callback - A callback function to execute with the processed result.
 */
function processExcelFile(filePath, callback) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use the first sheet
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const result = {};

    sheetData.forEach((row) => {
        const {
            RegionId,
            Region,
            DistrictId,
            District,
            CouncilId,
            Council,
            WardId,
            Ward,
            postcode,
            StreetId,
            Street,
        } = row;

        // Initialize the region if not already done
        if (!result[RegionId]) {
            result[RegionId] = {
                id: parseInt(RegionId, 10),
                name: Region,
                districts: [],
            };
        }

        const region = result[RegionId];

        // Find or add the district
        let district = region.districts.find((d) => d.id === parseInt(DistrictId, 10));
        if (!district) {
            district = {
                id: parseInt(DistrictId, 10),
                name: District,
                councils: [],
            };
            region.districts.push(district);
        }

        // Find or add the council
        let council = district.councils.find((c) => c.id === parseInt(CouncilId, 10));
        if (!council) {
            council = {
                id: parseInt(CouncilId, 10),
                name: Council,
                wards: [],
            };
            district.councils.push(council);
        }

        // Find or add the ward
        let ward = council.wards.find((w) => w.id === parseInt(WardId, 10));
        if (!ward) {
            ward = {
                id: parseInt(WardId, 10),
                name: Ward,
                postcode: postcode,
                streets: [],
            };
            council.wards.push(ward);
        }

        // Add the street to the ward if it doesn't already exist
        if (!ward.streets.some((s) => s.id === parseInt(StreetId, 10))) {
            ward.streets.push({
                id: parseInt(StreetId, 10),
                name: Street,
            });
        }
    });

    // The result now contains nested regions, districts, councils, wards, and streets
    const finalResult = Object.values(result).map((region) => ({
        id: region.id,
        name: region.name,
        districts: region.districts.map((district) => ({
            id: district.id,
            name: district.name,
            councils: district.councils.map((council) => ({
                id: council.id,
                name: council.name,
                wards: council.wards.map((ward) => ({
                    id: ward.id,
                    name: ward.name,
                    postcode: ward.postcode,
                    streets: ward.streets.map((street) => ({
                        id: street.id,
                        name: street.name,
                    })),
                })),
            })),
        })),
    }));

    callback(finalResult);
}

/**
 * Converts a JavaScript object to JSON and writes it to a file.
 * @param {Object} data - The data to write to the file.
 * @param {string} outputFilePath - The path to the output JSON file.
 */
function saveAsJson(data, outputFilePath) {
    try {
        fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
        console.log(`Nested JSON saved to ${outputFilePath}`);
    } catch (err) {
        console.error(`Error saving JSON to file: ${err.message}`);
    }
}

// Main script
const inputFilePath = 'data.xlsx'; // Path to the input Excel file
const outputFilePath = 'nested_data.json'; // Path to the output JSON file

processExcelFile(inputFilePath, (nestedData) => {
    saveAsJson(nestedData, outputFilePath);
});
