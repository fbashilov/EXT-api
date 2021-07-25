function getAvatar(avatarId){
    let url = `https://api.intermedia.net/address-book/v3/avatars/${avatarId}`;

    return makeRequest('GET', url).then((response) => response.json());
}

function getMultipleAvatars(avatarIds){
    let url = `https://api.intermedia.net/address-book/v3/avatars/_search`;
    let body = {
        "avatarIds": avatarIds,
    };
    return makeRequest('POST', url, body).then((response) => response.json());
}
 