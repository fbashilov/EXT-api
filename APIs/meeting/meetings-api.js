function startMeeting(){
    let url = 'https://api.intermedia.net/meetings/v1/meeting/start/details';

    return makeRequest('POST', url).then((response) => response.json());
}

function getUserDetails(){
    let url = 'https://api.intermedia.net/meetings/v1/user';

    return makeRequest('GET', url).then((response) => response.json());
}

function getMeetingDetails(meetingCode){
    let url = `https://api.intermedia.net/meetings/v1/meeting/${meetingCode}`;

    return makeRequest('GET', url).then((response) => response.json());
}