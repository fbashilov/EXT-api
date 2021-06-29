// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.\

///////////////////////////////
// IIFE on load (get access token)
///////////////////////////////
(()=>{
    Oidc.Log.logger = console;
    Oidc.Log.level = Oidc.Log.DEBUG;
    console.log("Using oidc-client version: ", Oidc.Version);
    
    let url = location.href.substring(0, location.href.lastIndexOf('/'));
    
    let settings = {
        authority: localStorage.getItem('cfg-authority'),
        client_id: localStorage.getItem('cfg-clientId'),
        redirect_uri: location.href.split('?')[0],
        response_type: 'code',
        scope: localStorage.getItem('cfg-scopes'),
    
        automaticSilentRenew:false,
        validateSubOnSilentRenew: false,
    
        monitorAnonymousSession : false,
        filterProtocolClaims: false,
        monitorSession: false,
        loadUserInfo: false,
        revokeAccessTokenOnSignout : true,
    
        acr_values : localStorage.getItem('cfg-acr'),
        login_hint: localStorage.getItem('cfg-login'),
        extraTokenParams: { acr_values: localStorage.getItem('cfg-acr') }
    };

    getAccessToken(settings).then((response) => {
        setSessionToken(response);
    }).catch((error) => {
        console.log("Error!!! " + error);
    });
})();

///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('subscribe-hub').addEventListener("click", onSubscribeNotificationHub, false);

document.getElementById('get-devices').addEventListener("click", onGetDevices, false);

document.getElementById('make-call').addEventListener("click", onMakeCall, false);
document.getElementById('terminate-call').addEventListener("click", onTerminateCall, false);
document.getElementById('cancel-call').addEventListener("click", onCancelCall, false);
document.getElementById('transfer-call').addEventListener("click", onTransferCall, false);
document.getElementById('merge-call').addEventListener("click", onMergeCall, false);

///////////////////////////////
// tokens
///////////////////////////////
function getAccessToken(settings){
    return new Promise((succeed, fail) => {
        let mgr = new Oidc.UserManager(settings);

        //check for token in URL
        if (location.search.includes("code=", 1)) {
            //Response code was found in query. Trying to exchange code for token...
            mgr.signinCallback(settings).then((user) => {
                succeed(user.access_token);
            }).catch((err) => {
                log(err);
                fail(new Error("Exchange code for token failed!:" + err));
            });
        } else {    //go authorization
            log("Going to sign in using following configuration");

            mgr.signinRedirect({useReplaceToNavigate:true}).then(() => {
                log("Redirecting to AdSTS...");
            }).catch((err) => {
                log(err);
            });
        }
    });
}

function getSessionToken(){
    return sessionStorage.getItem('accessToken');
}

function setSessionToken(accessToken){
    sessionStorage.setItem('accessToken', accessToken);
}


///////////////////////////////
// Rendering functions
///////////////////////////////
function createSelectElem(parentNode, elemId, dataList, valueParam, textParam){
    //Create and append select list
    let selectList = document.createElement("select");
    selectList.id = elemId;
    parentNode.appendChild(selectList);

    //Create and append the options
    for (let i = 0; i < dataList.length; i++) {
        let option = document.createElement("option");
        option.value = dataList[i][valueParam];
        option.text = dataList[i][textParam];
        selectList.appendChild(option);
    }
}

function renderCallTableRow(eventType, callDirection, callId){
    let allCallElems = document.getElementsByClassName("calls-table-row");

    for(let i=0; i<allCallElems.length; i++){
        if(allCallElems[i].classList.contains(callId)){
            allCallElems[i].innerHTML = `<td>${eventType}</td><td>${callId}</td>`;
            return;
        }
    }

    let newCallElem = document.createElement("tr");
    newCallElem.className = `calls-table-row ${callId}`;
    newCallElem.innerHTML = `<td>${eventType}</td><td>${callId}</td>`;

    if(callDirection == "outgoing"){
        document.getElementById("outgoing-calls-table").appendChild(newCallElem);
    } else {
        document.getElementById("incoming-calls-table").appendChild(newCallElem);
    }
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
        options["body"] = JSON.stringify(body);
    }

    return fetch(url, options);
}

///////////////////////////////
// Device functions
///////////////////////////////
function onGetDevices(){
    getDevices().then((response) => {
        let devices = response["clickToCallDevices"];
        createSelectElem(document.getElementById("devices-wrapper"), "devices-select", devices, "id", "name");
    }).catch((error) => {
        console.log("Get devices failed! " + error);
    });
}

function getDevices(){
    let url = 'https://api.intermedia.net/voice/v2/devices';
    return makeRequest("GET", url).then((response) => response.json());
}

///////////////////////////////
// Call functions
///////////////////////////////
function onMakeCall(){
    let phoneNumber = document.getElementById('phone-number').value;
    let deviceId = document.getElementById('devices-select').value;

    makeCall(deviceId, phoneNumber, "placeCall").catch((error) => {
        console.log("Make call failed! " + error);
    });
}

function makeCall(deviceId, phoneNumber, mode = "placeCall", callId, commandId){
    let url = 'https://api.intermedia.net/voice/v2/calls';
    let body = {
        "deviceId": deviceId,
        "mode": mode,
        "phoneNumber": phoneNumber
    };
    if(callId) body.callId = callId;
    if(commandId) body.commandId = commandId;

    return makeRequest('POST', url, body).then((response) => response.json());
}

function onTerminateCall(){
    let callId = document.getElementById("terminate-call-id").value;
    terminateCall(callId).catch((error) => {
        console.log("Terminate failed! " + error);
    });
}

function terminateCall(callId, commandId){
    let url = `https://api.intermedia.net/voice/v2/calls/${callId}` +
        (commandId ? `/commandId=${commandId}`: ``);

    return makeRequest('DELETE', url).then((response) => response.json());
}

function onCancelCall(){
    let callId = document.getElementById("cancel-call-id").value;
    cancelCall(callId, true).catch((error) => {
        console.log("Cancel failed! " + error);
    });
}

function cancelCall(callId, skipToVoiceMail = true, commandId){
    let url = `https://api.intermedia.net/voice/v2/calls/${callId}/cancel`;
    let body = {
        "skipToVoiceMail": skipToVoiceMail
    };
    if(commandId) body.commandId = commandId;

    return makeRequest('POST', url, body).then((response) => response.json());
}

function onTransferCall(){
    let phoneNumber = document.getElementById('transfer-phone-number').value;
    let curCallId = document.getElementById("cur-call-id").value;
    transferCall(curCallId, phoneNumber).catch((error) => {
        console.log("Transfer failed! " + error);
    });
}

function transferCall(callId, phoneNumber, commandId){
    let url = `https://api.intermedia.net/voice/v2/calls/${callId}/transfer`;
    let body = {
        "phoneNumber": phoneNumber
    };
    if(commandId) body.commandId = commandId;

    return makeRequest('POST', url, body).then((response) => response.json());
}

function onMergeCall(){
    let callId1 = document.getElementById("merge-call-id-1").value;
    let callId2 = document.getElementById("merge-call-id-2").value;
    mergeCall(callId1, callId2).catch((error) => {
        console.log("Merge failed! " + error);
    });
}

function mergeCall(callId1, callId2, commandId){
    let url = `https://api.intermedia.net/voice/v2/calls/${callId1}/merge`;
    let body = {
        "mergeCallId": callId2
    };
    if(commandId) body.commandId = commandId;

    return makeRequest('POST', url, body).then((response) => response.json());
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