# Create your views here.
from models import Screen, Control
from django.shortcuts import get_object_or_404, render_to_response
from hautomation_restclient import cmds
from django.conf import settings
from django.http import HttpResponseServerError, HttpResponse


def screen(request, slug):
    screen = get_object_or_404(Screen)
    
    return render_to_response(
        "screen.html",
        {"screen": screen}
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
