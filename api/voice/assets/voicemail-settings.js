//////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('getDefaultGreetingContentMp3').addEventListener("click", () =>
    onGetGreetingContent("mp3", 0), false);

document.getElementById('getDefaultGreetingContentOgg').addEventListener("click", () =>
    onGetGreetingContent("ogg", 0), false);

document.getElementById('getCustomGreetingContentMp3').addEventListener("click", () => 
    onGetGreetingContent("mp3", 1), false);

document.getElementById('getCustomGreetingContentOgg').addEventListener("click", () =>
    onGetGreetingContent("ogg", 1), false);

document.getElementById('uploadGreetingContent').addEventListener("click", onUploadGreetingContent, false);

document.getElementById('getUserSettings').addEventListener("click", onGetUserSettings, false);

document.getElementById('getVoicemailUsage').addEventListener("click", onGetVoicemailUsage, false);

document.getElementById('resetGreetingContent').addEventListener("click",async () =>{
    let res = await resetGreetingContent(token); 
    log(res);
});

document.getElementById('updateUserSettings').addEventListener("click", onUpdateUserSettings, false);

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


///////////////////////////////
// Voicemail settings functions
///////////////////////////////
function onGetGreetingContent(format, custom){
    getGreetingContent(format, custom).then((response) => {
        let dataUrl = window.URL.createObjectURL(response);
        let a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'greeting.' + format;
        a.click();
    }).catch((error) => {
        console.log("Get greeting content failed! " + error);
    }); 

}

function onUploadGreetingContent(){
    uploadGreetingContent().then((response) => {
        log(response);
    }).catch((error) => {
        console.log("Upload greeting content failed! " + error);
    });
}

function onGetUserSettings(){
    getUserSettings().then((response) => {
        log(response);
    }).catch((error) => {
        console.log("Get user settings failed! " + error);
    });
}

function onUpdateUserSettings(){
    updateUserSettings(
        document.getElementById("pin").value,
        document.getElementById("hasCustomGreeting").value, 
        document.getElementById("isTranscriptionPermitted").value, 
        document.getElementById("enableTranscription").value,
        document.getElementById("receiveEmailNotifications").value,
        document.getElementById("emails").value,
        document.getElementById("includeVoiceMail").value
    ).then((response) => {
        log(response);
    }).catch((error) => {
        console.log("Update user settings failed! " + error);
    });
}

function onGetVoicemailUsage(){
    getVoicemailUsage().then((response) => {
        log(response);
    }).catch((error) => {
        console.log("Get voicemail usage failed! " + error);
    });
}