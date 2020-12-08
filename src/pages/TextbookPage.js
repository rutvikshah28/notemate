import React, {Component} from 'react';
import {auth} from "../services/firebase";
import {db} from "../services/firebase";
import Firepad from 'firepad';
function getRandomRef() {
    var ref = db.ref("textbooks");
    var hash = window.location.hash.replace(/#/g, '');
    if(hash) {
        ref = ref.child(hash);
    }
    else {
        ref = ref.push();
        window.location = window.location + '#' + ref.key;
    }
    if(typeof console !== 'undefined') {
        console.log('Firebase data: ', ref.toString());
    }

    return ref;

}


class TextBookPage extends Component {
    constructor(props) {
        super(props);
        this.cid = props.cid;
        console.log(this.cid);
    }
    componentDidMount() {
        
        var firepadRef = db.ref("textbooks/"+this.cid);
        var userId = auth().currentUser.uid;
        var userEmail = auth().currentUser.email;

        var codeMirror = window.CodeMirror(document.getElementById('firepad'), { lineWrapping: true });
        var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
                richTextShortcuts: true,
                richTextToolbar: true,
                userId: userId,
                userEmail: userEmail,
              });
        
                   
        //codeMirror.setValue('Default -- to be overwritten');


        firepad.on('ready', function() {
            if(firepad.isHistoryEmpty()) {
                //codeMirror.setValue('Default -- to be overwritten');
                firepad.setHtml('<span style="font-size: 24px;">Start contributing to the class textbook now!</span><br/><br/>\n');
            }

            });

            firepad.on('synced', function(isSynced) {
                // isSynced will be false immediately after the user edits the pad,
                // and true when their edit has been saved to Firebase.
                
        });
    }
      render() {
        return (
        <div id="firepad"></div>
        );
      }
}

export default TextBookPage;
