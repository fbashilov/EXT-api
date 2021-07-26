/////////////////////////////
// UI event handlers
/////////////////////////////
document.getElementById('getContacts').addEventListener("click", onGetContacts, false);

document.getElementById('getUserDetails').addEventListener("click", onGetUserDetails, false);

document.getElementById('getContactsByJIDs').addEventListener("click", onGetContactsByJIDs, false);

document.getElementById('getSingleContact').addEventListener("click", onGetSingleContact, false);

document.getElementById('getContactsid').addEventListener("click", onGetContactsId, false);

document.getElementById('getContacts_all').addEventListener("click", onGetContactsAll, false);

document.getElementById('getUserDetailsid').addEventListener("click", onGetUserDetailsId, false);

document.getElementById('getUserDetails_all').addEventListener("click", onGetUserDetailsAll, false);

document.getElementById('getContactsByJIDsid').addEventListener("click", onGetContactsByJIDsId, false);

document.getElementById('getContactsByJIDs_all').addEventListener("click", onGetContactsByJIDsAll, false);

document.getElementById('getSingleContactid').addEventListener("click", onGetSingleContactId, false);

document.getElementById('getSingleContact_all').addEventListener("click", onGetSingleContactAll, false);

document.getElementById('get-avatar').addEventListener("click", onGetAvatar, false);

document.getElementById('get-multiple-avatars').addEventListener("click", onGetMultipleAvatars, false);

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
// Rendering functions
///////////////////////////////
function changeFieldsStatus(id, legacyId, _all){
    if(id.checked || _all.checked){
        legacyId.disabled = false;
    }else{
        legacyId.disabled = true;
        legacyId.checked = false;
    }
}

function renderAvatarImg(byteCode, parentNode){
    let imgElem = document.createElement("img");
    imgElem.src = `data:image/jpg;base64, ${byteCode}`;
    parentNode.appendChild(imgElem);
}

///////////////////////////////
// Address book functions
///////////////////////////////
function onGetContacts(){
    let params ='';
    if(document.getElementById('query').value){
        params = params + "&query=" + document.getElementById('query').value;
    }
    
    if(document.getElementById('phone').value){
        params = params + "&phone=" + document.getElementById('phone').value;
    }
    
    if(document.getElementById('scope').value){
        params = params + "&scope=" + document.getElementById('scope').value;
    }
    
    let fields = '&fields=';
    let getContactsid = document.getElementById('getContactsid');
    if(getContactsid.checked){
        fields = fields  + getContactsid.value;
    }

    let getContactsLegacyid = document.getElementById('getContactslegacyId');
    if(getContactsLegacyid.checked){
        fields = fields  + (getContactsid.checked ? "," : '') + getContactsLegacyid.value;
    }

    let getContacts_all = document.getElementById('getContacts_all');
    if(getContacts_all.checked){
        fields = fields  + ((getContactsLegacyid.checked || getContactsid.checked) ? "," : '') + getContacts_all.value;
    }
    params = params + (fields != '&fields='? (fields): '');

    getContacts(params? ('?' + params): '').then((response) => {
        log(response);
    }).catch((error) => {
        console.log("Get contacts failed! " + error);
    });
}

function onGetUserDetails(){
    let params ='';
    
    let fields = '&fields=';
    let getContactsid = document.getElementById('getUserDetailsid');
    if(getContactsid.checked){
        fields = fields  + getContactsid.value;
    }

    let getContactsLegacyid = document.getElementById('getUserDetailslegacyId');
    if(getContactsLegacyid.checked){
        fields = fields  + (getContactsid ? "," : '') + getContactsLegacyid.value;
    }

    let getContacts_all = document.getElementById('getUserDetails_all');
    if(getContacts_all.checked){
        fields = fields  + (getContactsLegacyid ? "," : '') + getContacts_all.value;
    }
    params = params + (fields != '&fields='? (fields): '');

    getUserDetails(params? ('?' + params): '').then((response) => {
        log(response);
    }).catch((error) => {
        console.log("Get contacts failed! " + error);
    });
}

function onGetContactsByJIDs(){
    let params ='';
    
    let fields = '&fields=';
    let getContactsid = document.getElementById('getContactsByJIDsid');
    if(getContactsid.checked){
        fields = fields  + getContactsid.value;
    }

    let getContactsLegacyid = document.getElementById('getContactsByJIDslegacyId');
    if(getContactsLegacyid.checked){
        fields = fields  + (getContactsid ? "," : '') + getContactsLegacyid.value;
    }

    let getContacts_all = document.getElementById('getContactsByJIDs_all');
    if(getContacts_all.checked){
        fields = fields  + (getContactsLegacyid ? "," : '') + getContacts_all.value;
    }
    params = params + (fields != '&fields='? (fields): '');

    getContactsByJIDs(document.getElementById('jids').value, params ? ('?' + params): '').then((response) => {
        log(response);
    }).catch((error) => {
        console.log("Get contacts failed! " + error);
    });
}

function onGetSingleContact(){ 
    let params = '';

    let fields = '&fields=';
    let getContactsid = document.getElementById('getSingleContactid');
    if(getContactsid.checked){
        fields = fields  + getContactsid.value;
    }

    let getContactsLegacyid = document.getElementById('getSingleContactlegacyId');
    if(getContactsLegacyid.checked){
        fields = fields  + (getContactsid ? "," : '') + getContactsLegacyid.value;
    }

    let getContacts_all = document.getElementById('getSingleContact_all');
    if(getContacts_all.checked){
        fields = fields  + (getContactsLegacyid ? "," : '') + getContacts_all.value;
    }
    params = params + (fields != '&fields='? (fields): '');

    getSingleContact(document.getElementById('id').value, params ? ('?' + params): '').then((response) => {
        log(response);
    }).catch((error) => {
        console.log("Get contacts failed! " + error);
    });
}

function onGetContactsId(){
    let id = document.getElementById('getContactsid');
    let legacyId = document.getElementById('getContactslegacyId');
    let _all = document.getElementById('getContacts_all');

    changeFieldsStatus(id, legacyId, _all);
}

function onGetContactsAll(){
    let id = document.getElementById('getContactsid');
    let legacyId = document.getElementById('getContactslegacyId');
    let _all = document.getElementById('getContacts_all');

    changeFieldsStatus(id, legacyId, _all);
}

function onGetUserDetailsId(){
    let id = document.getElementById('getUserDetailsid');
    let legacyId = document.getElementById('getUserDetailslegacyId');
    let _all = document.getElementById('getUserDetails_all');
    
    changeFieldsStatus(id, legacyId, _all);
}

function onGetUserDetailsAll(){
    let id = document.getElementById('getUserDetailsid');
    let legacyId = document.getElementById('getUserDetailslegacyId');
    let _all = document.getElementById('getUserDetails_all');
    
    changeFieldsStatus(id, legacyId, _all);
}

function onGetContactsByJIDsId(){
    let id = document.getElementById('getContactsByJIDsid');
    let legacyId = document.getElementById('getContactsByJIDslegacyId');
    let _all = document.getElementById('getContactsByJIDs_all');
    
    changeFieldsStatus(id, legacyId, _all);
}

function onGetContactsByJIDsAll(){
    let id = document.getElementById('getContactsByJIDsid');
    let legacyId = document.getElementById('getContactsByJIDslegacyId');
    let _all = document.getElementById('getContactsByJIDs_all');
    
    changeFieldsStatus(id, legacyId, _all);
}

function onGetSingleContactId(){
    let id = document.getElementById('getSingleContactid');
    let legacyId = document.getElementById('getSingleContactlegacyId');
    let _all = document.getElementById('getSingleContact_all');
    
    changeFieldsStatus(id, legacyId, _all);
}

function onGetSingleContactAll(){
    let id = document.getElementById('getSingleContactid');
    let legacyId = document.getElementById('getSingleContactlegacyId');
    let _all = document.getElementById('getSingleContact_all');
    
    changeFieldsStatus(id, legacyId, _all);
}

function onGetAvatar(){
    let avatarId = document.getElementById('avatar-id').value;

    getAvatar(avatarId).then((response) =>{
        document.getElementById("get-avatar-output").innerHTML = "";
        renderAvatarImg(response["avatar"], document.getElementById("get-avatar-output"));
    }).catch((error) => {
        console.log("Get avatar failed! " + error);
    });
}

function onGetMultipleAvatars(){
    let avatarIds = document.getElementById("avatar-ids").value.split(/\s*,\s*/);
    getMultipleAvatars(avatarIds).then((response) =>{
        document.getElementById("get-multiple-avatars-output").innerHTML = "";
        response["results"].forEach(element => {
            renderAvatarImg(element["avatar"], document.getElementById("get-multiple-avatars-output"));
        });
    }).catch((error) => {
        console.log("Get multiple avatar failed! " + error);
    });
}