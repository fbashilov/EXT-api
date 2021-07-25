//////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('subscribe-hub').addEventListener("click", onSubscribeNotificationHub, false);

document.getElementById('get-devices').addEventListener("click", onGetDevices, false);

document.getElementById('make-call').addEventListener("click", onMakeCall, false);
document.getElementById('terminate-call').addEventListener("click", onTerminateCall, false);
document.getElementById('cancel-call').addEventListener("click", onCancelCall, false);
document.getElementById('transfer-call').addEventListener("click", onTransferCall, false);
document.getElementById('warm-transfer-call').addEventListener("click", onWarmTransferCall, false);

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
function onGetDevices(){
    getDevices().then((response) => {
        let devices = response["clickToCallDevices"];
        createSelectElem(document.getElementById("devices-wrapper"), "devices-select", devices, "id", "name");
    }).catch((error) => {
        console.log("Get devices failed! " + error);
    });
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

function onTerminateCall(){
    let callId = document.getElementById("terminate-call-id").value;
    terminateCall(callId).catch((error) => {
        console.log("Terminate failed! " + error);
    });
}

function onCancelCall(){
    let callId = document.getElementById("cancel-call-id").value;
    cancelCall(callId, true).catch((error) => {
        console.log("Cancel failed! " + error);
    });
}

function onTransferCall(){
    let phoneNumber = document.getElementById('transfer-phone-number').value;
    let curCallId = document.getElementById("cur-call-id").value;
    transferCall(curCallId, phoneNumber).catch((error) => {
        console.log("Transfer failed! " + error);
    });
}

function onWarmTransferCall(){
    let callId1 = document.getElementById("warm-transfer-call-id-1").value;
    let callId2 = document.getElementById("warm-transfer-call-id-2").value;
    warmTransferCall(callId1, callId2).catch((error) => {
        console.log("Warm transfer failed! " + error);
    });
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
