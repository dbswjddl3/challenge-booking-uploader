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

class App extends Component {

  state = {
    bookings: [],
    events: [],
  }

  componentWillMount() {
    fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then((bookings) => {
        this.setBookings(bookings);
      })
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
          userId: currentline[2],
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

    data.forEach((booking, i) => {
      const title = 'User' + parseInt(booking.userId, 10);
      const start = new Date(booking.time);
      const end = new Date(booking.time + booking.duration);
      const range = moment.range(start, end);

      // check booking overlaps
      var is_overlap = false;
      var type = ''
      for (var j=0; j<bookings.length; j++) {
        const range2 = moment.range(moment(bookings[j].time), moment(bookings[j].time).add(booking.duration, 'millisecond'));
        if (range2.overlaps(range)) {
          is_overlap = true;
          break;
        }
      }

      if (is_overlap) {
        type = 'overlap';
      } else {
        type = '';
        bookings.push(booking);
      }

      // Add Events
      events.push({
        id: events.length, 
        title: title, 
        start: start, 
        end: end,
        type: type
      })
    });

    // console.log(bookings);
    // console.log(events);

    this.setState({ bookings, events });
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
            views={['day', 'week']}
            defaultDate={new Date('2019/06/02')}
          />
          {
            (this.state.bookings || []).map((booking, i) => {
              const date = new Date(booking.time);
              const duration = booking.duration / (60 * 1000);
              return (
                <p key={i} className="App-booking">
                  <span className="App-booking-time">{date.toString()}</span>
                  <span className="App-booking-duration">{duration.toFixed(1)}</span>
                  <span className="App-booking-user">{booking.userId}</span>
                </p>
              )
            })
          }
        </div>
      </div>
    );
  }
}

export default App;
