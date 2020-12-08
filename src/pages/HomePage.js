/*
    HomePage should be accessed only after sign-in authentication is completed
    by Firebase. This is a private Route..

    HomePage contents:

*/



import React, {Component} from 'react';
import {auth} from "../services/firebase";
import {db} from "../services/firebase";
import {Link} from 'react-router-dom';
import coursePage from "./CoursePage";
import { render } from '@testing-library/react';

class HomePage extends Component {
    constructor(props){
        super(props);
        this.state = {
            user: auth().currentUser,
            courseList: [],
            courseName: [],
            readError: null,
            writeError: null,
            sentState: "",
            courseCode: "",
            
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        
      
    }

    handleChange(event) {
        this.setState({
            requestCode: event.target.value,
            sentState: "",
        });
    }

    async handleSubmit(event) {
        this.state.sentState = "";
        var toSend = false;
        var courseExists = false;
        var courseJoined = false;
        event.preventDefault();
        this.setState({
            writeError: null
        });
        try {
            await db.ref("courses").once("value", snapshot => {
                snapshot.forEach((snap) => {
                    if(snap.key === this.state.requestCode) {
                        toSend = true;
                        snap.forEach((innerSnap) => {
                            if(innerSnap.key === "users"){
                                innerSnap.forEach((snap1) => {
                                    if(snap1.val() === this.state.user.uid){
                                        toSend = false;
                                        courseJoined = true;
                                    }
                                })
                            }
                        })
                    }
                });
            });
            if(toSend === true) {
               await db.ref("courseRequests").once("value", snapshot => {
                    snapshot.forEach((snap) => {
                        console.log(snap.key);
                        if(snap.key === this.state.requestCode) {
                            console.log(snap.val());
                            snap.forEach((innerSnap) => {
                                console.log(innerSnap.key); 
                                if(innerSnap.val() === this.state.user.uid) {
                                    toSend = false;
                                    courseExists = true;
                                }
                            });
                            }
                        });  
                });
            }
            //another if to check if we have to send the request since we may have changed toSend to false from the above if statement.
            if(toSend === true) {
               await db.ref("courseRequests/"+this.state.requestCode).push(this.state.user.uid);
               this.setState({sentState: "Successfully sent request to join the course."});
            }
            else {
                console.log(courseExists);
                if(courseJoined === true) {
                    this.setState({sentState: "You have already joined this course"});
                }
               else if(courseExists === true) {
                    this.setState({sentState: "This request Already Exists"});
                }
                else {
                    this.setState({sentState: "The course ID entered is incorrect!"});
                }
                
            }
        }
        catch(error) {
            this.setState({writeError: error.message});
        }
    }

    async componentDidMount() {
        await db.ref("users/"+this.state.user.uid).child("email").set(this.state.user.email);
        this.setState({readError: null});
        try {
            
            //this.setState({courseList: []});
            await db.ref("users/"+this.state.user.uid).on("value", snapshot => {
                
                var course = {};
                let courseList = [];
                snapshot.forEach((snap) => {
                   
                        if(snap.key === "courseID"){
                            snap.forEach((courseSnap => {
                                courseList.push(courseSnap.key);
                                console.log(courseSnap.key);
                                this.setState({courseList: courseList}); 
                            }))
                    }
                });
                var courseName = [];
               courseList.forEach((course) => {

                    var course1 = {};
                    course1.cid = course;
                    db.ref("courses/"+course).once("value", snapshot1 => {
                        snapshot1.forEach((snap1) => {
                            if(snap1.key === "courseName")
                            {
                                course1.name = snap1.val();
                            }
                            if(snap1.key === "courseCreator"){
                                course1.creator = snap1.val();
                            }
                        });
                        courseName.push(course1);
                        this.setState({courseName: courseName});
                        
                    });
                });
               
            });
           
            console.log(this.state.courseList);   

            
        }
        catch(error) {
            this.setState({readError: error.message});
        }

        
    }
    
    
    render(){
        return(
            <div>
                <div className = "courseList">
                    {
                    this.state.courseName.map(course => {
                    return( <Link to = {{
                        pathname:'/coursepage',
                        cid: course.cid,
                    }}><div className = "course"><p>{course.name}</p>-<h6>{course.creator}</h6></div></Link>)
                    })
                    }
                </div>
                <br /><br />
                <hr />
                <div className = "joinCourse">
                    <p id="jcTxt">Want to join a course? Enter a request code for the course </p> <br />
                    <form onSubmit={this.handleSubmit} id="jcForm">
                        <input onChange={this.handleChange} value={this.state.requestCode}></input>
                        {this.state.error ? <p>{this.state.writeError}</p> : null}
                        <button type="submit">Send</button>
                    </form>
                    <div id="sentState">
                    {this.state.sentState}
                    </div>
                </div>
                <hr />
                <br />
                <div id="profileLink">
                    <div id="adminPanel"><Link to="/admin">Visit Admin Section</Link></div>
                    <div id="gotoProfile"><Link to="/profile">Visit your Profile</Link></div>
                    <div id="logout"><Link to="/logout">LOGOUT</Link></div>
                </div>
                <br />
                <hr />
                <br />
            </div>
        );
    }

}


export default HomePage;