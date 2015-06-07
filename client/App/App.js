const React  = require('react');
const GoogleMapsLoader = require('google-maps');
const moment = require('moment');
const request = require('superagent');
const Skycons = require('skycons');

let skycons = new Skycons({});
skycons = new skycons({ color: 'black' });

const g = window.google;

require('./App.styl');

require('font-awesome-webpack');

let autocomplete;

/*
id
place_id
name
icon
formatted_address
geometry.location.{lat,long}
*/

const DAY_TO_STRING = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

const AUTOCOMPLETE_OPTIONS = {
  types: ['(cities)']
};

/**
 * Loading spinner. Shown whenever information is being loaded but is not yet
 * available.
 */
let LoadingSpinner = React.createClass({

  render() {
    return (
      <div className='LoadingSpinner'>
        <h1>Loading...</h1>
      </div>
    );
  }

});

/**
 * The component for displaying information specific to a location.
 */
let LocationDetail = React.createClass({

  propTypes: {
    location: React.PropTypes.object.isRequired,
    forecast: React.PropTypes.object.isRequired
  },

  componentDidUpdate(prevProps) {
    if (!this.props.forecast) return;

    var { icon } = this.props.forecast.currently;

    if (prevProps.forecast && (prevProps.forecast.currently.icon === icon))
      return;

    skycons.set('current-icon', icon);
    skycons.play();
  },

  componentWillUnmount() {
    skycons.remove('current-icon');
  },

  render() {
    let { location, forecast } = this.props;

    let componentBody;

    if (!forecast)
      componentBody = <LoadingSpinner />;
    else
      componentBody = this.buildForecastBody();

    return (
      <div className='LocationDetail'>
        <h1>{location.name}</h1>
        {componentBody}
      </div>
    );
  },

  buildForecastBody() {
    let { forecast } = this.props;
    let current = forecast.currently;
    let sevenDay = forecast.daily.data.slice(1);

    let sevenDayComponent = sevenDay.map((day, i) => {
      let dayText = DAY_TO_STRING[i];
      return (
        <li>
          <div className="day">{dayText}</div>
          <div className="high">{Math.round(day.temperatureMax)}</div>
          <div className="low">{Math.round(day.temperatureMin)}</div>
        </li>
      );
    });

    return (
      <div className="forecast">
        <div className="current">
          <div className="icon">
            <canvas id="current-icon" width="128" height="128"></canvas>
          </div>
          <div className="temperature">
            {Math.round(current.temperature)}
            <span className='degree'>º</span>
          </div>
        </div>
        <div className="seven-day">
          <ul className="table">
            {sevenDayComponent}
          </ul>
        </div>
      </div>
    );
  }

});

let PackingList = React.createClass({

  getInitialState() {
    return {
      items: []
    };
  },

  render() {
    return (
      <div className='PackingList'>
        <h1>Packing List</h1>

        <ul className='packing-list'>
          {this.buildItemList()}
        </ul>
        <div className="super-input">
        <input
          type="text"
          onKeyDown={this.handleTextInput}
          placeholder='Create an item...'/>
        </div>
      </div>
    );
  },

  handleTextInput(e) {
    if (e.which !== 13) return;

    let text = e.target.value.trim();
    let items = this.state.items.concat([text]);

    e.target.value = '';
    this.setState({ items });
  },

  buildItemList() {
    return this.state.items.map((item, i) => {
      return (
        <li>
          <p>{item}</p>
          <button className='remove'>
            <i className="fa fa-times"></i>
          </button>
        </li>
      );
    });
  }

});

let App = React.createClass({

  getInitialState() {
    return {
      locationText: '',
      location: null,
      forecast: null,
      status: 'ready'
    };
  },

  componentDidMount() {
    var input = this.refs.autocomplete.getDOMNode();
    autocomplete = new g.maps.places.Autocomplete(input, AUTOCOMPLETE_OPTIONS);
    g.maps.event.addListener(autocomplete, 'place_changed', this.onPlaceChanged);
  },

  componentWillUnmount() {
    g.maps.event.removeListener(autocomplete, 'place_changed', this.onPlaceChanged);
  },

  render() {
    let { location, forecast } = this.state;
    let currentLocation;

    if (this.state.status === 'error') {
      currentLocation = <h1>There was an error</h1>;
    } else if (this.state.location) {
      currentLocation = <LocationDetail location={location} forecast={forecast} />;
    }

    return (
      <div className="App container">
        <h1>Packing Guru</h1>
        <input
          type="text"
          ref='autocomplete'
          className='location-input'
          value={this.state.locationText}
          onChange={this.handleTextEntry}
          placeholder='Where are you going?' />
        {currentLocation}
        <PackingList />
      </div>
    );

  },

  handleTextEntry(e) {
    var locationText = e.target.value;
    this.setState({ locationText });
  },

  onPlaceChanged() {
    let location = autocomplete.getPlace();
    this.setState({
      locationText: location.formatted_address,
      forecast: null,
      status: 'ready',
      location
    }, this.getForecast);
  },

  getForecast() {
    let lat = this.state.location.geometry.location.lat();
    let long = this.state.location.geometry.location.lng();

    request
      .get('/api/forecast')
      .query({ lat, long })
      .end((err, res) => {
        if (err || !res.ok) {
          console.error("THERE WAS AN ERRORRRRRR!!!");
          this.setState({ status: 'error' });
          return;
        }

        let forecast = res.body;
        this.setState({ forecast });
      });
  }

});

module.exports = App;

