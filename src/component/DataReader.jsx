import React, { useEffect, useState } from 'react';

const DataReader = () => {
  const [csvData, setCsvData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [filterDate, setFilterDate] = useState(''); // State for date filter

  useEffect(() => {
    // Fetch CSV file from the public folder
    fetch('/datasheet.csv') // Assuming the file is in the public directory
      .then(response => response.text())
      .then(csvText => {
        const jsonData = csvToJson(csvText); // Convert CSV to JSON format
        setCsvData(jsonData); // Set the parsed data in the state
      })
      .catch(error => {
        console.error('Error fetching the CSV file:', error);
      });
  }, []);

  // Function to convert CSV to JSON format
  const csvToJson = (csv) => {
    const lines = csv.split('\n');
    const headers = lines[0].split(','); // Get the headers from the first line

    const result = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};

      headers.forEach((header, index) => {
        // Ensure the value exists before trimming it
        obj[header.trim()] = values[index] ? values[index].trim() : ''; // Use empty string if undefined
      });

      return obj;
    });

    return result;
  };

  // Helper function to check if a date string is valid
  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()); // Check if date is valid
  };

  // Filter the CSV data based on search term and date
  const filteredData = csvData.filter(row => {
    // Check if the row matches the search term
    const matchesSearch = Object.values(row).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if the row matches the date filter
    const rowDate = row.DateOfApplication;
    const matchesDate = filterDate
      ? isValidDate(rowDate) && new Date(rowDate).toISOString().split('T')[0] === filterDate
      : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div>
      <h1>CSV Data in Table</h1>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      {/* Date filter input */}
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        style={{ marginLeft: '20px', marginBottom: '20px' }}
      />

      {filteredData.length > 0 ? (
        <table border="1" style={{ marginTop: '20px' }}>
          <thead>
            <tr>
              {/* Dynamically render headers from the first object keys */}
              {Object.keys(filteredData[0]).map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Render the filtered rows */}
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No matching data found...</p>
      )}
    </div>
  );
};

export default DataReader;
