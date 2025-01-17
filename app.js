const fs = require('fs');
const csv = require('csv-parser');

/**
 * Processes a CSV file to extract data for a specific region and convert it into a nested JSON structure.
 * @param {string} filePath - The path to the input CSV file.
 * @param {number} regionId - The ID of the region to process.
 * @param {function} callback - A callback function to execute with the processed result.
 */
function processCsvFile(filePath, regionId, callback) {
    const result = {};

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
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

            // Only process rows that match the specified region ID
            if (parseInt(RegionId, 10) !== regionId) return;

            // Initialize the region if not already done
            if (!result.id) {
                result.id = parseInt(RegionId, 10);
                result.name = Region;
                result.districts = [];
            }

            // Find or add the district
            let district = result.districts.find((d) => d.id === parseInt(DistrictId, 10));
            if (!district) {
                district = {
                    id: parseInt(DistrictId, 10),
                    name: District,
                    councils: [],
                };
                result.districts.push(district);
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
        })
        .on('end', () => {
            callback(result);
        })
        .on('error', (err) => {
            console.error(`Error reading the CSV file: ${err.message}`);
        });
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
const inputFilePath = 'data.csv'; // Path to the input CSV file
const outputFilePath = 'nested_data.json'; // Path to the output JSON file
const regionId = 70894; // ID of the region to process

processCsvFile(inputFilePath, regionId, (nestedData) => {
    saveAsJson(nestedData, outputFilePath);
});
