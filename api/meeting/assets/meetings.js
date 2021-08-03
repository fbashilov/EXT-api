///////////////////////////////
// on load
///////////////////////////////
if(!isAuthorized()){
    window.location.href = "../../auth/pkce/auth.html"
}


//////////////////////////////
// UI event handlers
//////////////////////////////
document.getElementById('logout').addEventListener("click", () => logout(), false);

document.getElementById('start-meeting').addEventListener("click", onStartMeeting, false);
document.getElementById('get-user-details').addEventListener("click", onGetUserDetails, false);
document.getElementById('get-meeting-details').addEventListener("click", onGetMeetingDetails, false);

///////////////////////////////
// Meeting functions
///////////////////////////////
function onStartMeeting(){
    startMeeting().then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log("Start meeting failed! " + error);
    });
}

function onGetUserDetails(){
    getUserDetails().then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log("Start meeting failed! " + error);
    });
}

function onGetMeetingDetails(){
    let meetingCode = document.getElementById("meeting-code").value;

    getMeetingDetails(meetingCode).then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log("Start meeting failed! " + error);
    });
}
