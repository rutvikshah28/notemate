import React, {Component} from 'react';
import {auth} from "../services/firebase";
import {db} from "../services/firebase";
import {storage} from "../services/firebase";
import {Link, Redirect} from "react-router-dom";

class adminPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: auth().currentUser,
            isAdmin: false,
            loading: true,
            courseList: [],
            courseCreate: "",
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

   async handleChange(event) {
        console.log(event.target.value);
        await this.setState({courseCreate: event.target.value});
        console.log(this.state.courseCreate);
    }

    async handleSubmit(event) {
        event.preventDefault();
        var toAdd = true;
        if(this.state.courseCreate !== ""){
            //We might have to add the couse

           await this.state.courseList.forEach((course) => {
                if(this.state.courseCreate === course.name) {
                    toAdd = false;
                }
            });

            //Since the name is not in our courseList, we add to database a new course.
            if(toAdd === true) {
                console.log(this.state.courseCreate);
                await db.ref("courses").push({
                    courseName: this.state.courseCreate,
                    users: [this.state.user.uid],
                    courseCreator: this.state.user.email,
                });

                var newCid;
                await db.ref("courses").on("value", snapshot => {
                    snapshot.forEach((snap) => {
                        snap.forEach((snap1) => {
                            if(snap1.key === "courseName" && this.state.courseCreate === snap1.val()) {
                                newCid = snap.key;
                            }
                        });
                    });
                });

                await db.ref("users/"+this.state.user.uid+"/courseID").child(newCid).set({textbookAccess:true, chatAccess:true});
            }
        }
    }
    async checkAdmin() {
        var adminRef = db.ref("admin");

        await adminRef.once("value", snapshot => {
            snapshot.forEach((snap) => {
                if(snap.val() === this.state.user.uid) {
                    console.log("Admin check is true");
                    this.setState({isAdmin: true});
                }
            });
        });

        this.setState({loading: false});
    }

   async componentDidMount() {
        await this.checkAdmin();
        
        await db.ref("courses").on("value", snapshot => {
            var courseList = [];
            snapshot.forEach((snap) => {
                var course = {};
                course.cid = snap.key;
                snap.forEach((snap1) => {
                    console.log(snap1.key);
                    if(snap1.key === "courseName") {
                        course.name = snap1.val();
                        courseList.push(course);
                        this.setState({courseList: courseList});
                    }
                });
                
                
            });
           
        });
        
    }

     render() {
       return this.state.loading === true ? <h2>Authenticating admin priviliges...</h2> : 
       (
           this.state.isAdmin === true ? (
           <div id="Admin">
               <div id="AdminCourseList">
                    {
                    this.state.courseList.map(course => {
                        return(<div className = "Admincourse"> <Link to = {{
                            pathname:'/editcourse',
                            cid: course.cid,
                            }}>{course.name} </Link></div>)
                        })
                    }
                    
               </div>
               <div id="createCourse">
               <hr /> <br />
                   <center><h4>Want to create a course?</h4></center>
                   <input type="text" onChange={this.handleChange} placeholder="Enter unique course Name" />
                   <button onClick = {this.handleSubmit}>Create a course</button>
               </div>
            </div>
            ) : <Redirect to ="/" />
       )
    }
}


export default adminPage;