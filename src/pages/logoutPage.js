import React, {Component} from 'react';
import {auth} from "../services/firebase";
import {Redirect} from "react-router-dom";


class logoutPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            user: auth().currentUser,
            logout: false,
            error: null,
        }
    }


   async componentDidMount() {
        if(this.state.logout === false) {
            //We must log out now.. and redirect back to "/"

            try{
            await auth().signOut();
            this.setState({logout: true});
            }
            catch(error) {
                this.setState({error: error.message});
            }
        }
    }

    render() {
        return(
            this.state.logout === false ? (this.state.error?<h1>{this.state.error}</h1>:<h1>Logging Out...</h1>): <Redirect to="/" />
        )
    }
}

export default logoutPage;

/*
SignOut Firebase method
firebase.auth().signOut().then(function() {
  // Sign-out successful.
}).catch(function(error) {
  // An error happened.
});
*/