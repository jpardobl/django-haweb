from django.template import Library
from haweb.models import Control
from django.utils.safestring import mark_safe
register = Library()


@register.inclusion_tag("control.html")
def control(control):
    return {"control": control}
