function pl_switch(prot, did, value){
    send_url("{%url 'pl_switch' %}" + prot + "/" + did + "/" + value, function(){alert("hecho")})
}

function pl_dim(prot, did, value){
    send_url("{%url 'pl_dim' %}" + prot + "/" + did + "/" + value,
             function(){no_on_off(did)})

}

function pl_bri(prot, did, value){
    send_url("{%url 'pl_bri' %}" + prot + "/" + did + "/" + value,
             function(){no_on_off(did)})
}

function no_on_off(did){
    $("#on_" + did).removeClass("active")
    $("#off_" + did).removeClass("active")
}
