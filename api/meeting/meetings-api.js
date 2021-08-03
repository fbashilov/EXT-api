const baseUrl = 'https://api.qaintermedia.net';

function startMeeting(){
    const url = `${baseUrl}/meetings/v1/meeting/start/details`;

    return makeRequest('POST', url).then((response) => response.json());
}

function getUserDetails(){
    const url = `${baseUrl}/meetings/v1/user`;

    return makeRequest('GET', url).then((response) => response.json());
}

function getMeetingDetails(meetingCode){
    const url = `${baseUrl}/meetings/v1/meeting/${meetingCode}`;

    return makeRequest('GET', url).then((response) => response.json());
}