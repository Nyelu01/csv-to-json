const fs = require('fs');
const csv = require('csv-parser');

// Read and process the CSV file for a specific region
function processCsvFile(filePath, regionId, callback) {
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

            // Process only the specified region
            if (parseInt(region_id) !== regionId) return;

            // Find or create the region
            if (!result.id) {
                result.id = parseInt(region_id);
                result.name = region_name;
                result.districts = [];
            }

            // Find or create the district
            let district = result.districts.find(d => d.id === parseInt(district_id));
            if (!district) {
                district = {
                    id: parseInt(district_id),
                    name: district_name,
                    councils: []
                };
                result.districts.push(district);
            }

            // Find or create the council
            let council = district.councils.find(c => c.id === parseInt(council_id));
            if (!council) {
                council = {
                    id: parseInt(council_id),
                    name: council_name,
                    wards: []
                };
                district.councils.push(council);
            }

            // Find or create the ward
            let ward = council.wards.find(w => w.id === parseInt(ward_id));
            if (!ward) {
                ward = {
                    id: parseInt(ward_id),
                    name: ward_name,
                    postcode: parseInt(postcode),
                    streets: []
                };
                council.wards.push(ward);
            }

            // Add the street to the ward
            if (!ward.streets.find(s => s.id === parseInt(street_id))) {
                ward.streets.push({
                    id: parseInt(street_id),
                    name: street_name
                });
            }
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
const regionId = 88621; // Specify the region ID you want to process

try {
    processCsvFile(inputFilePath, regionId, (nestedData) => {
        saveAsJson(nestedData, outputFilePath);
    });
} catch (error) {
    console.error('Error processing the file:', error.message);
}
