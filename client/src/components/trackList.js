import React, { Component, PropTypes} from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import RightArrow from "../right-arrow.js";

const spotifyApi = new SpotifyWebApi();
class TrackList extends Component {
	constructor(props){
		super(props);

		this.state = {
			tracks : this.props.tracks || [],
            trackLimit: 20,
            sortOptions: this.getSortOptions(),
            selectedSort: this.getSortOptions()[0],
            isAscending: true
		}
	}
    getSortOptions() {
        return ["popularity", "duration_ms"];
    }
    getTracksFromUsers() {

        this.props.spotifyUserIds.forEach(userId => {
            spotifyApi.getUserPlaylists(userId)
                .then((response) => {
                    let playlists = response.items;
                    playlists.forEach(playlist => {
                        if (playlist.owner.id === userId) {
                            spotifyApi.getPlaylist(userId, playlist.id)
                                .then((response) => {
                                    let tracks = response.tracks.items;
                                    this.setState({
                                        tracks: this.state.tracks.concat(tracks)
                                    })
                                });
                        }
                    });
                }).then(() => {
                console.log("here");

            });
        });
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

    renderFilters(){
        return (
            <div className="flex-justify-center filter-container">
                <div className="flex-div-center filter">
                   <div> Limit </div><input value={this.state.trackLimit} onChange={(event) => {
                this.setState({
                    trackLimit: event.target.value
                })
            }}/>
                </div>
                <div className="sort-filters-container filter">
                    sort by:
                    {this.state.sortOptions.map(item => {
                        return (
                            <button onClick={() => {this.setState({isAscending: !this.state.isAscending, selectedSort: item, tracks: this.sortByType(item)})}} color={"secondary"}>
                                <div>{item}</div>
                                {(this.state.selectedSort === item) &&
                                    <div className={this.state.isAscending ? "up-arrow" : "down-arrow"}>
                                        <RightArrow/>
                                    </div>
                                }
                            </button>

                        );
                    })}
                </div>
                <div className="sort-filters-container filter">
                  <button onClick={() => this.setState({
                tracks: this.shuffle(this.state.tracks)
                    })}>
                    Shuffle
                  </button>
                </div>
                <div>
            </div>
            </div>
        )
    }

    componentWillMount(){
    	this.getTracksFromUsers();
    }

	showAddOrRemove(index){
        let td = (index < this.props.trackLimit) ? <td className="no-select cursor-pointer" onClick={() => this.removeTrack(index)}>x</td> : <td className="no-select cursor-pointer" onClick={() => this.pushTrackToTop(index)}>+</td>
        return td;
    }

    pushTrackToTop(index) {
        let track = this.state.tracks[index];
        let tracks = this.state.tracks.slice()
        tracks.splice(index, 1);
        tracks.unshift(track);

        this.setState({
            tracks: tracks,
            trackLimit: this.state.trackLimit + 1
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
            <td>{t.name}</td><td>{t.album.artists.length > 0 ? t.album.artists[0].name : "NAME_MISSING"}</td>{this.showAddOrRemove(index)}</tr>
        )
    }

	render(){
		return(
			    <div>
		            <div className="right-aligned-content">
		                <div className="text-with-arrow flex-div-center button" onClick={() => this.props.onClickCallback(this.state.tracks.map(item => item.track.uri).slice(0, this.props.trackLimit))}>
		                      Create playlist <RightArrow/>
		                </div>
		            </div>
                    <div>
                        {this.renderFilters()}
                    </div>
					<table>
			            <thead>
			              <th>Song</th><th>Artist</th>
			            </thead>
				        <tbody>
				            {this.state.tracks.map((track, index) => this.renderTrackRow(track, index))}
				        </tbody>
	        		</table>
	        	</div>
		);
	}
}

export default TrackList;