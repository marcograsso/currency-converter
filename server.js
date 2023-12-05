const express = require('express');
const cors = require('cors');
const fetch = require('isomorphic-fetch');

const app = express();
const port = 3002;

app.use(cors());

app.get('/proxy/latest', async (req, res) => {
    try {
      const apiUrl = 'https://tassidicambio.bancaditalia.it/terzevalute-wf-web/rest/v1.0/latestRates?lang={}';
  
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
  
      const rawResponse = await response.text();
  
      const data = JSON.parse(rawResponse);
      res.json(data);
    } catch (error) {
      console.error('Error proxying request:', error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  });

app.get('/proxy/history', async (req, res) => {
    try {
      const { startMonth, startYear, endMonth, endYear, baseCurrencyIsoCode, currencyIsoCode, lang } = req.query;
      const apiUrl = `https://tassidicambio.bancaditalia.it/terzevalute-wf-web/rest/v1.0/monthlyTimeSeries?startMonth=${startMonth}&startYear=${startYear}&endMonth=${endMonth}&endYear=${endYear}&baseCurrencyIsoCode=${baseCurrencyIsoCode}&currencyIsoCode=${currencyIsoCode}&lang=${lang}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
  
      const rawResponse = await response.text();
      const data = JSON.parse(rawResponse);
      res.json(data);
    } catch (error) {
      console.error('Error proxying request:', error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  });

app.listen(port, () => {
  console.log(`CORS Proxy Server listening at http://localhost:${port}`);
});