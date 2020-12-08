import React, {Component} from 'react';
import {auth} from "../services/firebase";
import {db} from "../services/firebase";
import {storage} from "../services/firebase";
import {Link} from 'react-router-dom';
import profileDefault from '../avatar.png';


class profilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth().currentUser,
            image: null,
            url: auth().currentUser.photoURL,
            toShow: false,
            displayName: auth().currentUser.displayName,
            email: auth().currentUser.email,
            errorState: null,
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleRegChange = this.handleRegChange.bind(this);
    }

    async handleUpload() {
        if(this.state.image !== null) {
            
        console.log("should enter here upload");
        const uploadTask = await storage.ref(`images/${this.state.user.uid}/${this.state.image.name}`).put(this.state.image);

        
            
        await storage.ref("images/"+this.state.user.uid+"/"+this.state.image.name).getDownloadURL().then(url1 => {
            this.setState({url: url1});
        });
    }
    console.log("should exit with url: ", this.state.url);
    }

    async updateUser() {
        this.setState({errorState: null});
        if(this.state.user !== null) {
            await this.handleUpload();
            if((this.state.user.displayName !== this.state.displayName) && (this.state.displayName !== "")) {
                await this.state.user.updateProfile({
                    displayName: this.state.displayName
                }).then().catch(error => {
                    this.setState({errorState: error.message});
                });
            }
            if((this.state.user.email !== this.state.email) && (this.state.email !== "")) {
                await this.state.user.updateEmail(this.state.email).then().catch(error => {
                    this.setState({errorState: error.message});
                });
            }
            if((this.state.url !== this.state.user.photoURL) && (this.state.url !== "")) {
                console.log("should enter here");
                await this.state.user.updateProfile({
                    photoURL: this.state.url
                }).then().catch(error => {
                    this.setState({errorState: error.message});
                });
            }
        }
        this.setState({user: auth().currentUser});
    }

    


    handleRegChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleEdit() {
        this.setState({toShow: true});
    }

    async handleSave(event) {
        await this.updateUser();
        this.setState({toShow: false});
    }

     async handleChange(event) {
        if(event.target.files[0]) {
           await this.setState({image: event.target.files[0]});
        }
    }

 

    render() {
        console.log(this.state.user.photoURL);
        return(
            <div id="profilePage">
                <div className="userData">
                   <img src={this.state.user.photoURL?this.state.user.photoURL:profileDefault} alt="profile picture" id="profileMain"></img>
                    <div id="profileName"><h5>Name: </h5> <p> {this.state.user.displayName}</p></div>
                    <div id="profileEmail"><h5>Email: </h5><p> {this.state.user.email}</p></div>
                </div>
               
                <div id="changeUserData" style={this.state.toShow? {} : {display: 'none'}}>
                    <p>Change your profile picture</p>
                    <div id="uploadPicture">
                    <input type="file" onChange={this.handleChange} id="uploadFile"/>
                    </div>
                    <p>Change your name</p>    
                    <input type="text" name = "displayName"onChange={this.handleRegChange} defaultValue={this.state.user.displayName}/>
                    <p>Change email address</p>
                    <input type="email" name = "email" onChange={this.handleRegChange}  defaultValue={this.state.user.email}/>
                </div>
                <button onClick={this.handleEdit}>Edit</button>
                <button onClick = {this.handleSave}>Save Changes</button>
                {this.state.errorState !== null? <p>{this.state.errorState}</p> : null}
            </div>
        )
    }
}


export default profilePage;