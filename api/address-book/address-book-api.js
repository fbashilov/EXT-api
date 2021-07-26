const baseUrl = 'https://api.intermedia.net';


function getContacts(params){ 
    let url = `${baseUrl}/address-book/v3/contacts${params}`;
       
    return makeRequest("GET", url).then((response) => response.json());
}

function getUserDetails(params){ 
    let url = `${baseUrl}/address-book/v3/contacts/_me${params}`;

    return makeRequest("GET", url).then((response) => response.json());
}

function getContactsByJIDs(jids, params){ 
    let url = `${baseUrl}/address-book/v3/contacts/_search${params}`;
    let jidsArray = jids.split(",");
    let body = {
        "jids" : jidsArray
    }

    return makeRequest("POST", url, body).then((response) => response.json());
}

function getSingleContact(id, params){ 
    let url = `${baseUrl}/address-book/v3/contacts/${id}${params}`;
    return makeRequest("GET", url).then((response) => response.json());
}

function getAvatar(avatarId){
    let url = `${baseUrl}/address-book/v3/avatars/${avatarId}`;

    return makeRequest('GET', url).then((response) => response.json());
}

function getMultipleAvatars(avatarIds){
    let url = `${baseUrl}/address-book/v3/avatars/_search`;
    let body = {
        "avatarIds": avatarIds,
    };
    return makeRequest('POST', url, body).then((response) => response.json());
}


