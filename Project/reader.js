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
const jsonObjects = jsonCells.map(cell => JSON.parse(cell.v));

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
XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet3');
XLSX.writeFile(newWorkbook, 'output.xlsx');
