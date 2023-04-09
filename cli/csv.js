import { parse } from 'csv-parse'
const fs = require('fs')
const createCsvWriter = require('csv-writer').createArrayCsvWriter

/**
 * Read data from CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} - A promise that resolves to an array of objects representing rows in the CSV file
 */
export async function readFromCsv (filePath) {
  try {
    if (!fs.existsSync(filePath)) return []
    return new Promise((resolve, reject) => {
      const csvData = []
      fs.createReadStream(filePath)
        .pipe(parse({ delimiter: ',' }))
        .on('data', function (row) {
          csvData.push(row)
        })
        .on('end', function () {
          resolve(csvData)
        })
    })
  } catch (err) {
    return []
  }
}

/**
 * Append data to a CSV file
 * @param {string} filePath - Path to CSV file
 * @param {Array} data - Data to be appended to the CSV file
 * @returns {Promise<void>} - A promise that resolves when data has been written to the CSV file
 */
export async function appendToCsv (filePath, data) {
  const rows = await readFromCsv(filePath).catch(() => [])
  const csvWriter = createCsvWriter({ path: filePath })
  const newData = [...rows, ...data]
  return csvWriter.writeRecords(newData)
}
