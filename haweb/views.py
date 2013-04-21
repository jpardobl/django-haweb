# Create your views here.
from models import Screen
from django.shortcuts import get_object_or_404, render_to_response


def screen(request, slug):
    screen = get_object_or_404(Screen)
    return render_to_response(
        "screen.html",
        {"screen": screen}
    )
