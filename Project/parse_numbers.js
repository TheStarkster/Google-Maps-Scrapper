const XLSX = require('xlsx');
const workbook = XLSX.readFile('data.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonColumn = 'A'; // the column with JSON objects

// get the range of cells with JSON objects
const range = XLSX.utils.decode_range(worksheet['!ref']);
const jsonCells = [];
for (let row = range.s.r; row <= range.e.r; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: XLSX.utils.decode_col(jsonColumn) });
    if (worksheet[cellAddress]) {
        jsonCells.push(worksheet[cellAddress]);
    }
}

// parse the JSON objects
const jsonObjects = jsonCells.map(cell => {
    const _parsedJSON = JSON.parse(cell.v)
    if (_parsedJSON.description) {
        const data = _parsedJSON.description;
        const regex = /(\d{5} ?\d{5}|\d{6} ?\d{4}|\d{7} ?\d{5}|\d{8} ?\d{4}|\d{9} ?\d{3}|\d{10} ?\d{2}|\d{3} ?\d{3} ?\d{4})/g;
        const phoneNumbers = data.match(regex);
        // if(phoneNumbers != null) {
        //     console.log(phoneNumbers[0].replace(/\s/g, ""));
        // } else {
        //     // console.log(data);
        // }
        return {
            ..._parsedJSON,
            phone: phoneNumbers == null ? "N/A" : phoneNumbers[0].replace(/\s/g, "")
        }
    } else {
        return {
            ..._parsedJSON,
            phone: "N/A"
        }
    }
});

// get the keys of all JSON objects
const allKeys = jsonObjects.reduce((keys, obj) => {
    Object.keys(obj).forEach(key => {
        if (!keys.includes(key)) {
            keys.push(key);
        }
    });
    return keys;
}, []);

// create a new workbook with columns matching the object keys
const newWorkbook = XLSX.utils.book_new();
const newWorksheet = XLSX.utils.json_to_sheet(jsonObjects, { header: allKeys });
XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet4');
XLSX.writeFile(newWorkbook, 'output.xlsx');