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
                // let sortType = this.state.selectedSort;
                // let tracks = this.state.tracks.sort(function(a, b) {
                //     return a.track[sortType] - b.track[sortType];
                // });
                // console.warn(tracks);
                // let trackUris = tracks.map(item => item.track.uri).slice(0, this.state.trackLimit);
                spotifyApi.addTracksToPlaylist("erik.barns", response.id, this.state.tracks)
            })
    }

    renderFilters(){
        return (
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
            </div>
            </div>
        )
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

    renderUserIdInput(){
        return(
            <div className="get-user-id-container">
                <div className="instructions"><b>Step One:</b> Enter a Spotify user ID to pull songs from their library</div>
                <div className="flex-div-center user-id-input-container">
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
                <div className="right-aligned-content">
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
                <div className="button right-aligned-content flex-div-center text-with-arrow" onClick={()=>{this.setState({userFlowStep: this.flowState.GETUSERIDS})}}>Start over <RightArrow/></div>
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

    loginConditionalContent() {
        if (!this.state.loggedIn) return;
        return (
                <div>
                    <Header/>
                    <div className="body-content">
                        {this.renderFlow()}
                    </div>
                </div>
                );
    }


    render() {
        return (
            <div className="App large-12 medium-12 small-12">
        {!this.state.loggedIn && <a href="http://localhost:8888/login" > Login to Spotify </a>}
        {this.loginConditionalContent()}
      </div>
        );
    }
}

export default App;
