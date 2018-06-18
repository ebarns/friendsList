import React, { Component, PropTypes} from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import RightArrow from "../right-arrow.js";

const spotifyApi = new SpotifyWebApi();
class TrackList extends Component {
	constructor(props){
		super(props);

		this.state = {
			tracks : this.props.tracks || []
		}
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
            <tr className={index < this.props.trackLimit ? "active-track" : "" }key={index}>
            <td>{t.name}</td><td>{t.album.name}</td>{this.showAddOrRemove(index)}</tr>
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