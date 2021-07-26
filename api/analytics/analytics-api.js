let baseUrl = 'https://api.intermedia.net';


function getDetailedCalls(dateFrom, dateTo, timezone, sortColumn, descending, offset, size, accountId, body){
    let url = `${baseUrl}/analytics/calls/call/detail?dateFrom=${dateFrom}Z&dateTo=${dateTo}Z`;
    let params = '';
    
    if(timezone){
        params = params + "&timezone=" + timezone;
    }
    if(sortColumn){
        params = params + "&sortColumn=" + sortColumn;
    }
    if(descending){
        params = params + "&descending=" + descending;
    }
    if(offset){
        params = params + "&offset=" + offset;
    }   
    if(size){
        params = params + "&size=" + size;
    }    
    if(accountId){
        params = params + "&accountId=" + accountId;
    }

    url = url + params;

    return makeRequest("POST", url, body).then( response => response.json());
}

function getUserCalls(userIds, dateFrom, dateTo, accountId, timezone){ 
    let url = `${baseUrl}/analytics/calls/user?dateFrom=${new Date(dateFrom).toISOString()}&dateTo=${new Date(dateTo).toISOString()}`;
    let params = '';
    userIds = userIds.split(",");
    let body = {
        "userIds": userIds
    }

    if(timezone){
        params = params + "&timezone=" + timezone;
    }
    if(accountId){
        params = params + "&accountId=" + accountId;
    }

    url = url + params;

    return makeRequest("POST", url, body).then( response => response.json());
}

function getUserFilters(dateFrom, dateTo, accountId, timezone){
    let url = `${baseUrl}/analytics/calls/user/filters?dateFrom=${dateFrom}Z&dateTo=${dateTo}Z`;
    let params = '';
    
    if(timezone){
        params = params + "&timezone=" + timezone;
    }
    if(accountId){
        params = params + "&accountId=" + accountId;
    }

    url = url + params;

    return makeRequest("POST", url).then( response => response.json());
}