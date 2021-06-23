///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('authorization').addEventListener("click", authorizationS2S, false);

document.getElementById('get-call-recs').addEventListener("click", getCallRecs, false);
document.getElementById('get-call-recs-archive').addEventListener("click", getCallRecsArchive, false);
document.getElementById('get-call-recs-content').addEventListener("click", getCallRecsContent, false);

///////////////////////////////
// Auth and tokens
///////////////////////////////
function authorizationS2S(){
    let clientId = document.getElementById("client-id").value;
    let clientSecret = document.getElementById("client-secret").value;
    getS2SAccessTokenRequest(clientId, clientSecret).then(function(response) {
        setSessionToken(JSON.parse(response)["access_token"]);
        document.getElementById("access-token-out").innerText = response;
    }).catch(function(error){
        console.log("Error!!! " + error);
    });
}

function getS2SAccessTokenRequest(clientId, clientSecret, scope, grantType = "client_credentials"){
    return new Promise(function(succeed, fail) {
        let http = new XMLHttpRequest();
        let url = 'https://login.intermedia.net/user/connect/token';
        let dataObj = 
            'grant_type=' + grantType + 
            '&client_id=' + clientId + 
            '&client_secret=' + clientSecret;
        if(scope) dataObj += '&scrope' + scope;

        http.open('POST', url, true);

        //Headers
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        http.send(dataObj);

        http.onreadystatechange = function() {  //Call a function when the state changes.
            if(http.readyState == 4) {
                if(http.status < 400){
                    succeed(http.response);
                } else{
                    fail(new Error("Request failed: " + http.statusText));
                }
            }
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
function createZIPDownloadButton(binaryZip){
    let blob = new Blob(binaryZip, {type : "application/zip"});
    let button = document.getElementById("")
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = id + "." + format;
    a.click();
}
///////////////////////////////
// Call recordings functions
///////////////////////////////
function getCallRecs(){
    let accessToken = getSessionToken();
    let organizationId = document.getElementById("organization-id").value;
    let unifiedUserId = document.getElementById("unified-user-id").value;

    getCallRecsRequest(organizationId, unifiedUserId, accessToken).then(function(response) {
        //document.getElementById("access-token-out").innerText = response;
    }).catch(function(error){
        console.log("Error!!! " + error);
    });
}

function getCallRecsRequest(organizationId, unifiedUserId, accessToken, offset = 0, count = 100){
    return new Promise(function(succeed, fail) {
        let http = new XMLHttpRequest();
        let url = `https://api.intermedia.net/voice/v2/organizations/${organizationId}/users/${unifiedUserId}/call-recordings?offset=${offset}&count=${count}`;
        http.open('GET', url, true);

        //Headers
        http.setRequestHeader('Authorization', `Bearer ${accessToken}`);

        http.send();

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4) {
                if(http.status < 400){
                    succeed(http.response);
                } else{
                    fail(new Error("Request failed: " + http.statusText));
                }
            }
        }
    });
}
function getCallRecsArchive(){
    let accessToken = getSessionToken();
    let organizationId = document.getElementById("organization-id").value;
    let unifiedUserId = document.getElementById("unified-user-id").value;
    let ids = JSON.parse(document.getElementById("call-rec-id-array").value);

    getCallRecsArchiveRequest(organizationId, unifiedUserId, ids, accessToken).then(function(response) {
        document.getElementById("call-recs-zip-response").innerText = response;
    }).catch(function(error){
        console.log("Error!!! " + error);
    });
}

function getCallRecsArchiveRequest(organizationId, unifiedUserId, ids, accessToken, format = "zip"){
    return new Promise(function(succeed, fail) {
        let http = new XMLHttpRequest();
        let url = `https://api.intermedia.net/voice/v2/organizations/${organizationId}/users/${unifiedUserId}/call-recordings/_selected/_content?format=${format}`;
        let dataObj = {
            "ids": ids,
        };

        http.open('POST', url, true);

        //Headers
        http.setRequestHeader('Content-type', 'application/json');
        http.setRequestHeader('Authorization', `Bearer ${accessToken}`);

        http.send(JSON.stringify(dataObj));    

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4) {
                if(http.status < 400){
                    succeed(http.response);
                } else{
                    fail(new Error("Request failed: " + http.statusText));
                }
            }
        }
    });
}

function getCallRecsContent(){
    let accessToken = getSessionToken();
    let organizationId = document.getElementById("organization-id").value;
    let unifiedUserId = document.getElementById("unified-user-id").value;
    let callRecId = document.getElementById("call-rec-id").value;

    getCallRecsContentRequest(organizationId, unifiedUserId, callRecId, accessToken).then(function(response) {
        document.getElementById("call-rec-content-response").innerText = response;
    }).catch(function(error){
        console.log("Error!!! " + error);
    });
}

function getCallRecsContentRequest(organizationId, unifiedUserId, callRecId, accessToken){
    return new Promise(function(succeed, fail) {
        let http = new XMLHttpRequest();
        let url = `https://api.intermedia.net/voice/v2/organizations/${organizationId}/users/${unifiedUserId}/call-recordings/${callRecId}/_content`;
        http.open('GET', url, true);

        //Headers
        http.setRequestHeader('Authorization', `Bearer ${accessToken}`);

        http.send();

        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4) {
                if(http.status < 400){
                    succeed(http.response);
                } else{
                    fail(new Error("Request failed: " + http.statusText));
                }
            }
        }
    });
}