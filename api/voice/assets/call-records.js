///////////////////////////////
// Set global variable for paging 
///////////////////////////////
let curCallRecsPage = 1;

///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('get-call-recs').addEventListener("click", () => onGetCallRecs(1), false);
document.getElementById('get-call-recs-archive').addEventListener("click", onGetCallRecsArchive, false);
document.getElementById('get-call-recs-content').addEventListener("click", onGetCallRecsContent, false);

document.getElementById('prev-page-button').addEventListener("click", prevCallRecsTablePage, false);
document.getElementById('next-page-button').addEventListener("click", nextCallRecsTablePage, false);


///////////////////////////////
// Tokens
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
function createFileDownloadLinkElem(binaryCode, mimeType, extension, fileName, parentNodeId){
    let blob = new Blob([binaryCode], {type : mimeType});
    let linkElem = document.createElement("a");
    linkElem.href = URL.createObjectURL(blob);
    linkElem.download = `${fileName}.${extension}`;
    linkElem.textContent = `Download ${fileName}`;
    document.getElementById(parentNodeId).appendChild(linkElem);
}

function prevCallRecsTablePage(){
    onGetCallRecs(curCallRecsPage - 1);
}

function nextCallRecsTablePage(){
    onGetCallRecs(curCallRecsPage + 1);
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

    if(curCallRecsPage > 1){
        prevPageButton.innerHTML = curCallRecsPage - 1;
        prevPageButton.hidden = false;
    } else{
        prevPageButton.hidden = true;
    }

    currentPage.innerHTML = curCallRecsPage;
    nextPageButton.innerHTML = curCallRecsPage + 1;
}

///////////////////////////////
// Call recordings functions
///////////////////////////////
function onGetCallRecs(pageNumber){
    let organizationId = document.getElementById("organization-id").value;
    let unifiedUserId = document.getElementById("unified-user-id").value;
    
    let count = 10; 
    let offset = (pageNumber - 1) * count;

    getCallRecs(organizationId, unifiedUserId, offset, count).then((response) => {
        if(response["records"]){
            curCallRecsPage = pageNumber;
            renderCallRecsTablePage(response["records"], count);
        }
    }).catch((error) => {
        console.log("Get call recordings failed! " + error);
    });
}

function onGetCallRecsArchive(){
    let organizationId = document.getElementById("organization-id").value;
    let unifiedUserId = document.getElementById("unified-user-id").value;
    let ids = document.getElementById("call-rec-id-array").value.split(/\s*,\s*/);

    getCallRecsArchive(organizationId, unifiedUserId, ids).then((response) => {
        createFileDownloadLinkElem(response, "application/zip", "zip", `callRecs${ids}`, "get-call-recs-archive-block");
    }).catch((error) => {
        console.log("Get call recordings archive failed! " + error);
    });
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