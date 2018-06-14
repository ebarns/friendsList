import React, { Component } from 'react';
import './App.css';
import Foundation from 'react-foundation';

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      tracks: [],
      userIds: "",
      playlistname: "defaultName",
      nowPlaying: {
        name: 'Not Checked',
        albumArt: ''
      },
      sortOptions: this.getSortOptions(),
      selectedSort: this.getSortOptions()[0],
      spotifyUserIds: [],
      trackLimit: 20
    }
  }
  getHashParams() {
    var hashParams = {};
    var e;
    var r = /([^&;=]+)=?([^&;]*)/g;
    var q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  getSortOptions() {
    return ["popularity", "duration_ms"];
  }

  getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: {
            name: response.item.name,
            albumArt: response.item.album.images[0].url
          }
        });
      })
  }

  createPlayListConfig(name) {
    return {
      "name": name,
      "description": "New playlist description",
      "public": false
    };
  }

  sortByType(sortType) {
    return this.state.tracks.sort(function(a, b) {
      return a.track[sortType] - b.track[sortType];
    });
  }

  createPlaylistWithTracks() {
    spotifyApi.createPlaylist("erik.barns", this.createPlayListConfig(this.state.playlistname))
      .then(response => {
        console.warn(response);
        //ascending
        let sortType = this.state.selectedSort;
        let tracks = this.state.tracks.sort(function(a, b) {
          return a.track[sortType] - b.track[sortType];
        });
        console.warn(tracks);
        let trackUris = tracks.map(item => item.track.uri).slice(0, this.state.trackLimit);
        spotifyApi.addTracksToPlaylist("erik.barns", response.id, trackUris)
      })
  }

  shuffle(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  getTracksFromUsers() {
    console.log(this.state.userIds.split(" "));

    this.state.spotifyUserIds.forEach(userId => {
      spotifyApi.getUserPlaylists(userId)
        .then((response) => {
          let playlists = response.items;
          console.log(playlists);
          playlists.forEach(playlist => {
            if (playlist.owner.id === userId) {
              spotifyApi.getPlaylist(userId, playlist.id)
                .then((response) => {
                  console.warn(response);
                  let tracks = response.tracks.items;
                  this.setState({
                    tracks: this.state.tracks.concat(tracks),
                    spotifyUserIds: []
                  })
                });
            }
          });
        }).then(() => {
        console.log("here");

      });
    });
  }

  removeTrack(index) {
    let newData = this.state.tracks.slice() //copy array from prevState
    newData.splice(index, 1) // remove element
    this.setState({
      tracks: newData
    });
  }

  renderTrackRow(track, index) {
    let keys = Object.keys(track.track);
    //    console.log(keys);
    let t = track.track;
    return (
      <tr className={index < this.state.trackLimit ? "active-track" : "" }key={index}>
            <td>{t.name}</td><td>{t.album.name}</td><td onClick={() => this.removeTrack(index)}>X</td>
        </tr>
    )
  }

  renderTracks() {

    return (
      <table>
        <tbody>
            {this.state.tracks.map((track, index) => this.renderTrackRow(track, index))}
        </tbody>
        </table>
    )
  }

  renderUserInput() {
    return (
      <div>
          <div>Step One: Enter spotify user IDs to pull songs from their library</div>
          <div className="flex-div-center">ID 
            <input  value={this.state.userIds} onChange={(event) => {
        this.setState({
          userIds: event.target.value
        })
      }}/>
          <div onClick={() => {
        this.setState({
          spotifyUserIds: this.state.spotifyUserIds.concat(this.state.userIds),
          userIds: ""
        });
      }}>
            Add
          </div>
                    <div onClick={() => this.getTracksFromUsers()}>
            Get Tracks Users
          </div>
        </div>
        <div className="flex-div-center">
          {this.state.spotifyUserIds.map(user => {
        return (
          <div>
                  {user}
                </div>
        )
      })}
        </div>
      </div>
    );
  }

  loginConditionalContent() {
    if (!this.state.loggedIn) {
      return;
    }

    return (
      <div>
          <div>
            <h1>GENERATE A PLAYLIST FROM YOUR FRIENDS SPOTIFY</h1>
            {this.renderUserInput()}
          </div>
          <div>
            <div className="flex-div">
                <div className="flex-div">
                   <div> Limit </div><input value={this.state.trackLimit} onChange={(event) => {
        this.setState({
          trackLimit: event.target.value
        })
      }}/>
                </div>
                <div>
                    sort by
                    <select onChange={(event) => this.setState(
        {
          selectedSort: event.target.value,
          tracks: this.sortByType(event.target.value)
        })} name="cars">
                    {this.state.sortOptions.map(item => {
        return (
          <option>{item}</option>
        );
      })}
                    </select>
                </div>
                <div>
                  <button onClick={() => this.setState({
        tracks: []
      })}>
                    Clear
                  </button>
                </div>
                <div>
                <button onClick={() => this.createPlaylistWithTracks()}>
                  Create playlist from tracks
                </button>
            </div>
            </div>
            <div>
                {this.renderTracks()}
            </div>
          </div>
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <a href="http://localhost:8888" > Login to Spotify </a>
        {this.loginConditionalContent()}
      </div>
    );
  }
}

export default App;
