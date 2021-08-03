function getSessionToken(){
    return sessionStorage.getItem('accessToken');
}

function setSessionToken(accessToken){
    sessionStorage.setItem('accessToken', accessToken);
}

function isAuthorized(){
    return sessionStorage.getItem('accessToken') ? true : false;
}

function logout(){
    sessionStorage.removeItem('accessToken');
}