import React from 'react';
import './water.css';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingMessage: null,
      location: null,
    };
  }

  render() {
    let contents = [];
    if (this.state.loadingMessage !== null) {
      contents.push(<p key="loading-message">{this.state.loadingMessage}</p>);
    } else if (this.state.location !== null) {
      contents.push(<NearbyPlaces location={this.state.location} />);
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
      loadingMessage: null,
      location: location,
    });
  }
}

class NearbyPlaces extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      items: null,
      error: null,
    };
  }

  componentDidMount() {
    const latitude = this.props.location.coords.latitude;
    const longitude = this.props.location.coords.longitude;
    fetch(`https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&generator=geosearch&ggscoord=${latitude}|${longitude}&prop=coordinates|pageimages|description|info&ggsradius=10000`)
      .then(res => res.json())
      .then(
        (result) => {
          if (result.error) {
            console.log("Error returned in JSON response");
            this.setState({
              isLoaded: true,
              error: result.error,
            });
          } else {
            console.log("Got a JSON response");
            this.setState({
              isLoaded: true,
              items: Object.entries(result.query.pages),
            });
          }
        },
        (error) => {
          console.log("Error returned in HTTP response");
          this.setState({
            isLoaded: true,
            error: error,
          });
        }
      )
  }

  render() {
    let contents = [];
    if (this.state.isLoaded === false) {
      contents.push(<p key="loading-message">Getting nearby places from Wikipedia...</p>);
    } else if (this.state.error !== null) {
      contents.push(<p key="error-message">{JSON.stringify(this.state.error)}</p>);
    } else {
      contents = this.state.items.map((item) => {
        return (<Place key={item[1].pageid} title={item[1].title} pageId={item[1].pageid} />);
      });
    }
    return (
      <div className="NearbyPlaces">
        {contents}
      </div>
    );
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
        {this.props.title}
      </div>
    );
  }
}

export default App;
