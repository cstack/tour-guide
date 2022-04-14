import React from 'react';
import './water.css';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingMessage: null,
      error: null,
      location: null,
      places: null,
    };
  }

  render() {
    let contents = [];
    if (this.state.loadingMessage !== null) {
      contents.push(<p key="loading-message">{this.state.loadingMessage}</p>);
    } else if (this.state.error !== null) {
      contents.push(<p key="error-message">{JSON.stringify(this.state.error)}</p>);
    } else if (this.state.places !== null) {
      contents.push(<NearbyPlaces key="NearbyPlaces" places={this.state.places} />);
    } else {
      contents.push(<button key="get-location-button" onClick={this.handleFindNearbyPlacesClicked.bind(this)}>Find Nearby Places</button>);
    }
    return (
      <div className="App">
        {contents}
      </div>
    );
  }

  handleFindNearbyPlacesClicked() {
    console.log("handleFindNearbyPlacesClicked");
    this.setState({loadingMessage: "Getting your location..."});
    if (navigator.geolocation) {
      console.log("navigator.geolocation.getCurrentPosition");
      navigator.geolocation.getCurrentPosition(this.handleLocationFound.bind(this));
    } else { 
      this.setState({loadingMessage: "Geolocation is not supported by this browser."});
    }
  }

  handleLocationFound(location) {
    console.log("handleLocationFound");
    this.setState({
      loadingMessage: "Getting nearby places from Wikipedia...",
      location: location,
    });
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    fetch(`https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&generator=geosearch&ggscoord=${latitude}|${longitude}&prop=coordinates|pageimages|description|info&ggsradius=10000`)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.error) {
            console.log("Error returned in JSON response");
            this.setState({
              error: result.error,
            });
          } else {
            console.log("Got a JSON response");
            this.setState({
              loadingMessage: null,
              places: Object.entries(result.query.pages),
            });
          }
        },
        (error) => {
          console.log("Error returned in HTTP response");
          this.setState({
            error: error,
          });
        }
      )
  }
}

class NearbyPlaces extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const contents = this.props.places.map((place) => {
      return (
        <Place
          key={place[1].pageid}
          title={place[1].title}
          pageId={place[1].pageid}
          thumbnailUrl={place[1].thumbnail.source}
          onClick={() => { this.startPlaying(place[1].pageid) } }
        />);
    });
    return (
      <div className="NearbyPlaces">
        {contents}
      </div>
    );
  }

  startPlaying(pageId) {
    fetch(`https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&pageids=${pageId}&explaintext=1&formatversion=2`)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.error) {
            console.log("Error returned in JSON response");
            this.setState({
              error: result.error,
            });
          } else {
            console.log("Got a JSON response");
            const page = Object.entries(result.query.pages)[0][1];
            const title = page.title;
            const extract = page.extract;
            const speaker = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(`${title}. ${extract}`);
            speaker.speak(utterance);
          }
        },
        (error) => {
          console.log("Error returned in HTTP response");
          this.setState({
            error: error,
          });
        }
      )
  }
}

class Place extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div className="Place">
        <a href="#" onClick={this.props.onClick}>
          <img src={this.props.thumbnailUrl} />
          {this.props.title}
        </a>
      </div>
    );
  }
}

export default App;
