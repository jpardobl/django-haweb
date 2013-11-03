function pl_switch(prot, did, value){
    send_url("{%url 'pl_switch' %}" + prot + "/" + did + "/" + value, function(){})
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

function new_ordering(screen, order){
    init_progress()
    progress(30);
    $.ajax({
        type: "PUT",
        data: "ordering=" + order,
        url: "{%url 'screen'%}" + screen,
        beforeSend: function(){progress(60)},
        done: function(data){progress(100)},
        complete: function(){drop_progress()},
        fail: function(ob){show_msg(ob.responseText)}
        })
}

function refresh(){
    send_url("{% url 'screen_controls' screen.slug%}", function(data){
        $("#sortable").html(data);toggle_del_btn();toggle_new_form();
    })

}
