let roomMonitor;
let calleeCanMonitor;
let callerCanMonitor;
const callerCandidates = "callerCandidates";
const calleeCandidates = "calleeCandidates";

const header = {
    "X-LC-Id":"ti7gm7nhco5eOFUpgZPudCeP-gzGzoHsz",
    "X-LC-Key":"PwuPEYi76CLNDXNUnGyVKILx",
    "Content-Type":"application/json"
}

$.ajaxSetup({
    beforeSend: function(xhr) {
        xhr.setRequestHeader("X-LC-Id", 'ti7gm7nhco5eOFUpgZPudCeP-gzGzoHsz');
        xhr.setRequestHeader("X-LC-Key", 'PwuPEYi76CLNDXNUnGyVKILx');
    }
});
const baseUrl = 'https://ti7gm7nh.lc-cn-n1-shared.com/1.1/classes/'

function get(url,callback,params={}){
    $.get({
        url: baseUrl+url,
        dataType: 'json',
        async: false,
        success: callback,
        data: params
    })
}

function post(url,callback,params={}){
    $.ajax({
        url: baseUrl+url,
        dataType: 'json',
        type: "POST",
        success: callback,
        async: false,
        data: JSON.stringify(params),
        headers:{
            "content-type":"application/json"
        }
    })
}



 function getCollection(name,params){
    let result;
     get(name,(data)=>{
         result = data.results
    },params);
     return result;
}

 function addToCollection(name,data){
    let objId;
    post(name,(data)=>{
        console.log(`addToCollection:${name}`,data)
        objId =  data.objectId
    },data);
    return objId;
}

 function  getRoomByRoomId(roomId){
    const data =  getCollection("rooms",{where:{"objectId":roomId}})
    console.log(data)
     return data.length>0?data[0]:null;
}
function  getRoomByCallerRoomId(roomId){
    const data =  getCollection("rooms",{where:{"callerRoomId":roomId}})
    console.log(data)
    return data.length>0?data[0]:null;
}


 function  roomMonitorFun(func){
     roomMonitor = setInterval(func,10000);
}


function  calleeCanMonitorFunc(func){
    calleeCanMonitor = setInterval(func,10000);
}

function  callerCanMonitorFunc(func){
    callerCanMonitor = setInterval(func,10000);
}


function  getCalleeByRoomId(roomId){
    const data =  getCollection(calleeCandidates,{where:{"roomId":roomId}});
    console.log(data)
    return data;
}

function  getCallerByRoomId(roomId){
    const data =  getCollection(callerCandidates,{where:{"roomId":roomId}});
    console.log(data)
    return data;
}
