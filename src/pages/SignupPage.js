import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import{signup} from '../helpers/auth';
import { db } from '../services/firebase';
import logo from '../logo.png';

class SignupPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            error: null,
            email: '',
            password: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
       this.setState({
           [event.target.name]: event.target.value
       });
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({error:''});
        try{
            await signup(this.state.email, this.state.password);
        }
        catch (error) {
            this.setState({error: error.message});
        }
    }
    render() {
        return (
            <div>
                <form onSubmit = {this.handleSubmit} id="signUpMain">
                <div id="signUpLogo"><Link to="/"><img src= {logo} /></Link></div>
                    <h1 id="signuptxt">
                        Sign Up
                        
                    </h1>
                    <div id="signUpEmail">
                        <input placeholder = "Email" name="email" type = "email" onChange = {this.handleChange} value={this.state.email}></input>
                    </div>
                    <div id="signUpPassword">
                        <input placeholder="Password" name="password" onChange={this.handleChange} value={this.state.password} type="password"></input>
                    </div>
                    <div id="signUpButton">
                        {this.state.error ? <p>{this.state.error}</p> : null}
                        <button type = "submit">Sign Up</button>
                        
                    </div>
                    <hr />
                    <p id="redirectLogin"> Already have an account? <Link to="/login">Login</Link></p>
                </form>
            </div>
        )
    }
}

export default SignupPage;