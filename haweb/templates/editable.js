var editable = true;

function toggle_del_btn(){
    $(".del_btn").remove()
    if(editable)return;

    var e = $(document.createElement("a"))
    e.attr("href", "javascript:void(0)")
    e.on("click", function(ev){
        del_control($(this))
    })
    e.html("<i class='icon-minus-sign icon-white pull-right'></i>")
    e.addClass("del_btn")
    $(".clabel").append(e)


    delete e;
}

function toggle_new_form(){
    $("#new_form").remove();
    if(editable)return;

    var e = $(document.createElement("div"))
    e.attr("id", "new_form")
    $("#izq").append(e)

    init_progress()
    progress(30);
    $.ajax({
        url: "{%url 'control_by_id'%}",
        data: "screen={{screen.slug}}",
        type: "GET",
        beforeSend: function(){progress(60)},
        success: function(data){$("#new_form").append(data);},
        complete: function(){progress(100);drop_progress()},
        error: function(ob){show_msg(ob.responseText)}
    })
    delete e;
}

function toggle_edit(){
    editable = !editable
    toggle_del_btn()
    toggle_new_form()

}

function del_control(e){
    var i = $(e).parent().attr("i")
    var p = $(e).parent().attr("p")
    init_progress()
    progress(30);
    $.ajax({
        url: "{%url 'control_by_id'%}" + p + "/" + i,
        type: "DELETE",
        beforeSend: function(){progress(60)},
        success: function(data){refresh()},
        complete: function(){progress(100);drop_progress()},
        error: function(ob){show_msg(ob.responseText)}
    })
    delete i, p;
}

function add_control(){
    init_progress()
    progress(30);
    $.ajax({
        url: $("#form_new").attr("action"),
        data: $("#form_new").serialize(),
        type: "POST",
        beforeSend: function(){progress(60)},
        success: function(data){toggle_edit();refresh()},
        complete: function(){progress(100);drop_progress()},
        error: function(ob){show_msg(ob.responseText)}
    })
}
