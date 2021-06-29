///////////////////////////////
// Set global variable for paging 
///////////////////////////////
let callRecsPage = 1;

///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('authorization').addEventListener("click", onAuthorizationS2S, false);

document.getElementById('get-call-recs').addEventListener("click", onGetCallRecs, false);
document.getElementById('get-call-recs-archive').addEventListener("click", onGetCallRecsArchive, false);
document.getElementById('get-call-recs-content').addEventListener("click", onGetCallRecsContent, false);

document.getElementById('prev-page-button').addEventListener("click", prevCallRecsTablePage, false);
document.getElementById('next-page-button').addEventListener("click", nextCallRecsTablePage, false);


///////////////////////////////
// Auth and tokens
///////////////////////////////
function onAuthorizationS2S(){
    let clientId = document.getElementById("client-id").value;
    let clientSecret = document.getElementById("client-secret").value;
    getS2SAccessToken(clientId, clientSecret).then(function(response) {
        setSessionToken(response["access_token"]);
        document.getElementById("access-token-out").innerText = response;
    }).catch(function(error){
        console.log("Error!!! " + error);
    });
}

function getS2SAccessToken(clientId, clientSecret, scope, grantType = "client_credentials"){
    let url = 'https://login.intermedia.net/user/connect/token';
    let body = 
        'grant_type=' + grantType + 
        '&client_id=' + clientId + 
        '&client_secret=' + clientSecret;
    if(scope) body += '&scope=' + scope;

    return makeRequest("POST", url, body, "application/x-www-form-urlencoded").then((response) => response.json());
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
    for(let i = 0; i < callRecs.length; i++){
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
    nextPageButton.innerHTML = callRecsPage + 1;
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
// Call recordings functions
///////////////////////////////
function onGetCallRecs(){
    let organizationId = document.getElementById("organization-id").value;
    let unifiedUserId = document.getElementById("unified-user-id").value;
    
    let count = 10; 
    let offset = (callRecsPage - 1) * count;

    getCallRecs(organizationId, unifiedUserId, offset, count).then((response) => {
        renderCallRecsTablePage(response["records"], count);
    }).catch((error) => {
        console.log("Get call recordings failed! " + error);
    });
}

function getCallRecs(organizationId, unifiedUserId, offset = 0, count = 100){
    let url = `https://api.intermedia.net/voice/v2/organizations/${organizationId}/users/${unifiedUserId}/call-recordings?offset=${offset}&count=${count}`;
    return makeRequest("GET", url).then((response) => response.json());
}

function onGetCallRecsArchive(){
    let organizationId = document.getElementById("organization-id").value;
    let unifiedUserId = document.getElementById("unified-user-id").value;
    let ids = JSON.parse(document.getElementById("call-rec-id-array").value);

    getCallRecsArchive(organizationId, unifiedUserId, ids).then((response) => {
        createFileDownloadLinkElem(response, "application/zip", "zip", `callRecs${ids}`, "get-call-recs-archive-block");
    }).catch((error) => {
        console.log("Get call recordings archive failed! " + error);
    });
}

function getCallRecsArchive(organizationId, unifiedUserId, ids, format = "zip"){
        let url = `https://api.intermedia.net/voice/v2/organizations/${organizationId}/users/${unifiedUserId}/call-recordings/_selected/_content?format=${format}`;
        let body = {
            "ids": ids,
        };

        return makeRequest("POST", url, body).then((response) => response.arrayBuffer());
}

function onGetCallRecsContent(){
    let organizationId = document.getElementById("organization-id").value;
    let unifiedUserId = document.getElementById("unified-user-id").value;
    let callRecId = document.getElementById("call-rec-id").value;

    getCallRecsContent(organizationId, unifiedUserId, callRecId).then((response) => {
        createFileDownloadLinkElem(response, "audio/mpeg", "mp3", `callRecord${callRecId}`, "get-call-recs-content-block");
    }).catch((error) => {
        console.log("Get call recordings content failed!  " + error);
    });
}

function getCallRecsContent(organizationId, unifiedUserId, callRecId){
    let url = `https://api.intermedia.net/voice/v2/organizations/${organizationId}/users/${unifiedUserId}/call-recordings/${callRecId}/_content`;
    return makeRequest("GET", url, body).then((response) => response.arrayBuffer());
}
