import React, {Component} from 'react';
import {auth} from "../services/firebase";
import {db} from "../services/firebase";
import {Redirect} from 'react-router-dom';

class editCourse extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth().currentUser,
            userList: [],
            loading: false,
            courseReqList: [],
            deleteCourse: false,
            cid: props.location.cid,
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCheckbox = this.handleCheckbox.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    async handleDelete(event) {
        event.preventDefault();
        if(this.state.deleteCourse === true){
            await db.ref("courses").child(this.state.cid).remove();
            await this.state.userList.forEach((users) => {
                db.ref("users/"+users.uid+"/courseID").child(this.state.cid).remove();
            });

            await db.ref("textbooks").child(this.state.cid).remove();
            await db.ref("chats").child(this.state.cid).remove();

            this.setState({cid: undefined});
        }
    }
    async handleCheckbox(event) {
        event.preventDefault();
        if(this.state.userList.length !== 0){
        await this.state.userList.map(users => {
            console.log(users.uid);
            db.ref("users/"+users.uid+"/courseID").child(this.state.cid).set({chatAccess: users.chatAccess, textbookAccess: users.textbookAccess});
        });
    }

        console.log(this.state.userList);
    }
    async handleSubmit(event) {
        event.preventDefault();
        console.log(this.state.courseReqList);
        var toUpdateCourseList = [];
        await this.state.courseReqList.forEach((course) => {
            if(course.toAccept === true) {
                 db.ref("courses/"+this.state.cid).child("users").push(course.id);

                var removeKey;
                 db.ref("courseRequests/"+this.state.cid).once("value", snapshot => {
                   
                    snapshot.forEach((snap) => {
                        if(snap.val() === course.id) {
                            removeKey = snap.key;
                        }
                    });
                });

                 db.ref("courseRequests/"+this.state.cid).child(removeKey).remove();

                 db.ref("users/"+course.id+"/courseID").child(this.state.cid).set({textbookAccess: true, chatAccess: true});
            }
            else {
                toUpdateCourseList.push(course);
            }
        });

        await this.setState({courseReqList: toUpdateCourseList});
    }

    async componentDidMount() {
        
        
        await db.ref("courseRequests/"+this.state.cid).on("value", snapshot => {
            var requestAll = [];
            snapshot.forEach((snap) => {
                var request = {};
                request.id = snap.val();
            
        db.ref("users").on("value", snapshot1 => {
            snapshot1.forEach((snap1) => {
                if(snap1.key === request.id){
                    snap1.forEach((snap2) => {
                        if(snap2.key === "email") {
                            request.email = snap2.val();
                            request.toAccept = false;
                            requestAll.push(request);
                            this.setState({courseReqList: requestAll});
                        }
                    });
                }
            });
            
        }); 
    });
    });


    //Check for userList
    
    await db.ref("users").on("value", snapshot => {
        var userList = [];
        var userValues = {};
        snapshot.forEach((snap) => {
            snap.forEach((innerSnap => {
                if(innerSnap.key === "courseID"){
                    innerSnap.forEach((snap1) => {
                        if(snap1.key === this.state.cid){
                            userValues = snap1.val();
                            db.ref("users/"+snap.key+"/email").once("value", emailSnap => {
                            userValues.email = emailSnap.val();
                            userValues.uid = snap.key;
                            });
                            userList.push(userValues);
                            console.log(userList);
                            this.setState({userList: userList});
                        }
                        
                    });
                }
            }));
        });
        
    });

    }

    render() {
        if(this.state.cid === undefined) {
            console.log(this.state.cid);
            return(<Redirect to = "/admin" />)
        }
        if(this.state.loading === true) {
            return(<h2>Loading course details...</h2>);
        }
        else {
            return(
            <div id="courseEditMain">
                <div id="courseRequestList">
                    {this.state.courseReqList.map(courseReq => {
                        return(<div className = "dynamicReqList">
                            <p className="requestID">{courseReq.email}</p>
                            <input type="radio" onClick={()=>{courseReq.toAccept = true}} name={courseReq.email}></input>
                            <label for="Accept">Accept</label>
                            <input type="radio" value="Reject" onClick={() => {courseReq.toAccept = false}} name={courseReq.email}></input>
                            <label for="Reject">Reject</label>
                        </div>)
                    })}
                    {
                        this.state.courseReqList.length === 0 ? null :  <button onClick={this.handleSubmit}>Submit Changes</button>
                    }
                   
                </div>
                <div id="courseUserList">
                {
                    this.state.userList.length === 0 ? <center><h5>No users for this course</h5></center> : 
                    <table>
                        <tbody>
                            <center>
                                <tr>Course ID: {this.state.cid}</tr>
                            <tr>
                                <td><h5>E-mail Id</h5></td>
                                <td><h5>Textbook Access</h5></td>
                                <td><h5>Chat Access</h5></td>
                            </tr>
                           
                            {this.state.userList.map(users => {
                               
                                return(
                                    <tr>
                                        <td>{users.email}</td>
                                        <td><input type="checkbox"  defaultChecked = {users.textbookAccess} onClick = {()=>{users.textbookAccess = !users.textbookAccess}}/><label>Textbook Access</label></td>
                                        <td><input type="checkbox"  defaultChecked = {users.chatAccess} onClick={() => {users.chatAccess = !users.chatAccess}} /><label>Chat Access</label></td>
                                    </tr>
                                    
                                )
                            })}
                            {
                                this.state.userList.length === 0 ? null : <button onClick = {this.handleCheckbox}>Save changes</button>
                            }
                            </center>
                        </tbody>
                    </table>
                }   
                </div>
                <div id="deleteCourse">
                    <h4>Want to delete this course?</h4>
                    <input type="checkbox" onClick = {()=> {this.setState({deleteCourse: !this.state.deleteCourse})}} /> 
                    <button onClick={this.handleDelete}>Confirm Delete</button>
                </div>
            </div>)
        }
    }

}

export default editCourse;