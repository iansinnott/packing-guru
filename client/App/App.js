const React  = require('react');

require('./App.styl');

require('font-awesome-webpack');

let App = React.createClass({

  getInitialState() {
    return {
      locationText: ''
    };
  },

  render() {
    return (
      <div className="App container">
        <h1>Travel Guru</h1>
        <input
          type="text"
          className='location-input'
          value={this.state.locationText}
          onChange={this.handleTextEntry}
          placeholder='Where are you going?' />
      </div>
    );
  },

  handleTextEntry(e) {
    var locationText = e.target.value;
    this.setState({ locationText });
  }

});

module.exports = App;

