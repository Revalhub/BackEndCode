const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = '1uD4D_78zMFYA9c1GUa73L7t1RWYbLB1cFBD2_XgB2aw'; // Replace with your actual Sheet ID
const SERVICE_ACCOUNT_KEY_PATH = path.resolve(__dirname, '/etc/secrets/app.json'); // Path to Render's mounted secret file

// Google Sheets Auth Setup
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_PATH,
  scopes: SCOPES,
});
const sheets = google.sheets({ version: 'v4', auth });

// ✅ CORS Configuration
const allowedOrigins = ['http://localhost:3000', 'https://revalops-34baf.web.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  }
}));

// Body Parser Middleware
app.use(bodyParser.json());

// POST route
app.post('/api/storeRequest', async (req, res) => {
  const { email, message } = req.body;

  try {
    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[email, message, timestamp]],
      },
    });

    res.status(200).json({ message: 'Request stored successfully.' });
  } catch (error) {
    console.error('Error storing request:', error);
    res.status(500).json({ error: 'Failed to store request.' });
  }
});

// Server listener
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
