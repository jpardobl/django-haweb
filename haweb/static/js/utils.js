function doload_dom_script(url, id){
	var d = document;
	var s = d.createElement('script');
	s.src = url;
	s.type="text/javascript";
	s.id = id
	d.getElementsByTagName('head')[0].appendChild(s);
	delete d, s;
}

function doload_dom_css(url, id){
	var d = document
	var c = d.createElement('link')
	c.href = url
	c.rel = "stylesheet"
	c.type="text/css"
	c.id = id
	d.getElementsByTagName('head')[0].appendChild(c)
	delete d, c;
}

function load_dom_script_once(url, css){


	if( css == undefined){
		id = 'js_'+url.replace(/\//g,"").replace(/_/g,"").replace(/\./g, "")
		if(window.console)console.log("script "+id+"found: " + $("#"+id).length)
		if($("#"+id).length) return;
		if(window.console)console.log("Cargamos el script/css " + url)
		doload_dom_script(url, id);
		return
	}
	id = 'css_'+url.replace(/\//g,"").replace(/_/g,"").replace(/\./g, "")
	if($("#"+id).length) return;
	if(window.console)console.log("Cargamos el script/css " + url)
	doload_dom_css(url, id)
}

function init_progress(){
    var z = $("#menu")
    $("#prog").remove()
    $("#avisos").remove()
    z.append("<div id='prog' class=\"progress\"><div id=\"progress\" class=\"bar\" data-percentage=\"0%\" style=\"width: 0%;\"></div></div>")
    delete z;
}

function progress(p){
    $("#progress").css( "width", p + "%")
}

function drop_progress(){

    setTimeout("$('#prog').fadeOut('slow')", 800)

}

function show_msg(msg, type){
    if(type == undefined) type = "error"
    var z = $("#menu")

    $("#avisos").remove()
    z.append("<div style='display:none' class='alert alert-"+type+"' id='avisos'><button type='button' class='close' data-dismiss='alert'>&times;</button>" + msg + "</div>")
    $("#avisos").fadeToggle('slow')
    $("#avisos").addClass("span12")
    $('#avisos').bind('closed', function () {
            $("#avisos").remove()
        })
    delete z
}

function load_url(selector, url, data){
    init_progress();
    $.ajax({
        url: url,
        data: data,
        beforeSend: function(){progress(30)},
        success: function(data){progress(60);$(selector).html(data);progress(90)},
        complete: function(){$("[title!=undefined]").tooltip({"animation": "true"});progress(100)},
        error: function(ob){show_msg(ob.responseText)}
        });
   drop_progress();

}

function send_url(url, fun, data){
   init_progress();
   $.ajax({
    url: url,
    data: data,
    beforeSend: function(){progress(30)},
    success: fun,
    complete: function(){$("[title!=undefined]").tooltip({"animation": "true"});progress(100)},
    error: function(ob){show_msg(ob.responseText)}
   });

   drop_progress();
}



function validation(){

    /*jQuery.extend(jQuery.validator.messages, {
        required: "Campo requerido",
        remote: "Este campo no es valido",
        email: "El email no es valido",
        url: "La url no es correcta",
        esdate: "La fecha no es valida(dd/mm/yyyy)",
        number: "Numero no valido",
        digits: "Solo digitos",
        creditcard: "Numero de tarjeta no es valido",
        equalTo: "Los valores no son iguales",
        accept: "Expresion no valida",
        maxlength: jQuery.validator.format("Maximo {0} caracteres"),
        minlength: jQuery.validator.format("Minimo {0} caracteres"),
        rangelength: jQuery.validator.format("El valor tiene que tener entre {0} y {1} caracteres"),
        range: jQuery.validator.format("El valor debe ser entre {0} y {1}."),
        max: jQuery.validator.format("El valor debe ser menor o igual a {0}."),
        min: jQuery.validator.format("El valor debe ser mayor o igual a {0}."),
        conv: "Campo requerido"

    });*/
    $.validator.addMethod(
        "esdate",
        function(value, element) {
            // put your own logic here, this is just a (crappy) example
            var r = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            var f = r.exec(value);delete r;
            if(!f){delete f, r;return false;}
            if(parseInt(f[1]) < 1 || parseInt(f[1]) > 31){delete f, r;return false}
            if(parseInt(f[2]) < 1 || parseInt(f[2]) > 12){delete f, r;return false}

            return true
        }
    );
    $.validator.addMethod(
        "gtdate",
        function(value, e){
            var r = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
            var f = r.exec(value);
            if(!f){delete f, r;return false;}
            var o = $($(e).attr("gtdate")).val();
            var d1 = new Date(f[3], f[2], f[1])
            var f = r.exec(o)
            if(!f){delete f, r, o, d1;return false;}
            var d2 = new Date(f[3], f[2], f[1])
            if(d1<=d2){delete r,f,o,d1,d2; return false;}
            delete r,f,o,d1,d2;
            return true;
        }, function(params, e) {
            return 'La fecha deber ser posterior a la ' + $(e).attr('gtdate_label')
            }
    );

    $("form").validate({})

}
