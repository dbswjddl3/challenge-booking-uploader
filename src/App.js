import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Timeline from 'react-calendar-timeline'
import moment from 'moment'
import "react-calendar-timeline/lib/Timeline.css";
import './App.css';

const apiUrl = 'http://localhost:3001'

class App extends Component {

  state = {}

  groups = [
    {id: 1, title: '0001'},
    {id: 2, title: '0002'},
    {id: 3, title: '0003'},
  ]
  
  componentWillMount() {
    fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then((bookings) => {
        this.setState({ bookings })
      }).catch(err => {
        console.log("Error Reading data " + err);
      });
  }

  onDrop = (files) => {
    var reader = new FileReader();
    var _this = this;
    reader.onload = function(e) {
      var bookings = _this.state.bookings;
      var lines = reader.result.split("\n");

      // Parse bookings from file
      for (var i=1; i<lines.length-1; i++) {
        var currentline = lines[i].split(",");
        var obj = {
          time: currentline[0],
          duration: currentline[1] * 60 * 1000,
          userId: currentline[2],
        };

        // check overlap with existing bookings
        for (var k=0; k<_this.state.bookings; k++) {
          if (obj) {
            
          }
        }
        
        bookings.push(obj);
      }
      // console.log(bookings);
      _this.setState({bookings})
    }
    reader.readAsText(files[0]);
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
            <Timeline groups={this.groups}
              items={
                (this.state.bookings || []).map((booking, i) => {
                  const duration = booking.duration / (60 * 1000);
                  return ({
                    id: i, 
                    group: parseInt(booking.userId), 
                    title: 'User ' + booking.userId + ' - ' + duration + ' Minutes' , 
                    start_time: moment(booking.time), 
                    end_time: moment(booking.time).add(booking.duration / (60 * 1000), 'minute')
                  })
                })
              }
              defaultTimeStart={moment('01 Mar 2018 11:00:00 GMT+1000')}
              defaultTimeEnd={moment('06 Mar 2018 11:00:00 GMT+1000')}
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
