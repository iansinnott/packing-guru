const React  = require('react');
const GoogleMapsLoader = require('google-maps');
const request = require('superagent');

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
    return <h1>There should be a forecast here</h1>;
  }

});

let App = React.createClass({

  getInitialState() {
    return {
      locationText: '',
      location: null,
      forecast: null
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

    if (this.state.location) {
      currentLocation = <LocationDetail location={location} forecast={forecast} />;
    }

    return (
      <div className="App container">
        <h1>Travel Guru</h1>
        <input
          type="text"
          ref='autocomplete'
          className='location-input'
          value={this.state.locationText}
          onChange={this.handleTextEntry}
          placeholder='Where are you going?' />
        {currentLocation}
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
          return;
        }

        let forecast = res.body;
        this.setState({ forecast });
      });
  }

});

module.exports = App;

