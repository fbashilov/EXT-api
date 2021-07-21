// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.\

//////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('get-avatar').addEventListener("click", onGetAvatar, false);

document.getElementById('get-multiple-avatars').addEventListener("click", onGetMultipleAvatars, false);

///////////////////////////////
// tokens
///////////////////////////////
function getSessionToken(){
    return sessionStorage.getItem('accessToken');
}

function setSessionToken(accessToken){
    sessionStorage.setItem('accessToken', accessToken);
}


///////////////////////////////
// Rendering functions
///////////////////////////////
function renderAvatarImg(byteCode, parentNode){
    let imgElem = document.createElement("img");
    imgElem.src = `data:image/jpg;base64, ${byteCode}`;
    parentNode.appendChild(imgElem);
}

///////////////////////////////
// Avatar functions
///////////////////////////////
function onGetAvatar(){
    let avatarId = document.getElementById('avatar-id').value;

    getAvatar(avatarId).then((response) =>{
        document.getElementById("get-avatar-output").innerHTML = "";
        renderAvatarImg(response["avatar"], document.getElementById("get-avatar-output"));
    }).catch((error) => {
        console.log("Get avatar failed! " + error);
    });
}

function onGetMultipleAvatars(){
    let avatarIds = document.getElementById("avatar-ids").value.split(/\s*,\s*/);
    getMultipleAvatars(avatarIds).then((response) =>{
        document.getElementById("get-multiple-avatars-output").innerHTML = "";
        response["results"].forEach(element => {
            renderAvatarImg(element["avatar"], document.getElementById("get-multiple-avatars-output"));
        });
    }).catch((error) => {
        console.log("Get multiple avatar failed! " + error);
    });
}

