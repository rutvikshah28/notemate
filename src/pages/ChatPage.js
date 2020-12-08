import React, {Component} from 'react';
import {auth} from "../services/firebase";
import {db} from "../services/firebase";

class ChatPage extends Component {
    constructor(props){
        super(props);
        this.state = {
            user: auth().currentUser,
            chats: [],
            readError: null,
            writeError: null,
            
        };
        this.cid = props.cid;
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        
        this.setState({readError: null});
        try {
            db.ref("chats/"+this.cid).on("value", snapshot => {
                let chats = [];
                snapshot.forEach((snap) => {
                    chats.push(snap.val());
                });
                this.setState({chats});
            });
        }
        catch(error) {
            this.setState({readError: error.message});
        }
    }

    handleChange(event) {
        this.setState({
            content: event.target.value
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({
            writeError: null
        });
        try {
            await db.ref("chats/"+this.cid).push({
                content: this.state.content,
                timestamp: Date.now(),
                uid: this.state.user.uid,
                email: this.state.user.email,
            });
            this.setState({content: ''});
        }
        catch(error) {
            this.setState({writeError: error.message});
        }
    }

    render() {
        return (
            <div>
                <div className="chats">
                    {this.state.chats.map(chat => {
                        return (<div><p key={chat.timestamp}>{chat.content}</p><h6>{chat.email}</h6><hr/></div>)
                    })}
                </div>
                <form onSubmit={this.handleSubmit} id="chatForm">
                    <input onChange={this.handleChange} value={this.state.content} ></input>
                    {this.state.error ? <p>{this.state.writeError}</p> : null}
                    <button type="submit">Send</button>
                </form>
                <div id="chatTxt">
                    Logged in as: <strong>{this.state.user.email}</strong>
                </div>
            </div>
        );
    }
}

export default ChatPage;