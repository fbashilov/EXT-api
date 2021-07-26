///////////////////////////////
// UI event handlers
///////////////////////////////
document.getElementById('getDetailedCalls').addEventListener("click", onGetDetailedCalls, false);

document.getElementById('getUserCalls').addEventListener("click", onGetUserCalls, false);

document.getElementById('getUserFilters').addEventListener("click", onGetUserFilters, false);

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
// Analytics functions
///////////////////////////////
function onGetDetailedCalls(){
        let chargeable = document.getElementById('chargeable').value;
        let bound = document.getElementById('bound').value;
        let status = document.getElementById('status').value;
        let body = {};
    
        if(chargeable != 'select'){
            body['chargeable'] = [chargeable];
        }
        
        if(bound != 'select' && status != 'select'){
            body['callAttributes'] =[bound, status];
        }
    
        getDetailedCalls(
            document.getElementById('dateFromDetailedCalls').value,
            document.getElementById('dateToDetailedCalls').value,
            document.getElementById('timezone').value,
            document.getElementById('sortColumn').value,
            document.getElementById('descending').value,
            document.getElementById('offset').value,
            document.getElementById('getDetailedCallsSize').value,
            document.getElementById('getDetailedCallsAccountId').value,
            body ? body : null
        ).then((response) => {
            log(response);
        }).catch((error) => {
            console.log("Get detailed calls failed! " + error);
        });
}

function onGetUserCalls(){
        getUserCalls(
            document.getElementById('userIds').value,
            document.getElementById('dateFromUserCalls').value,
            document.getElementById('dateToUserCalls').value,
            document.getElementById('getUserCallsTimezone').value,
            document.getElementById('getUserCallsAccountId').value
        ).then((response) => {
            log(response);
        }).catch((error) => {
            console.log("Get user calls failed! " + error);
        });
}

function onGetUserFilters(){
    getUserFilters(
        document.getElementById('dateFromUserFilters').value,
        document.getElementById('dateToUserFilters').value,
        document.getElementById('getUserFiltersTimezone').value,
        document.getElementById('getUserFiltersAccountId').value
    ).then((response) => {
        log(response);
    }).catch((error) => {
        console.log("Get user filters failed! " + error);
    });
}