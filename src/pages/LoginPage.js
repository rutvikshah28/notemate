import React, {Component} from 'react';
import{Link} from "react-router-dom";
import {login} from "../helpers/auth.js";
import logo from "../logo.png";

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            email: "",
            password:"",
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
        this.setState({error:""});
        try {
            await login(this.state.email, this.state.password);
        }
        catch(error) {
            this.setState({error: error.message});
        }
    }

    render() {
        return (
            <div>
                <form autoComplete = "off" onSubmit={this.handleSubmit} id="loginMain">
                   <div id="loginLogo"> <Link to="/"><img src={logo}></img></Link> </div>
                   <h1 id="logintxt"> Login </h1>
                    <div id="loginEmail">
                        <input placeholder="Email" name="email" type="email" onChange={this.handleChange} value={this.state.email} />
                    </div>
                    <div id="loginPassword">
                        <input placeholder="Password" name="password" type="password" onChange={this.handleChange} value={this.state.password} />
                    </div>
                    <div id="loginButton">
                        {this.state.error ? (<p>{this.state.error}</p>) : null}
                        <button type="submit">Login</button>
                    </div>
                    <hr/>
                    <p id="redirectSignUp">Don't have an account? <Link to="/signup"> Sign Up </Link></p>
                </form>
            </div>
        );
    }
}

export default LoginPage;
