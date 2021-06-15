// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('clearState').addEventListener("click", clearState, false);
document.getElementById('getUser').addEventListener("click", getUser, false);
document.getElementById('removeUser').addEventListener("click", removeUser, false);
//document.getElementById('querySessionStatus').addEventListener("click", querySessionStatus, false);

//document.getElementById('startSigninMainWindow').addEventListener("click", startSigninMainWindow, false);
//document.getElementById('endSigninMainWindow').addEventListener("click", endSigninMainWindow, false);
//document.getElementById('startSigninMainWindowDiffCallbackPage').addEventListener("click", startSigninMainWindowDiffCallbackPage, false);

//document.getElementById('popupSignin').addEventListener("click", popupSignin, false);
document.getElementById('iframeSignin').addEventListener("click", iframeSignin, false);

//document.getElementById('startSignoutMainWindow').addEventListener("click", startSignoutMainWindow, false);
//document.getElementById('endSignoutMainWindow').addEventListener("click", endSignoutMainWindow, false);

//document.getElementById('popupSignout').addEventListener("click", popupSignout, false);
document.getElementById('make-call').addEventListener("click", makeCall, false);
document.getElementById('terminate-call').addEventListener("click", terminateCall, false);
document.getElementById('cancel-call').addEventListener("click", cancelCall, false);
document.getElementById('transfer-call').addEventListener("click", transferCall, false);

///////////////////////////////
// config
///////////////////////////////
Oidc.Log.logger = console;
Oidc.Log.level = Oidc.Log.DEBUG;
console.log("Using oidc-client version: ", Oidc.Version);

var url = location.href.substring(0, location.href.lastIndexOf('/'));

var settings = {
    authority: localStorage.getItem('cfg-authority'),
    client_id: localStorage.getItem('cfg-clientId'),
    //client_id: 'interactive.public.short',
    redirect_uri: location.href.split('?')[0],
    // post_logout_redirect_uri: url + '/code-identityserver-sample.html',
    response_type: 'code',
    //response_mode: 'fragment',
    scope: localStorage.getItem('cfg-scopes'),
    //scope: 'openid profile api offline_access',
    //popup_redirect_uri: url + '/code-identityserver-sample-popup-signin.html',
    //popup_post_logout_redirect_uri: url + '/code-identityserver-sample-popup-signout.html',
    //silent_redirect_uri: url + '/code-identityserver-sample-silent.html',
    automaticSilentRenew:false,
    validateSubOnSilentRenew: false,
    //silentRequestTimeout:10000,
    monitorAnonymousSession : false,
    filterProtocolClaims: false,
    monitorSession: false,
    loadUserInfo: false,
    revokeAccessTokenOnSignout : true,
    acr_values : localStorage.getItem('cfg-acr'),
    login_hint: localStorage.getItem('cfg-login'),
    extraTokenParams: { acr_values: localStorage.getItem('cfg-acr') }
};
var mgr = new Oidc.UserManager(settings);

///////////////////////////////
// events
///////////////////////////////
mgr.events.addAccessTokenExpiring(function () {
    console.log("token expiring");
    log("token expiring");

    // maybe do this code manually if automaticSilentRenew doesn't work for you
    mgr.signinSilent().then(function(user) {
        log("silent renew success", user);
    }).catch(function(e) {
        log("silent renew error", e.message);
    })
});

mgr.events.addAccessTokenExpired(function () {
    console.log("token expired");
    log("token expired");
});

mgr.events.addSilentRenewError(function (e) {
    console.log("silent renew error", e.message);
    log("silent renew error", e.message);
});

mgr.events.addUserLoaded(function (user) {
    setToken(user.access_token);
    renderCallForm();

    console.log("user loaded", user);
    mgr.getUser().then(function(){
       console.log("getUser loaded user after userLoaded event fired"); 
    });
});

mgr.events.addUserUnloaded(function (e) {
    console.log("user unloaded");
});

mgr.events.addUserSignedIn(function (e) {
    log("user logged in to the token server");
});
mgr.events.addUserSignedOut(function (e) {
    log("user logged out of the token server");
});

if (location.search.includes("code=", 1)) {
    log("Response code was found in query!");
    endSigninMainWindow();
} else {
    log("Going to sign in using following configuration", settings);
    startSigninMainWindow();
}

///////////////////////////////
// functions for UI elements
///////////////////////////////
function clearState(){
    mgr.clearStaleState().then(function(){
        log("clearStateState success");
    }).catch(function(e){
        log("clearStateState error", e.message);
    });
}

function getUser() {
    mgr.getUser().then(function(user) {
        log("got user", user);
    }).catch(function(err) {
        log(err);
    });
}

function removeUser() {
    mgr.removeUser().then(function() {
        log("user removed");
    }).catch(function(err) {
        log(err);
    });
}

function startSigninMainWindow() {
    mgr.signinRedirect({useReplaceToNavigate:true}).then(function() {
        log("Redirecting to AdSTS...");
    }).catch(function(err) {
        log(err);
    });
}

function endSigninMainWindow() {
    log("Trying to exchange code for token...");
    mgr.signinCallback(settings).then(function(user) {
        log("signed in", user);
        log("Decoded access_token:", jwt_decode(user.access_token))
    }).catch(function(err) {
        log(err);
    });
}

function startSigninMainWindowDiffCallbackPage() {
    mgr.signinRedirect({state:'some data', redirect_uri: url + '/code-identityserver-sample-callback.html'}).then(function() {
        log("signinRedirect done");
    }).catch(function(err) {
        log(err);
    });
}

function popupSignin() {
    mgr.signinPopup({state:'some data'}).then(function(user) {
        log("Signed in with token:", user);
    }).catch(function(err) {
        log(err);
    });
}

function popupSignout() {
    mgr.signoutPopup({state:'some data'}).then(function() {
        log("signed out");
    }).catch(function(err) {
        log(err);
    });
}

function iframeSignin() {
    log("Trying to refresh token...");
    mgr.signinSilent(settings).then(function(user) {
        log("Refreshed token: ", user);
        log("Decoded refreshed access_token:", jwt_decode(user.access_token))
    }).catch(function(err) {
        log(err);
    });
}

function querySessionStatus() {
    mgr.querySessionStatus().then(function(status) {
        log("user's session status", status);
    }).catch(function(err) {
        log(err);
    });
}

function startSignoutMainWindow(){
    mgr.signoutRedirect({state:'some data'}).then(function(resp) {
    //mgr.signoutRedirect().then(function(resp) {
            log("signed out", resp);
    }).catch(function(err) {
        log(err);
    });
};

function endSignoutMainWindow(){
    mgr.signoutCallback().then(function(resp) {
        log("signed out", resp);
    }).catch(function(err) {
        log(err);
    });
};



///////////////////////////////
// tokens
///////////////////////////////
function getToken(){
    return localStorage.getItem('accessToken');
}

function setToken(accessToken){
    localStorage.setItem('accessToken', accessToken);
}


///////////////////////////////
// Rendering functions
///////////////////////////////
function renderCallForm(){
    let accessToken = getToken();

    getDevices(accessToken).then(function(response) {
        let devices = JSON.parse(response)["clickToCallDevices"];
        createSelectElem(document.getElementById("devices-wrapper"), "devices-select", devices, "id", "name");
        document.getElementById("call-window").style.display = 'block';   //show call form
    }).catch(function(error){
        console.log("Error!!!");
        console.log(error);
    });
}

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

///////////////////////////////
// Device functions
///////////////////////////////
function getDevices(accessToken) {
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
function getCurrentCall(){
    return JSON.parse(localStorage.getItem('currentCall'));
}

function setCurrentCall(currentCall){
    clearCurrentCall();

    if(typeof currentCall != "string"){
        currentCall = JSON.stringify(currentCall);
    }
    
    localStorage.setItem('currentCall', currentCall);    //save
    
    document.getElementById("make-call-response").innerHTML = `Calling...\n${currentCall}`;    //render
    Array.prototype.forEach.call(document.getElementsByClassName("show-during-call"), function(element) {
        element.style.display = "block";
    });
    document.getElementById("call-form").style.display = "none";
}

function clearCurrentCall(){
    localStorage.removeItem('currentCall');

    document.getElementById("make-call-response").innerHTML = "No call";    //render 
    Array.prototype.forEach.call(document.getElementsByClassName("show-during-call"), function(element) {
        element.style.display = "none";
    });
    document.getElementById("call-form").style.display = "block";
}

function makeCall(){
    let accessToken = getToken();
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
                setCurrentCall(http.responseText);
            } else{
                document.getElementById("make-call-response").innerHTML = `Calling failed! ` + http.responseText;    //render message
            }
        }
    }
}

function terminateCall(){
    let accessToken = getToken();
    let curCall = getCurrentCall();
    terminateCallRequest(curCall["callId"], accessToken);
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
                clearCurrentCall();
            } else{
                document.getElementById("make-call-response").innerHTML = `Terminate call failed! ` + http.responseText;    //render message
            }
        }
    }
}

function cancelCall(){
    let accessToken = getToken();
    //need cur INCOMING call
    let curCall = getCurrentCall();
    cancelCallRequest(curCall["callId"], accessToken, true);
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
                clearCurrentCall();
            } else{
                document.getElementById("make-call-response").innerHTML = `Terminate call failed! ` + http.responseText;    //render message
            }
        }
    }
}

function transferCall(){
    let accessToken = getToken();
    let phoneNumber = document.getElementById('transfer-phone-number').value;
    let curCall = getCurrentCall();
    transferCall(curCall["callId"], phoneNumber, accessToken);
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

    http.send(dataRaw);

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4) {
            if(http.status < 400){
                setCurrentCall(http.responseText);
            } else{
                document.getElementById("make-call-response").innerHTML = `Calling failed! ` + http.responseText;    //render message
            }
        }
    }
}



