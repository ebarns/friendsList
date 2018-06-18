import React, { Component } from 'react';

class Header extends Component {
	
	render(){
		return(
				<div className={"header flex-div-center"}>
                    <h1>FriendsList</h1>
                    <h4>Generate a Spotify playlist from any users library</h4>
                </div>
		)
	}
}

export default Header;