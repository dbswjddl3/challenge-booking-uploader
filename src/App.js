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
      events: [],
    };
  
    this.update = this.update.bind(this);
  
  }
  
  componentWillMount() {
    fetch(`${apiUrl}/bookings`)
    .then((response) => response.json())
    .then((bookings) => {
      this.setBookings(bookings);
    })
    .catch((err) => ({ err }));
  }

  onDrop = (files) => {
    var reader = new FileReader();
    var _this = this;
    reader.onload = function(e) {
      var bookings = [];
      var lines = reader.result.split("\n");
      // Parse bookings from csv file
      for (var i=1; i<lines.length-1; i++) {
        var currentline = lines[i].split(",");
        bookings.push({
          time: new Date(currentline[0]).getTime(),
          duration: currentline[1] * 60 * 1000,
          user_id: "000" + currentline[2],
        });
      }
      _this.setBookings(bookings);
    }
    reader.readAsText(files[0]);
  }
      
  setBookings(data) {
    // console.log(data);
    var bookings = this.state.bookings;
    var events = this.state.events;
    var type = '';

    if (events.length > 0) {
      type = 'new';
    }

    data.forEach((booking, i) => {
      const title = 'User' + parseInt(booking.user_id, 10);
      const start = new Date(booking.time);
      const end = new Date(booking.time + booking.duration);
      const range = moment.range(start, end);

      // check booking overlaps
      var is_overlap = bookings.some((_booking, _i) => {
        const _start = new Date(_booking.time);
        const _end = moment(_start).add(_booking.duration, 'minute');
        const _range = moment.range(_start, _end);
        if (_range.overlaps(range)) {
          return true;
        }
        return false;
      });

      // Add Events
      events.push({
        id: events.length, 
        title: title, 
        start: start, 
        end: end,
        type: type,
        overlap: is_overlap,
      })

      if (!is_overlap) {
        bookings.push({
          time: start.toString(),
          duration: booking.duration / (60 * 1000),
          user_id: booking.user_id,
        });
      }
    });

    // console.log(events);
    // console.log(bookings);

    this.setState({ events,  bookings });
  }

  updateEvents(data) {
    var events = [];
    data.forEach((booking, i) => {
      events.push({
        id: events.length, 
        title: 'User' + parseInt(booking.user_id, 10), 
        start: new Date(booking.time), 
        end: new Date(booking.time + booking.duration),
      })
    });
    this.setState({ events }, () => {
      alert('Bookings Updated!')
    });
  }

  update = () => {
    fetch(`${apiUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.bookings)
    })
    .then((response) => response.json())
    .then((bookings) => {
      this.updateEvents(bookings);
    })
    .catch((err) => ({ err }));
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
            events={this.state.events}
            localizer={BigCalendar.momentLocalizer(moment)}
            defaultView={BigCalendar.Views.WEEK}
            views={['day', 'week', 'agenda']}
            defaultDate={defaultDate}
          />
          <button className="btn-update-booking" type="button" onClick={this.update}>Update Bookings</button>
        </div>
      </div>
    );
  }
}

export default App;
