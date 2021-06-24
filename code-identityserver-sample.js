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

    getAccessToken(settings).then(function(response) {
        setSessionToken(response);
    }).catch(function(error){
        console.log("Error!!! " + error);
    });
})();

///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('subscribe-hub').addEventListener("click", subscribeNotificationHub, false);

document.getElementById('get-devices').addEventListener("click", getDevices, false);

document.getElementById('make-call').addEventListener("click", makeCall, false);
document.getElementById('terminate-call').addEventListener("click", terminateCall, false);
document.getElementById('cancel-call').addEventListener("click", cancelCall, false);
document.getElementById('transfer-call').addEventListener("click", transferCall, false);
document.getElementById('merge-call').addEventListener("click", mergeCall, false);

///////////////////////////////
// tokens
///////////////////////////////
function getAccessToken(settings){
    return new Promise(function(succeed, fail) {
        let mgr = new Oidc.UserManager(settings);

        //check for token in URL
        if (location.search.includes("code=", 1)) {
            //Response code was found in query. Trying to exchange code for token...
            mgr.signinCallback(settings).then(function(user) {
                succeed(user.access_token);
            }).catch(function(err) {
                log(err);
                fail(new Error("Exchange code for token failed!:" + err));
            });
        } else {    //go authorization
            log("Going to sign in using following configuration");

            mgr.signinRedirect({useReplaceToNavigate:true}).then(function() {
                log("Redirecting to AdSTS...");
            }).catch(function(err) {
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
// Device functions
///////////////////////////////
function getDevices(){
    let accessToken = getSessionToken();

    getDevicesRequest(accessToken).then(function(response) {
        let devices = JSON.parse(response)["clickToCallDevices"];
        createSelectElem(document.getElementById("devices-wrapper"), "devices-select", devices, "id", "name");
    }).catch(function(error){
        console.log("Error!!! " + error);
    });
}

function getDevicesRequest(accessToken) {
    return new Promise(function(succeed, fail) {
      let http = new XMLHttpRequest();
      let url = 'https://api.intermedia.net/voice/v2/devices';
      http.open("GET", url, true);

      http.setRequestHeader('Authorization', `Bearer ${accessToken}`);

      http.addEventListener("load", function() {
        if (http.status < 400)
          succeed(http.response);
        else
          fail(new Error("Request failed: " + http.statusText));
      });
      http.addEventListener("error", function() {
        fail(new Error("Network error"));
      });
      http.send();
    });
}

///////////////////////////////
// Call functions
///////////////////////////////
function makeCall(){
    let accessToken = getSessionToken();
    let phoneNumber = document.getElementById('phone-number').value;
    let deviceId = document.getElementById('devices-select').value;

    makeCallRequest(deviceId, phoneNumber, accessToken, "placeCall");
}

function makeCallRequest(deviceId, phoneNumber, accessToken, mode = "placeCall", callId, commandId){
    let http = new XMLHttpRequest();
    let url = 'https://api.intermedia.net/voice/v2/calls';
    let dataObj = {
        "deviceId": deviceId,
        "mode": mode,
        "phoneNumber": phoneNumber
    };
    if(callId) dataObj.callId = callId;
    if(commandId) dataObj.commandId = commandId;

    http.open('POST', url, true);

    //Headers
    http.setRequestHeader('Content-type', 'application/json');
    http.setRequestHeader('Authorization', `Bearer ${accessToken}`);

    http.send(JSON.stringify(dataObj));

    http.onreadystatechange = function() {  //Call a function when the state changes.
        if(http.readyState == 4) {
            if(http.status < 400){
                console.log(http.responseText);
            } else{
                console.log(`Calling failed! ` + http.responseText);
            }
        }
    }
}

function terminateCall(){
    let accessToken = getSessionToken();
    let callId = document.getElementById("terminate-call-id").value;
    terminateCallRequest(callId, accessToken);
}

function terminateCallRequest(callId, accessToken, commandId){
    let http = new XMLHttpRequest();
    let url = `https://api.intermedia.net/voice/v2/calls/${callId}` +
        (commandId ? `/commandId=${commandId}`: ``);

    http.open('DELETE', url, true);

    //Headers
    http.setRequestHeader('Authorization', `Bearer ${accessToken}`);

    http.send();

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4) {
            if(http.status < 400){
                console.log(http.responseText);
            } else{
                console.log(`Terminate failed! ` + http.responseText);    //render message
            }
        }
    }
}

function cancelCall(){
    let accessToken = getSessionToken();
    let callId = document.getElementById("cancel-call-id").value;
    cancelCallRequest(callId, accessToken, true);
}

function cancelCallRequest(callId, accessToken, skipToVoiceMail = true, commandId){
    let http = new XMLHttpRequest();
    let url = `https://api.intermedia.net/voice/v2/calls/${callId}/cancel`;
    let dataObj = {
        "skipToVoiceMail": skipToVoiceMail
    };
    if(commandId) dataObj.commandId = commandId;

    http.open('POST', url, true);

    //Headers
    http.setRequestHeader('Content-type', 'application/json');
    http.setRequestHeader('Authorization', `Bearer ${accessToken}`);

    http.send(JSON.stringify(dataObj));

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4) {
            if(http.status < 400){
                console.log(http.responseText);
            } else{
                console.log(`Cancel failed! ` + http.responseText);    //render message
            }
        }
    }
}

function transferCall(){
    let accessToken = getSessionToken();
    let phoneNumber = document.getElementById('transfer-phone-number').value;
    let curCallId = document.getElementById("cur-call-id").value;
    transferCallRequest(curCallId, phoneNumber, accessToken);
}

function transferCallRequest(callId, phoneNumber, accessToken, commandId){
    let http = new XMLHttpRequest();
    let url = `https://api.intermedia.net/voice/v2/calls/${callId}/transfer`;
    let dataObj = {
        "phoneNumber": phoneNumber
    };
    if(commandId) dataObj.commandId = commandId;

    http.open('POST', url, true);

    //Headers
    http.setRequestHeader('Content-type', 'application/json');
    http.setRequestHeader('Authorization', `Bearer ${accessToken}`);

    http.send(JSON.stringify(dataObj));

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4) {
            if(http.status < 400){
                console.log(http.responseText);
            } else{
                console.log(`Transfer failed! ` + http.responseText);    //render message
            }
        }
    }
}

function mergeCall(){
    let accessToken = getSessionToken();
    let callId1 = document.getElementById("merge-call-id-1").value;
    let callId2 = document.getElementById("merge-call-id-2").value;
    mergeCallRequest(callId1, callId2, accessToken);
}

function mergeCallRequest(callId1, callId2, accessToken, commandId){
    let http = new XMLHttpRequest();
    let url = `https://api.intermedia.net/voice/v2/calls/${callId1}/merge`;
    let dataObj = {
        "mergeCallId": callId2
    };
    if(commandId) dataObj.commandId = commandId;

    http.open('POST', url, true);

    //Headers
    http.setRequestHeader('Content-type', 'application/json');
    http.setRequestHeader('Authorization', `Bearer ${accessToken}`);

    http.send(JSON.stringify(dataObj));

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4) {
            if(http.status < 400){
                console.log(http.responseText);
            } else{
                console.log(`Merge failed! ` + http.responseText);    //render message
            }
        }
    }
}


///////////////////////////////
// Notifications Hub
///////////////////////////////
function subscribeNotificationHub(){
    let accessToken = getSessionToken();

    createSubscriptionRequest(accessToken).then(function(response) {
        buildHubConnection(JSON.parse(response).deliveryMethod.uri, accessToken);
    }).catch(function(error){
        console.log("Error!!! Subscripe failed");
        console.log(error);
    });
}

function createSubscriptionRequest(accessToken, events = ["*"], ttl = "00:30:00"){
    return new Promise(function(succeed, fail) {
        let http = new XMLHttpRequest();
        let url = 'https://api.intermedia.net/voice/v2/subscriptions';
        let dataObj = {
            "events": events,
            "ttl": ttl
        };

        http.open("POST", url, true);
  
        //Headers
        http.setRequestHeader('Content-type', 'application/json');
        http.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  
        http.send(JSON.stringify(dataObj));

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4) {
                if (http.status < 400){
                    succeed(http.responseText);
                } else{
                    fail(new Error("Request failed: " + http.statusText));
                }
            }
        }
      });
}

function buildHubConnection(deliveryMethodUri, accessToken){
    let connection = new signalR.HubConnectionBuilder()
        .configureLogging(signalR.LogLevel.Trace)
        .withUrl(deliveryMethodUri, {
            accessTokenFactory: () => accessToken,
            skipNegotiation: true
        })
        .build();

    async function start() {
        try {
            await connection.start();
            console.log("connected");
        } catch (err) {
            console.log(err);
            setTimeout(() => start(), 3000);
        }
    };

    connection.on("OnEvent", data => {
        console.log(data);
        renderCallTableRow(data.eventType, data.callDirection, data.callId);
    });
    connection.on("OnCommandResult", data => {
        console.log(data);
    });

    connection.onclose(async () => {
        await start();
    });
    
    // Start the connection.
    start();
}


