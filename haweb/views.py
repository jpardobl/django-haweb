# Create your views here.
from models import Screen, Control, ScreenControls
from django.shortcuts import get_object_or_404, render_to_response
from hautomation_restclient import cmds
from hautomation_restclient import manage as haclient
from django.conf import settings
from django.http import HttpResponseServerError, HttpResponse, HttpResponseBadRequest
from django.http import QueryDict
from django.views.decorators.csrf import csrf_exempt
import simplejson
from forms import ControlForm
from django.db import IntegrityError


def screen_controls(request, slug):

    screen = get_object_or_404(Screen, slug=slug)
    scontrols = ScreenControls.objects.filter(screen=screen)
    return render_to_response(
        "screen_controls.html",
        {"screen": screen,
         "scontrols": scontrols}
    )


@csrf_exempt
def screen(request, slug):
    if request.method == "GET":
        screen = get_object_or_404(Screen, slug=slug)
        scontrols = ScreenControls.objects.filter(screen=screen)
        return render_to_response(
            "screen.html",
            {"screen": screen,
             "scontrols": scontrols}
        )
    if request.method == "PUT":
        screen = get_object_or_404(Screen, slug=slug)
        params = QueryDict(request.body, request.encoding)
        new_order = params["ordering"]
        try:
            cont = 1
            scontrols = ScreenControls.objects.filter(screen=screen)
            for did in params["ordering"].split(","):
                for scontrol in scontrols:
                    if scontrol.control.did == did:
                        scontrol.order = cont
                        scontrol.save()
                        cont += 1
                        break

        except KeyError:
            return HttpResponseBadRequest(
                content=simplejson.dumps({"errors": ["Ordering needed", ]}),
                content_type="application/json",)
        return HttpResponse("OK")

    return HttpResponseBadRequest(
        content=simplejson.dumps({"errors": ["Method not supported", ]}),
        content_type="application/json",
                )


@csrf_exempt
def control(request, protocol=None, did=None):

    if protocol is not None and did is not None:
        obj = get_object_or_404(Control, protocol=protocol, did=did)
        form = ControlForm(request.GET, obj)
    else:

        obj = Control()

    if request.method == "GET":
        form = ControlForm(instance=obj)
        try:
            screen = get_object_or_404(Screen, slug=request.GET["screen"])
        except KeyError:
            return HttpResponseBadRequest("Falta el screen")
        return render_to_response(
            "edit_control.html",
            {"form": form,
             "screen": screen}
        )
    if request.method == "POST":
        print "estamos en POST"
        form = ControlForm(request.POST, obj)
        if form.is_valid():
            print "erstamos en valid"
            screen = request.POST["screen"]
            print screen
            screen = get_object_or_404(Screen, slug=screen)
            obj = form.save(commit=False)
            try:
                obj.save()
            except IntegrityError:
                return HttpResponseBadRequest("Protocol and did already in use")
            except haclient.RestApiException, err:

                return HttpResponseBadRequest("Error at: %s" % err)
            ScreenControls(screen=screen, control=obj).save()
            return HttpResponse("OK")
        print "no es valida"
        return render_to_response(
            "edit_control.html",
            {"form": form}
        )

    if request.method == "DELETE":
        obj.delete()
        #TODO get_object_or_404 must us middleware to return json
        return HttpResponse(status=204)

    return HttpResponseBadRequest(
        content=simplejson.dumps({"errors": ["Protocol not supported", ]}),
        content_type="application/json",
        )




def pl_switch(request, protocol, did, value):

    c = get_object_or_404(Control, protocol=protocol, did=did)

    try:
        cmds.pl_switch(
            protocol,
            did,
            value,
            settings.HA_SERVER,
            settings.HA_USERNAME,
            settings.HA_PASSWORD)
        return HttpResponse("OK")
    except Exception, err:
        return HttpResponseServerError(err)


def pl_dim(request, protocol, did, value):

    c = get_object_or_404(Control, protocol=protocol, did=did)

    try:
        cmds.pl_dim(
            protocol,
            did,
            value,
            settings.HA_SERVER,
            settings.HA_USERNAME,
            settings.HA_PASSWORD)
        return HttpResponse("OK")

    except Exception, err:
        return HttpResponseServerError(err)


def pl_bri(request, protocol, did, value):

    c = get_object_or_404(Control, protocol=protocol, did=did)

    try:
        cmds.pl_bri(
            protocol,
            did,
            value,
            settings.HA_SERVER,
            settings.HA_USERNAME,
            settings.HA_PASSWORD)
        return HttpResponse("OK")
    except Exception, err:
        return HttpResponseServerError(err)
