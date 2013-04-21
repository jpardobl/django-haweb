function pl_switch(prot, did, value){
    send_url("{%url 'pl_switch' %}" + prot + "/" + did + "/" + value, function(){alert("hecho")})
}

function pl_dim(prot, did, value){
    send_url("{%url 'pl_dim' %}" + prot + "/" + did + "/" + value, function(){alert("hecho")})
}

function pl_bri(prot, did, value){
    send_url("{%url 'pl_bri' %}" + prot + "/" + did + "/" + value, function(){alert("hecho")})
}
