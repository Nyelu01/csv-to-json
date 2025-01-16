const fs = require('fs');
const csv = require('csv-parser');

// Read and process the CSV file
function processCsvFile(filePath, callback) {
    const result = {};

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const {
                region_id,
                region_name,
                district_id,
                district_name,
                council_id,
                council_name,
                ward_id,
                ward_name,
                postcode,
                street_id,
                street_name
            } = row;

            if (!result[region_id]) {
                result[region_id] = {
                    id: parseInt(region_id),
                    name: region_name,
                    districts: {}
                };
            }

            if (!result[region_id].districts[district_id]) {
                result[region_id].districts[district_id] = {
                    id: parseInt(district_id),
                    name: district_name,
                    councils: {}
                };
            }

            if (!result[region_id].districts[district_id].councils[council_id]) {
                result[region_id].districts[district_id].councils[council_id] = {
                    id: parseInt(council_id),
                    name: council_name,
                    wards: {}
                };
            }

            if (!result[region_id].districts[district_id].councils[council_id].wards[ward_id]) {
                result[region_id].districts[district_id].councils[council_id].wards[ward_id] = {
                    id: parseInt(ward_id),
                    name: ward_name,
                    postcode: parseInt(postcode),
                    streets: {}
                };
            }

            result[region_id].districts[district_id].councils[council_id].wards[ward_id].streets[street_id] = {
                id: parseInt(street_id),
                name: street_name
            };
        })
        .on('end', () => {
            callback(result);
        });
}

// Convert nested object to JSON and write to file
function saveAsJson(data, outputFilePath) {
    fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
    console.log(`Nested JSON saved to ${outputFilePath}`);
}

// Main execution
const inputFilePath = 'data.csv'; // Input CSV file
const outputFilePath = 'nested_data.json'; // Output JSON file

try {
    processCsvFile(inputFilePath, (nestedData) => {
        saveAsJson(nestedData, outputFilePath);
    });
} catch (error) {
    console.error('Error processing the file:', error.message);
}
