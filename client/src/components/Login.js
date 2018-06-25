import React, {Component}from "react";

class Login extends Component {
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
        const redirectUri = 'http://friendslist.surge.sh/';
        // const redirectUri = 'http://localhost:3000/callback';
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

    render(){
        return (
            <div className="login-container"><a onClick={this.login} ><div className="button user-name-tile hover-item">Login with Spotify</div></a></div>
        );
    }
}

export default Login;