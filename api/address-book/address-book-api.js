const baseUrl = 'https://api.intermedia.net';


function getContacts(query, phone, scope, fields){ 
    let url = `${baseUrl}/address-book/v3/contacts`;

    let searchParams = new URLSearchParams();
    if(query) searchParams.append("query", query);
    if(phone) searchParams.append("phone", phone);
    if(scope) searchParams.append("scope", scope);
    if(fields) searchParams.append("fields", fields);

    if(searchParams.toString()){
        url += `?${searchParams.toString()}`;
    }
       
    return makeRequest("GET", url).then((response) => response.json());
}

function getUserDetails(fields){ 
    let url = `${baseUrl}/address-book/v3/contacts/_me`;

    if(fields){
        url += `?${fields}`;
    }

    return makeRequest("GET", url).then((response) => response.json());
}

function getContactsByJIDs(jids, fields){ 
    let url = `${baseUrl}/address-book/v3/contacts/_search`;

    if(fields){
        url += `?${fields}`;
    }

    const body = {
        "jids" : jids
    }

    return makeRequest("POST", url, body).then((response) => response.json());
}

function getSingleContact(id, fields){ 
    let url = `${baseUrl}/address-book/v3/contacts/${id}`;

    if(fields){
        url += `?${fields}`;
    }

    return makeRequest("GET", url).then((response) => response.json());
}

function getAvatar(avatarId){
    const url = `${baseUrl}/address-book/v3/avatars/${avatarId}`;

    return makeRequest('GET', url).then((response) => response.json());
}

function getMultipleAvatars(avatarIds){
    const url = `${baseUrl}/address-book/v3/avatars/_search`;
    const body = {
        "avatarIds": avatarIds,
    };
    return makeRequest('POST', url, body).then((response) => response.json());
}


