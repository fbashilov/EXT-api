///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('authorization').addEventListener("click", onAuthorizationS2S, false);

///////////////////////////////
// Auth and tokens
///////////////////////////////
function onAuthorizationS2S(){
    let clientId = document.getElementById("client-id").value;
    let clientSecret = document.getElementById("client-secret").value;
    getS2SAccessToken(clientId, clientSecret).then((response) => {
        setSessionToken(response["access_token"]);
        document.getElementById("access-token-out").innerText = JSON.stringify(response);
    }).catch((error) => {
        console.log("Error!!! " + error);
    });
}

function getSessionToken(){
    return sessionStorage.getItem('accessToken');
}

function setSessionToken(accessToken){
    sessionStorage.setItem('accessToken', accessToken);
}

