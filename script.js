// Dark mode toggle
const darkModeToggle = document.getElementById('darkModeToggle');
let graphColor = '#198754';
let labelsColor = 'grey';

darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', darkModeToggle.checked);
  document.getElementById('bootTable').classList.toggle('table-dark', darkModeToggle.checked);
  if (graphColor === '#0d6efd') {
    graphColor = '#198754';
    labelsColor = 'grey';
  } else if (graphColor === '#198754') {
    graphColor = '#0d6efd';
    labelsColor = 'white';
  }
  updateChart();
});

// Elements
const resultText = document.getElementById('resultText');
const startResultText= document.getElementById('startResultText');
const endResultText= document.getElementById('endResultText');
const rateSelect1 = document.getElementById('rateSelect1');
const rateSelect2 = document.getElementById('rateSelect2');

// Global variable to store the fetched data
let ratesData = null;

// Function to fetch latest rates from the API
const fetchRates = async () => {
    try {
      if (!ratesData) {
        const apiUrl = 'http://localhost:3002/proxy/latest';
        const response = await fetch(apiUrl);
        let eurPos = 0;
        let usdPos = 0;
        ratesData = await response.json();

        if (ratesData.latestRates && Array.isArray(ratesData.latestRates)) {
          ratesData.latestRates.forEach((rate, index) => {
            const country = rate.country;
            const currency = rate.currency;
            let iso = rate.isoCode;
            const eurRate = rate.eurRate;

            // Store position of EUR and USD (Default dropdown)
            if (iso === "EUR") {
              eurPos = index;
            } else if (iso === "USD") {
              usdPos = index;
            }

            // Add options to both Dropdown select
            const option1 = document.createElement('option');
            option1.value = eurRate;
            option1.setAttribute('data-timeframe', rate.referenceDate);
            option1.innerHTML = `(${iso}) ${country} - ${currency}`;
            rateSelect1.add(option1);

            const option2 = document.createElement('option');
            option2.value = eurRate;
            option2.setAttribute('data-timeframe', rate.referenceDate);
            option2.innerHTML = `(${iso}) ${country} - ${currency}`;
            rateSelect2.add(option2);
          });
        } else {
          console.error('Invalid data format received from the server.');
        }

        // Set EUR/USD as first selection (Default dropdown)
        var dropdown1 = document.getElementById("rateSelect1");
        var dropdown2 = document.getElementById("rateSelect2");
        dropdown1.selectedIndex = eurPos;
        dropdown2.selectedIndex = usdPos;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
};

// Function to fetch history data from API
const fetchHistory = async (ico) => {
    try {
      // Calculate the start and end dates for the last 12 months
      const currentDate = new Date();
      const endMonth = currentDate.getMonth() + 1;
      const endYear = currentDate.getFullYear();
      const startMonth = endMonth > 11 ? endMonth - 11 : 12 + endMonth - 11;
      const startYear = endMonth > 11 ? endYear : endYear - 1;
      
      // Get history data of selected currency against EUR
      const baseCurrencyIsoCode = ico;
      const currencyIsoCode = 'EUR';
      const lang = 'it';
      const apiUrl = `http://localhost:3002/proxy/history?startMonth=${startMonth}&startYear=${startYear}&endMonth=${endMonth}&endYear=${endYear}&baseCurrencyIsoCode=${baseCurrencyIsoCode}&currencyIsoCode=${currencyIsoCode}&lang=${lang}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const historyData = await response.json();
  
      // Return the History Data
      return historyData;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      // Handle the error
    }
  };
  

// Call the fetchRates function when the script is executed
fetchRates();

// Function to set initial placeholders for input fields
const setInitialPlaceholders = () => {
    const numericInput1 = document.getElementById('numericInput1');
    const numericInput2 = document.getElementById('numericInput2');
    numericInput1.placeholder = "Digita un numero";
    numericInput2.placeholder = "";
};

// Call the setInitialPlaceholders function when the script is executed
setInitialPlaceholders();

// Update results function (MAIN UPDATE)
  const updateResult = (lastModifiedFieldId) => {

    // Get selected numeric value 1 and related info
    const numericInput1 = parseFloat(document.getElementById('numericInput1').value) || 0;
    const selectedRateValue1 = parseFloat(rateSelect1.value) || 1;
    const selectedOptionText1 = rateSelect1.options[rateSelect1.selectedIndex].text.match(/\(([^)]+)\)/)[1];
    const selectedOptionName1 = rateSelect1.options[rateSelect1.selectedIndex].text.split('-')[1]?.trim() || '';
    const referenceDate1 = rateSelect1.options[rateSelect1.selectedIndex].getAttribute('data-timeframe');
    
    // Get selected numeric value 1 and related info
    const numericInput2 = parseFloat(document.getElementById('numericInput2').value) || 0;
    const selectedRateValue2 = parseFloat(rateSelect2.value) || 1;
    const selectedOptionText2 = rateSelect2.options[rateSelect2.selectedIndex].text.match(/\(([^)]+)\)/)[1];
    const selectedOptionName2 = rateSelect1.options[rateSelect2.selectedIndex].text.split('-')[1]?.trim() || '';
    const referenceDate2 = rateSelect1.options[rateSelect2.selectedIndex].getAttribute('data-timeframe');

    // Calc currency rates (1/2 and 2/1)
    const result1 = numericInput1 / selectedRateValue1 * selectedRateValue2;
    const result2 = numericInput2 / selectedRateValue2 * selectedRateValue1;

    // Set-up result text
    let resultTextContent = '';
    let startResultTextContent = '';
    let endResultTextContent = '';

    // Dynamically populate the first column of the Bootstrap table
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    // List of set conversion rates
    const valuesList = [1, 5, 10, 25, 50, 100, 500, 1000, 5000, 10000, 50000];
    // Table
    const tableDiv = document.getElementById('conversionTable');
    // Update the content of the first row in the Bootstrap table
    const tableHead1 = document.getElementById('tableHead1');
    const tableHead2 = document.getElementById('tableHead2');
  
    // Check last modified input or select and update
    if (lastModifiedFieldId === 'numericInput1') {
        const input = numericInput1;
        const result = result1; // Set corrent currency rate (previously calc)
        currRate = result / input;
        startResultTextContent = `${input.toFixed(2).replace(/\.?0+$/, '')} ${selectedOptionName1} uguale a`;
        endResultTextContent = `${result.toFixed(2).replace(/\.?0+$/, '')} ${selectedOptionName2} `;
        
        // Populate table header
        tableHead1.textContent = selectedOptionText1;
        tableHead2.textContent = selectedOptionText2;

        // Populate graph
        updateGraph(selectedOptionText2,selectedOptionText1);

        if (!isNaN(currRate)) {
        resultTextContent = `Tasso di cambio ${currRate.toFixed(4).replace(/\.?0+$/, '')} ${selectedOptionText1}/${selectedOptionText2} al ${referenceDate2}`;
        
        // Generate table
        valuesList.forEach(value => {
        const row = document.createElement('tr');
    
        // Populate the first column
        const cell = document.createElement('td');
        cell.textContent = `${value} ${selectedOptionText1}`;
        row.appendChild(cell);
    
        // Populate the second column
        const resultCell = document.createElement('td');
        const tableCount = value * currRate;
        resultCell.textContent = `${tableCount.toFixed(4).replace(/\.?0+$/, '')} ${selectedOptionText2}`;
        row.appendChild(resultCell);
    
        // Fill row
        tableBody.appendChild(row);

        // Hide if empty
        tableDiv.style.visibility = "visible";
        });
        }  else {
        tableDiv.style.visibility = "hidden";
        }

    } else if (lastModifiedFieldId === 'numericInput2') {
        const input = numericInput2;
        const result = result2;
        currRate = result / input;
        startResultTextContent = `${input.toFixed(2).replace(/\.?0+$/, '')} ${selectedOptionName2} uguale a`;
        endResultTextContent = `${result.toFixed(2).replace(/\.?0+$/, '')} ${selectedOptionName1} `;
       
        // Populate table header
        tableHead1.textContent = selectedOptionText2;
        tableHead2.textContent = selectedOptionText1;

        // Populate graph
        updateGraph(selectedOptionText1,selectedOptionText2);
    
        if (!isNaN(currRate)) {
        resultTextContent = `Tasso di cambio ${currRate.toFixed(4).replace(/\.?0+$/, '')} ${selectedOptionText2}/${selectedOptionText1} al ${referenceDate1}`;

        valuesList.forEach(value => {
        const row = document.createElement('tr');
    
        // Populate the first column
        const cell = document.createElement('td');
        cell.textContent = `${value} ${selectedOptionText2}`;
        row.appendChild(cell);
    
        // Populate the second column
        const resultCell = document.createElement('td');
        const tableCount = value * currRate;
        resultCell.textContent = `${tableCount.toFixed(4).replace(/\.?0+$/, '')} ${selectedOptionText1}`;
        row.appendChild(resultCell);
    
        // Fill row
        tableBody.appendChild(row);
         // Hide if empty
         tableDiv.style.visibility = "visible";
        });
        }  else {
        tableDiv.style.visibility = "hidden";
        }
    }

    // Update result text
    resultText.textContent = resultTextContent; // Currency rate with updated date time
    startResultText.textContent = startResultTextContent; // A EUR is equal to...
    endResultText.textContent = endResultTextContent; // ... B USD

    const numericInput1Element = document.getElementById('numericInput1');
    const numericInput2Element = document.getElementById('numericInput2');
    
    // Update the other input value dynamically 
    if (lastModifiedFieldId === 'numericInput1') {
    numericInput2Element.value = result1.toFixed(2).replace(/\.?0+$/, '');
    } else if (lastModifiedFieldId === 'numericInput2') {
    numericInput1Element.value = result2.toFixed(2).replace(/\.?0+$/, '');
    }
};

// Listen for the input event on the numeric input fields
document.getElementById('numericInput1').addEventListener('input', () => updateResult('numericInput1'));
document.getElementById('numericInput2').addEventListener('input', () => updateResult('numericInput2'));

// Listen for the change event on the rate dropdown menus
rateSelect1.addEventListener('change', () => updateResult('numericInput1'));
rateSelect2.addEventListener('change', () => updateResult('numericInput2'));

// Global variables to store graph data
let graphLabels = [];
let graphData = []
let graphName = "Valuta/Valuta";
let flagCode1 = "flag-icon-eu";
let flagCode2 = "flag-icon-us";
let lineChart; 

// Update Graph
const updateGraph = async (ico1, ico2) => {
    graphName = ico2 + "/" + ico1;
    try {
      if (ico1 == "EUR" ) { 
        const history = await fetchHistory(ico2);  // get history data 
        let rateList = [];
        let dateList = [];
        history.rates.forEach(rate => {
            const date = rate.referenceDate;
            const avgRate = rate.avgRate;
            rateList.push(avgRate);
            dateList.push(date);
        })
        
        const dividedNumbersAsString = rateList.map(num => (1 / parseFloat(num)).toFixed(4).replace(/\.?0+$/, ''));
        
        graphData = dividedNumbersAsString;
        graphLabels = dateList;

      } else if (ico2 == "EUR") {
        const history = await fetchHistory(ico1); // get history data 
        let rateList = [];
        let dateList = [];
        history.rates.forEach(rate => {
            const date = rate.referenceDate;
            const avgRate = rate.avgRate;
            rateList.push(avgRate);
            dateList.push(date);
          })
        graphData = rateList;
        graphLabels = dateList;

      } else {
        const firstHistory = await fetchHistory(ico1); // get history data vs. EUR
        const secondHistory = await fetchHistory(ico2); // get history data vs. EUR
        let rateList1 = [];
        let dateList1 = [];
        let rateList2 = [];
        let dateList2 = [];
  
        firstHistory.rates.forEach(rate => {
          const date = rate.referenceDate;
          const avgRate = rate.avgRate;
          rateList1.push(avgRate);
          dateList1.push(date);
        })
  
        secondHistory.rates.forEach(rate => {
          const date = rate.referenceDate;
          const avgRate = rate.avgRate;
          rateList2.push(avgRate);
          dateList2.push(date);
        })

        // Perform element-wise division (calc history given data vs. EUR)
        const divisionList = rateList1.map((value, index) => (value / rateList2[index]).toFixed(4).replace(/\.?0+$/, ''));
        graphData = divisionList;
        if (dateList1 = dateList2) {
           graphLabels = dateList1;
        }
      }

    } catch (error) {
      console.error('Error in exampleFunction:', error.message);
      // Handle the error
    }

    // Call a function to update the chart after the asynchronous operations
    updateChart();
    updateFlags(ico1, ico2);
  };

// Update Flags
const updateFlags = (ico1, ico2) => {
    // Get country codes from ICO codes (USD => US)
    let flagCode1 = ico1.slice(0, -1);
    let flagCode2 = ico2.slice(0, -1);

    let flag1 = document.getElementById('flag-icon-1');
    let flag2 = document.getElementById('flag-icon-2');

    // Get the current classes
    var currentClasses1 = flag1.classList;
    var currentClasses2 = flag2.classList;

    // Iterate through the classes and replace the existing one with the new one
    currentClasses1.forEach(function(className) {
      if (className.startsWith("fi-")) {
        flag1.classList.remove(className);
      }
    });

    currentClasses2.forEach(function(className) {
      if (className.startsWith("fi-")) {
        flag2.classList.remove(className);
      }
    });

   // Handle expections
    const excValues = ['xc', 'an', 'xo', 'xa', 'xd', 'xp'];
    
    if (excValues.includes(flagCode1.toLowerCase())) {
      flagCode1 = "xx"; // White flag with no symbols
    } 

    if (excValues.includes(flagCode2.toLowerCase())) {
      flagCode2 = "xx"; // White flag with no symbols
    } 

    // Add the new class
    flag1.classList.add("fi-" + flagCode1.toLowerCase());
    flag2.classList.add("fi-" + flagCode2.toLowerCase());
  }



// Function to update the chart with the latest data
const updateChart = () => {
  var chartData = {
    labels: graphLabels,
    datasets: [
      {
        label: graphName,
        data: graphData,
        borderColor: graphColor,
        labelsColor: labelsColor,
        borderWidth: 2,
        fill: 'origin', 
      },
    ],
  };

  // Get the canvas element
  var ctx = document.getElementById('lineChart').getContext('2d');

  // Create or update the line chart
  if (lineChart) {
    // If the chart already exists, update the data
    lineChart.data = chartData;
    lineChart.borderColor = graphColor; 
    lineChart.options.scales.x.ticks.color = labelsColor; // Set the color of x-axis labels
    lineChart.options.scales.y.ticks.color = labelsColor; // Set the color of y-axis labels
    lineChart.options.plugins.legend.labels.color = labelsColor; // Set the color of the dataset label
    lineChart.update();
  } else {
    // If the chart doesn't exist, create a new one
    lineChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'category',
            labels: chartData.labels,
            ticks: {
              color: labelsColor, 
            },
          },
          y: {
            ticks: {
              color: labelsColor, 
            },
          }
        },
        plugins: {
          legend: {
            labels: {
              color: labelsColor, 
            },
          },
        },
      },
    });
  }
}

// Launch first graph with EUR/USD default example
updateGraph("USD", "EUR");
