import React, {Component} from 'react';
import {auth} from "../services/firebase";
import {db} from "../services/firebase";
import ChatPage from './ChatPage';
import TextBookPage from './TextbookPage';
import TextbookPage from './TextbookPage';
import {Redirect} from 'react-router-dom';

class CoursePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth().currentUser,
            textbookAccess: false,
            chatAccess: false,
        }
       console.log(props);
        this.cid = props.location.cid;
    }

    async componentDidMount() {

        var tbAccess, cAccess;
        await db.ref("users/"+this.state.user.uid+"/courseID").on("value", snapshot => {
            snapshot.forEach((snap) => {
                if(snap.key === this.cid){
                    snap.forEach((innerSnap) => {
                        if(innerSnap.key === "chatAccess"){
                            cAccess = innerSnap.val();
                            this.setState({chatAccess: cAccess});
                        }
                        if(innerSnap.key === "textbookAccess"){
                            tbAccess = innerSnap.val();
                            this.setState({textbookAccess: tbAccess});
                        }
                    });
                }
            });
        });

    }

    render() {
       
        if(this.cid === undefined) {
            console.log(this.cid);
            return(<Redirect to = "/" />)
        }
        return (
            <div id="coursePage">
                <div id="cpTextbook">{this.state.textbookAccess === true?<TextBookPage cid = {this.cid}/>:<p>Textbook access has been retricted for you</p>}</div>
                <div id="cpChat">{this.state.chatAccess === true?<ChatPage cid = {this.cid}/>:<p>Chat access has been retricted for you</p>}</div>
            </div>
        );
    }
}

export default CoursePage;