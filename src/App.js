import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import BigCalendar from 'react-big-calendar'
import EventWrapper from "./EventWrapper";
import Moment from 'moment';
import { extendMoment } from 'moment-range';

import './App.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const apiUrl = 'http://localhost:3001'
const moment = extendMoment(Moment);
const defaultDate = new Date('2019/06/03');

class App extends Component {

  constructor (props){
    super(props);
  
    this.state = {
      bookings: [],
    };
  }
  
  componentDidMount() {
    // Get existing Bookings from server
    fetch(`${apiUrl}/bookings`)
    .then((response) => response.json())
    .then((bookings) => {
      this.setBookings(bookings)
    }).catch(() => {
      alert('Error occurred: unable to retrieve data from server.');
    });
  }

  onDrop = (files) => {
    if (files.length === 0) {
      alert("Please check the files.");
      return;
    }

    const _this = this;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        var bookings = [];
        var lines = reader.result.split("\n");
        // Parse bookings from csv file
        for (var i=1; i<lines.length-1; i++) {
          var currentline = lines[i].split(",");
          bookings.push({
            time: new Date(currentline[0]).getTime(),
            duration: currentline[1] * 60 * 1000,
            userId: "000" + currentline[2],
          });
        }
        _this.setBookings(bookings);
      }
      reader.readAsText(file);
    });
  }
  
  getBookings() {
    var bookings = [];
    this.state.bookings.forEach((booking) => {
      if (!booking.overlap) {
        bookings.push({
          time: new Date(booking.start).toString(),
          duration: booking.duration,
          user_id: booking.user_id,
        });
      }
    });
    return bookings;
  }

  setBookings(data) {
    var bookings = this.state.bookings;
    var is_new = (bookings.length > 0) ? true : false;

    data.forEach((booking) => {
      const start = new Date(booking.time);
      const end = new Date(booking.time + booking.duration);
      const range = moment.range(start, end);

      // Check booking overlaps
      const is_overlap = bookings.some((_booking, _i) => {
        const _range = moment.range(_booking.start, _booking.end);
        if (_range.overlaps(range)) {
          return true;
        }
        return false;
      });

      // Add bookings
      bookings.push({
        id: bookings.length, 
        start: start, 
        end: end,
        title: 'User' + parseInt(booking.userId, 10), 
        new: is_new,
        overlap: is_overlap,
        user_id: booking.userId, 
        duration: booking.duration / (60 * 1000),
      })
    });

    this.setState({ bookings });
  }

  updateBookings = () => {
    var bookings = this.getBookings();
    fetch(`${apiUrl}/bookings`, {
      method: 'POST',
      body: JSON.stringify(bookings),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((bookings) => {
      this.setState({ bookings: [] }, () => {
        this.setBookings(bookings);
        alert('Bookings successfully updated!');
      });
    }).catch((e) => {
      alert('Error occurred: '+e);
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Dropzone
            accept=".csv"
            onDrop={this.onDrop}
          >
            Drag files here
          </Dropzone>
        </div>
        <div className="App-main">
          <p>Existing bookings:</p>
          <BigCalendar
            components={{eventWrapper: EventWrapper}}
            events={this.state.bookings}
            localizer={BigCalendar.momentLocalizer(moment)}
            defaultDate={defaultDate}
            defaultView={BigCalendar.Views.WEEK}
            views={['day', 'week', 'agenda']}
          />
          <button className="btn-update-booking" type="button" onClick={this.updateBookings}>Update Bookings</button>
        </div>
      </div>
    );
  }
}

export default App;
