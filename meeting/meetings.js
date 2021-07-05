// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.\


///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('subscribe-hub').addEventListener("click", onSubscribeNotificationHub, false);

document.getElementById('start-meeting').addEventListener("click", onStartMeeting, false);

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
// Call functions
///////////////////////////////
function onStartMeeting(){
    startMeeting().then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log("Start meeting failed! " + error);
    });
}

function startMeeting(){
    let url = 'https://api.intermedia.net/meetings/v1/meeting/start/details';

    return makeRequest('POST', url).then((response) => response.json());
}



///////////////////////////////
// Notifications Hub
///////////////////////////////
function onSubscribeNotificationHub(){
    createHubSubscription().then((response) => {
        buildHubConnection(response.deliveryMethod.uri);
    }).catch((error) => {
        console.log("Subscribe failed!" + error);
    });
}

function createHubSubscription(events = ["*"], ttl = "00:30:00"){
    let url = 'https://api.intermedia.net/voice/v2/subscriptions';
    let body = {
        "events": events,
        "ttl": ttl
    };

    return makeRequest('POST', url, body).then((response) => response.json());
}

function buildHubConnection(deliveryMethodUri){
    let connection = new signalR.HubConnectionBuilder()
        .configureLogging(signalR.LogLevel.Trace)
        .withUrl(deliveryMethodUri, {
            accessTokenFactory: () => getSessionToken()
        })
        .build();

    connection.on("OnEvent", data => {
        console.log(data);
        renderCallTableRow(data.eventType, data.callDirection, data.callId);
    });
    connection.on("OnCommandResult", data => {
        console.log(data);
    });
    
    // Start the connection.
    connection.start().then(() => console.log("connected")).catch(err => console.log(err));

}