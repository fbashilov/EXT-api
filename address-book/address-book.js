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
    parentNode.innerHTML = "";
    parentNode.appendChild(imgElem);
}

///////////////////////////////
// Make request factory
///////////////////////////////
function makeRequest(method, url, body, reqContentType = "application/json"){
    let options = {
        method: method,
        headers: {
            'Authorization': `Bearer ${getSessionToken()}`
        }
    };

    if(body){
        options["headers"]["Content-Type"] = reqContentType;
        if(typeof body != 'string') 
            body = JSON.stringify(body);
        options["body"] = body;
    }

    return fetch(url, options);
}

///////////////////////////////
// Avatar functions
///////////////////////////////
function onGetAvatar(){
    let avatarId = document.getElementById('avatar-id').value;

    getAvatar(avatarId).then((response) =>{
        renderAvatarImg(response["avatar"], document.getElementById("get-avatar-output"));
    }).catch((error) => {
        console.log("Get avatar failed! " + error);
    });
}

function getAvatar(avatarId){
    let url = `https://api.intermedia.net/address-book/v3/avatars/${avatarId}`;

    return makeRequest('GET', url).then((response) => response.json());
}

function onGetMultipleAvatars(){
    let avatarIds = document.getElementById("avatar-ids").value.split(/\s*,\s*/);
    getMultipleAvatars(avatarIds).then((response) =>{
        response["results"].forEach(element => {
            renderAvatarImg(element["avatar"], document.getElementById("get-multiple-avatars-output"));
        });
    }).catch((error) => {
        console.log("Get multiple avatar failed! " + error);
    });
}

function getMultipleAvatars(avatarIds){
    let url = `https://api.intermedia.net/address-book/v3/avatars/_search`;
    let body = {
        "avatarIds": avatarIds,
    };
    return makeRequest('POST', url, body).then((response) => response.json());
}
 