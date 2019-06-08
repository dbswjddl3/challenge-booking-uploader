import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import "react-calendar-timeline/lib/Timeline.css";
import './App.css';
import Timeline from 'react-calendar-timeline'
import Moment from 'moment';
import { extendMoment } from 'moment-range';

const apiUrl = 'http://localhost:3001'
const moment = extendMoment(Moment);

class App extends Component {

  state = {
    bookings: [],
    groups: [],
    items: []
  }

  groups = [];
  items = []


  componentWillMount() {
    fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then((bookings) => {
        console.log(bookings);
        this.setBookings(bookings);
        // this.setState({ bookings }, this.setBookings);
      }).catch(err => {
        console.log("Error Reading data " + err);
      })
  }

  onDrop = (files) => {
    var reader = new FileReader();
    var _this = this;
    reader.onload = function(e) {
      var bookings = [];
      var lines = reader.result.split("\n");
      // Parse bookings from file
      for (var i=1; i<lines.length-1; i++) {
        var currentline = lines[i].split(",");
        bookings.push({
          time: new Date(currentline[0]).getTime(),
          duration: currentline[1] * 60 * 1000,
          userId: currentline[2],
        });
      }
      // console.log(bookings);
      _this.setBookings(bookings);
    }
    reader.readAsText(files[0]);
  }
      
  setBookings(data) {
    var bookings = this.state.bookings;
    var groups = this.state.groups;
    var items = this.state.items;
    data.map((booking, i) => {
      const userId = parseInt(booking.userId);
      const userTitle = 'User ' + booking.userId;
      const duration = booking.duration / (60 * 1000);
      const range = moment.range(moment(new Date(booking.time)), moment(new Date(booking.time)).add(duration, 'minute'));

      // check booking overlaps
      var is_overlap = false;
      for (var j=0; j<bookings.length; j++) {
        const range2 = moment.range(moment(bookings[j].time), moment(bookings[j].time).add(duration, 'minute'));
        if (range2.overlaps(range)) {
          is_overlap = true;
          break;
        }
      }
      if (!is_overlap) {
        bookings.push(booking);
      }

      for (var j=0; j<=i; j++) {
        if (groups[j] && groups[j].title === userTitle) {
          break;
        }
        groups.push({id: userId, title: userTitle});
      }
      items.push({
        id: i, 
        group: userId, 
        title: userTitle + ' - ' + duration + ' Minutes' , 
        start_time: moment(booking.time), 
        end_time: moment(booking.time).add(duration, 'minute')
      })
    });
    // console.log(bookings)
    // console.log(groups)
    // console.log(items)
    this.setState({ bookings, groups, items });
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
          <div>
            <Timeline 
              groups={this.state.groups}
              items={this.state.items}
              defaultTimeStart={moment('01 Mar 2018 11:00:00')}
              defaultTimeEnd={moment('06 Mar 2018 11:00:00')}
            />
          </div>
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
