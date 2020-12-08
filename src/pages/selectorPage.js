import React, {Component} from 'react';
import {auth} from "../services/firebase";
import {db} from "../services/firebase";
import {Link, Redirect} from "react-router-dom";


const selectorPage = () => {
    var adminRef = db.ref("admin");

    adminRef.once("value", snapshot => {
        snapshot.forEach((snap) => {
            if(snap.val() === auth().currentUser.uid){
                <Redirect to = "/admin" />
            }
        });
    });

    <Redirect to = "/home" />
}

export default selectorPage;