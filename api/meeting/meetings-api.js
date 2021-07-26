const baseUrl = 'https://api.qaintermedia.net';

function startMeeting(){
    let url = `${baseUrl}/meetings/v1/meeting/start/details`;

    return makeRequest('POST', url).then((response) => response.json());
}

function getUserDetails(){
    let url = `${baseUrl}/meetings/v1/user`;

    return makeRequest('GET', url).then((response) => response.json());
}

function getMeetingDetails(meetingCode){
    let url = `${baseUrl}/meetings/v1/meeting/${meetingCode}`;

    return makeRequest('GET', url).then((response) => response.json());
}