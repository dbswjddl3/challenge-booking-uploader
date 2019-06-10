const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser')

const app = express();
const bookingFile = './server/bookings.json';

app.use(cors()); // so that app can access
app.use(bodyParser.json())

function getBookings() {
  return JSON.parse(fs.readFileSync(bookingFile))
  .map((bookingRecord) => ({
    time: Date.parse(bookingRecord.time),
    duration: bookingRecord.duration * 60 * 1000, // mins into ms
    user_id: bookingRecord.user_id,
  }))
}

app.post('/bookings', (req, res) => {
  fs.writeFile(bookingFile, JSON.stringify(req.body), (err) => {
    if (err) {
       res.status(500).jsonp({ error: 'Failed to write file' });
    }
    const bookings = getBookings();
    res.send(bookings);
  });
});

app.get('/bookings', (_, res) => {
  const bookings = getBookings();
  res.json(bookings);
});

app.listen(3001);
