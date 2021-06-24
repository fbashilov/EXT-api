///////////////////////////////
// Set global variable for paging 
///////////////////////////////
let callRecsPage = 1;

///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('authorization').addEventListener("click", authorizationS2S, false);

document.getElementById('get-call-recs').addEventListener("click", getCallRecs, false);
document.getElementById('get-call-recs-archive').addEventListener("click", getCallRecsArchive, false);
document.getElementById('get-call-recs-content').addEventListener("click", getCallRecsContent, false);

document.getElementById('prev-page-button').addEventListener("click", prevCallRecsTablePage, false);
document.getElementById('next-page-button').addEventListener("click", nextCallRecsTablePage, false);


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
function createFileDownloadLinkElem(binaryCode, mimeType, extension, fileName, parentNodeId){
    let blob = new Blob([binaryCode], {type : mimeType});
    let linkElem = document.createElement("a");
    linkElem.href = URL.createObjectURL(blob);
    linkElem.download = `${fileName}.${extension}`;
    linkElem.textContent = `Download ${fileName}`;
    document.getElementById(parentNodeId).appendChild(linkElem);
}

function prevCallRecsTablePage(){
    callRecsPage--;
    getCallRecs();
}

function nextCallRecsTablePage(){
    callRecsPage++;
    getCallRecs();
}

function renderCallRecsTablePage(callRecs, count){
    //delete old table rows
    let oldTableRows = document.getElementsByClassName('recs-table-row');
    while(oldTableRows[0]){
        oldTableRows[0].parentNode.removeChild(oldTableRows[0]);
    }
    //create new table rows
    let trElem;
    for(let i = 0; i < callRecs.length && i < count - 1; i++){
        trElem = document.createElement("tr");
        trElem.className = `recs-table-row`;
        trElem.innerHTML = `
            <td>${callRecs[i]["id"]}</td>
            <td>${callRecs[i]["caller"]["phoneNumber"]}</td>
            <td>${callRecs[i]["duration"]}</td>
            <td>${callRecs[i]["whenCreated"]}</td>`;
    
        document.getElementById("recs-table").appendChild(trElem);
    }
    //reset navbar
    let prevPageButton = document.getElementById("prev-page-button");
    let currentPage = document.getElementById("current-page");
    let nextPageButton = document.getElementById("next-page-button");

    prevPageButton.innerHTML = (callRecsPage > 1) ? callRecsPage - 1 : "";
    currentPage.innerHTML = callRecsPage;
    //'count' is one more to check if next page exist
    nextPageButton.innerHTML = (callRecs.length == count) ? callRecsPage + 1 : "";
}

///////////////////////////////
// Call recordings functions
///////////////////////////////
function getCallRecs(){
    let accessToken = getSessionToken();
    let organizationId = document.getElementById("organization-id").value;
    let unifiedUserId = document.getElementById("unified-user-id").value;
    
    let count = 11; //take one more to check if next page exist
    let offset = (callRecsPage - 1) * (count - 1);

    getCallRecsRequest(organizationId, unifiedUserId, accessToken, offset, count).then(function(response) {
        renderCallRecsTablePage(JSON.parse(response)["records"], count);
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
        createFileDownloadLinkElem(response, "application/zip", "zip", `callRecs${ids}`, "get-call-recs-archive-block");
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

        http.responseType = "arraybuffer";

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
        createFileDownloadLinkElem(response, "audio/mpeg", "mp3", `callRecord${callRecId}`, "get-call-recs-content-block");
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

        http.responseType = "arraybuffer";

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
