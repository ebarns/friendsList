import React, { Component } from 'react';
import './App.css';
import RightArrow from "./right-arrow.js";
import SpotifyWebApi from 'spotify-web-api-js';
import Header from "./components/header.js";
import TrackList from "./components/trackList.js";

const spotifyApi = new SpotifyWebApi();

class App extends Component {
    constructor() {
        super();
        const params = this.getHashParams();
        const token = params.access_token;
        if (token) {
            spotifyApi.setAccessToken(token);
        }
        this.flowState = {GETUSERIDS: 1, TRACKLISTING: 2, NAMEPLAYLIST: 3, CREATED: 4 }
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
            trackLimit: 20,
            userFlowStep: 1
        }
        this.renderFlow = this.renderFlow.bind(this);
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
            "public": true
        };
    }

    sortByType(sortType) {
        // let isAscending = this.state.isAscending ? 1 : -1
        if(this.state.isAscending){
            return this.state.tracks.sort(function(a, b) {
                return (a.track[sortType] - b.track[sortType]);
            })
        }
        else{
            return this.state.tracks.sort(function(a, b) {
                return (b.track[sortType] - a.track[sortType])
            })
        }
    }

    createPlaylistWithTracks() {
        spotifyApi.getMe().then(response => {
            let userId = response.id;
            spotifyApi.createPlaylist(userId, this.createPlayListConfig(this.state.playlistname))
                .then(response => {
                    console.warn(response);
                    //ascending
                    // let sortType = this.state.selectedSort;
                    // let tracks = this.state.tracks.sort(function(a, b) {
                    //     return a.track[sortType] - b.track[sortType];
                    // });
                    // console.warn(tracks);
                    // let trackUris = tracks.map(item => item.track.uri).slice(0, this.state.trackLimit);
                    spotifyApi.addTracksToPlaylist("erik.barns", response.id, this.state.tracks)
                })
        });
    }



    renderUserIdInput(){
        return(
            <div className="get-user-id-container">
                <div className="instructions row"><b>Step One:</b> Enter a Spotify user ID to pull songs from their library</div>
                <div className="row">
                    <div className="flex-div user-id-input-container">
                        <div className="flex-div-center">
                            <div>User ID:</div>
                                <input  value={this.state.userIds} onChange={(event) => {
                                    this.setState({
                                        userIds: event.target.value
                                    })
                                }}/>
                            <div className="button plus-button" onClick={() => {
                                this.setState({
                                    spotifyUserIds: this.state.spotifyUserIds.concat(this.state.userIds),
                                    userIds: ""
                                });
                            }}>
                                +
                            </div>
                        </div>
                        <div className="flex-div-center">
                            {this.state.spotifyUserIds.map(user => {
                                return (
                                            <div className={"added-user-id user-name-tile hover-item"}>
                                              {user}
                                            </div>
                                        )})
                            }
                        </div>
                    </div>
                </div>
                <div className="right-aligned-content row">
                    <div className="button done-button" onClick={()=> {
                        this.setState({userFlowStep: this.flowState.TRACKLISTING})}}>
                        <RightArrow/>
                    </div>
                </div>
            </div>
            );
    }

    renderNamePlaylist(){
        return(
            <div className={"get-user-id-container"}>
                <div className="flex-div-center user-id-input-container">
                    <div>Playlist name:</div>
                    <div>
                        <input  value={this.state.playlistname} onChange={(event) => {
                            this.setState({
                                playlistname: event.target.value
                            })
                        }}/>
                    </div>
                </div>
                <div className="right-aligned-content">
                    <div class="button done-button" onClick={() => {
                        this.createPlaylistWithTracks();
                        this.setState({userFlowStep: this.flowState.CREATED});
                    }}>
                        <RightArrow/>
                    </div>
                </div>
            </div>
            )
    }

    renderCreated(){
        return(
            <div className="created-container ">
                <h4>{this.state.playlistname} was created successfully</h4>
                <div className="button right-aligned-content flex-div-center text-with-arrow" onClick={()=>{this.setState({userFlowStep: this.flowState.GETUSERIDS,spotifyUserIds: [], userIds: ""})}}>Start over <RightArrow/></div>
            </div>
        );
    }


    renderFlow() {
        switch (this.state.userFlowStep) {
            case this.flowState.GETUSERIDS: return this.renderUserIdInput();
            case this.flowState.TRACKLISTING: return <TrackList spotifyUserIds={this.state.spotifyUserIds} trackLimit={this.state.trackLimit} onClickCallback={(playlist)=>this.setState({userFlowStep: this.flowState.NAMEPLAYLIST, tracks: playlist})}/>
            case this.flowState.NAMEPLAYLIST: return this.renderNamePlaylist();
            case this.flowState.CREATED: return this.renderCreated();
            default: return;
        }
    }

    loginButton(){
        return (
            <div className="login-container"><a onClick={this.login} ><div className="button user-name-tile hover-item">Login with Spotify</div></a></div>
        )
    }

    login(){
        // Get the hash of the url
        const hash = window.location.hash
            .substring(1)
            .split('&')
            .reduce(function (initial, item) {
              if (item) {
                var parts = item.split('=');
                initial[parts[0]] = decodeURIComponent(parts[1]);
              }
              return initial;
            }, {});
                // Set token
        let _token = hash.access_token;

        const authEndpoint = 'https://accounts.spotify.com/authorize';

        // Replace with your app's client ID, redirect URI and desired scopes
        const clientId = '56477a90cfa443eea4531564ed615908';
        // const redirectUri = 'http://friendslist.surge.sh/';
        const redirectUri = 'http://localhost:3000/callback';
        const scopes = [
          'user-read-birthdate',
          'user-read-email',
          'user-read-private',
          'playlist-modify-public',
          'playlist-modify',
          'playlist-modify-private'
        ];

        // If there is no token, redirect to Spotify authorization
        if (!_token) {
          window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token`;
        }
    }

    loginConditionalContent() {
        if (!this.state.loggedIn){return this.loginButton();}
        else{
            return (
                        <div className="body-content">
                            {this.renderFlow()}
                        </div>
                    );
        }
    }


    render() {
        return (
            <div className="App large-12 medium-12 small-12">
                <Header/>
                {this.loginConditionalContent()}
            </div>
        );
    }
}

export default App;
