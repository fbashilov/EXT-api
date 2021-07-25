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

function getDevices(){
    let url = 'https://api.intermedia.net/voice/v2/devices';
    return makeRequest("GET", url).then((response) => response.json());
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

function terminateCall(callId, commandId){
    let url = `https://api.intermedia.net/voice/v2/calls/${callId}` +
        (commandId ? `/commandId=${commandId}`: ``);

    return makeRequest('DELETE', url).then((response) => response.json());
}

function cancelCall(callId, skipToVoiceMail = true, commandId){
    let url = `https://api.intermedia.net/voice/v2/calls/${callId}/cancel`;
    let body = {
        "skipToVoiceMail": skipToVoiceMail
    };
    if(commandId) body.commandId = commandId;

    return makeRequest('POST', url, body).then((response) => response.json());
}

function transferCall(callId, phoneNumber, commandId){
    let url = `https://api.intermedia.net/voice/v2/calls/${callId}/transfer`;
    let body = {
        "phoneNumber": phoneNumber
    };
    if(commandId) body.commandId = commandId;

    return makeRequest('POST', url, body).then((response) => response.json());
}

function warmTransferCall(callId1, callId2, commandId){
    let url = `https://api.elevate.services/voice/v2/calls/${callId1}/merge`;
    let body = {
        "mergeCallId": callId2
    };
    if(commandId) body.commandId = commandId;

    return makeRequest('POST', url, body).then((response) => response.json());
}

function getCallRecs(organizationId, unifiedUserId, offset = 0, count = 100){
    let url = `https://api.intermedia.net/voice/v2/organizations/${organizationId}/users/${unifiedUserId}/call-recordings?offset=${offset}&count=${count}`;
    return makeRequest("GET", url).then((response) => response.json());
}

function getCallRecsArchive(organizationId, unifiedUserId, ids, format = "zip"){
    let url = `https://api.intermedia.net/voice/v2/organizations/${organizationId}/users/${unifiedUserId}/call-recordings/_selected/_content?format=${format}`;
    let body = {
        "ids": ids,
    };

    return makeRequest("POST", url, body).then((response) => response.arrayBuffer());
}

function getCallRecsContent(organizationId, unifiedUserId, callRecId){
    let url = `https://api.intermedia.net/voice/v2/organizations/${organizationId}/users/${unifiedUserId}/call-recordings/${callRecId}/_content`;
    return makeRequest("GET", url).then((response) => response.arrayBuffer());
}


///////////////////////////////
// functions for VoiceMails
///////////////////////////////

function getVoiceMails(offset, countOnList){ 
    let url = 'https://api.intermedia.net/voice/v2/voicemails?offset=' + offset + '&count=' + countOnList;

    await makeRequest("GET", url)
        .then((response) => response.json())
        .then((response) => { res = response });
    return res;
}

async function deleteVoiceMailRecords(status){
    let url = 'https://api.intermedia.net/voice/v2/voicemails/_all?status=' + status;
    await makeRequest("DELETE", url);
}

async function deleteSelectedVoicemailRecords(ids){
    let url = 'https://api.intermedia.net/voice/v2/voicemails/_selected';
    let body = { 
        "ids": [ids] 
    };

    await makeRequest("DELETE", url, body);
}

async function updateVoiceMailRecordsStatus(status){
    let url = 'https://api.intermedia.net/voice/v2/voicemails/_all/_metadata';
    let body = { 
        "status": status 
    };

    await makeRequest("POST", url, body);
}

async function updateSelectedVoiceMailRecordsStatus(status, ids){
    let url = 'https://api.intermedia.net/voice/v2/voicemails/_selected/_metadata';
    let body = { 
        "ids": [ids],
        "status": status
    };

    await makeRequest("POST", url, body);
}

async function getVoiceMailsTotal(status){
    let url = 'https://api.intermedia.net/voice/v2/voicemails/_total?status=' + status;

    let res;
    await makeRequest("GET", url).then((response) => response.json()).then( (response) => {
        res = response;
    });

    return res;
}

async function getVoiceMailRecord(id){
    let url = 'https://api.intermedia.net/voice/v2/voicemails/' + id;
    
    let res;

    await makeRequest("GET", url)
        .then((response) => response.json())
        .then((response) => res = response);
    
    return res;
}


async function getVoiceMailsTranscription(id){
    let url = 'https://api.intermedia.net/voice/v2/voicemails/' + id + '/_transcript';
   
    let res;
    await makeRequest("GET", url)
        .then((response) => response.json())
        .then( (response) => {
            res = response["text"];
        });
    
    return res;
}

async function getVoiceMailsContent(format, id){
    let url = 'https://api.intermedia.net/voice/v2/voicemails/' + id + '/_content?format=' + format;

    let res;
    await makeRequest("GET", url)
        .then(response => response.blob())
        .then(blob => {
            res = blob;
        });
    return res;
}