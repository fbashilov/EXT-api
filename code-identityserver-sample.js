///////////////////////////////
// IIFE on load (get access token)
///////////////////////////////
(()=>{
    Oidc.Log.logger = console;
    Oidc.Log.level = Oidc.Log.DEBUG;
    console.log("Using oidc-client version: ", Oidc.Version);
    
    let settings = {
        authority: localStorage.getItem('cfg-authority'),
        client_id: localStorage.getItem('cfg-clientId'),
        redirect_uri: location.href.split('?')[0],
        response_type: 'code',
        scope: localStorage.getItem('cfg-scopes'),
    
        automaticSilentRenew:false,
        validateSubOnSilentRenew: false,
    
        monitorAnonymousSession : false,
        filterProtocolClaims: false,
        monitorSession: false,
        loadUserInfo: false,
        revokeAccessTokenOnSignout : true,
    
        acr_values : localStorage.getItem('cfg-acr'),
        login_hint: localStorage.getItem('cfg-login'),
        extraTokenParams: { acr_values: localStorage.getItem('cfg-acr') }
    };

    getAccessToken(settings).then((response) => {
        setSessionToken(response);
    }).catch((error) => {
        console.log("Error!!! " + error);
    });
})();

///////////////////////////////
// tokens
///////////////////////////////
function getAccessToken(settings){
    return new Promise((succeed, fail) => {
        let mgr = new Oidc.UserManager(settings);

        //check for token in URL
        if (location.search.includes("code=", 1)) {
            //Response code was found in query. Trying to exchange code for token...
            mgr.signinCallback(settings).then((user) => {
                succeed(user.access_token);
            }).catch((err) => {
                log(err);
                fail(new Error("Exchange code for token failed!:" + err));
            });
        } else {    //go authorization
            log("Going to sign in using following configuration");

            mgr.signinRedirect({useReplaceToNavigate:true}).then(() => {
                log("Redirecting to AdSTS...");
            }).catch((err) => {
                log(err);
            });
        }
    });
}

function getSessionToken(){
    return sessionStorage.getItem('accessToken');
}

function setSessionToken(accessToken){
    sessionStorage.setItem('accessToken', accessToken);
}

