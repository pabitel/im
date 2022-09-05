
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
    var result;
     get(name,(data)=>{
         result = data.results
    },params);
     return result;
}

 function addToCollection(name,data){
    post(name,(data)=>{
        console.log(data)
    },data);
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




getRoomByRoomId("6315c1ab722da6529db10e38");
console.log(1234)
