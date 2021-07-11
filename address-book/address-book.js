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
// function renderCallTableRow(eventType, callDirection, callId){
//     let allCallElems = document.getElementsByClassName("calls-table-row");

//     for(let i=0; i<allCallElems.length; i++){
//         if(allCallElems[i].classList.contains(callId)){
//             allCallElems[i].innerHTML = `<td>${eventType}</td><td>${callId}</td>`;
//             return;
//         }
//     }

//     let newCallElem = document.createElement("tr");
//     newCallElem.className = `calls-table-row ${callId}`;
//     newCallElem.innerHTML = `<td>${eventType}</td><td>${callId}</td>`;

//     if(callDirection == "outgoing"){
//         document.getElementById("outgoing-calls-table").appendChild(newCallElem);
//     } else {
//         document.getElementById("incoming-calls-table").appendChild(newCallElem);
//     }
// }

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

    getAvatar(avatarId).catch((error) => {
        console.log("Get avatar failed! " + error);
    });
}

function getAvatar(avatarId){
    let url = `https://api.intermedia.net/address-book/v3/avatars/${avatarId}`;

    return makeRequest('GET', url).then((response) => response.json());
}

function onGetMultipleAvatars(){
    let avatarIds = JSON.parse(document.getElementById("avatar-ids").value);
    getMultipleAvatars(avatarIds).catch((error) => {
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
 