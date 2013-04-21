from django.contrib import admin
from models import *


class ScreenAdmin(admin.ModelAdmin):
    pass
admin.site.register(Screen, ScreenAdmin)


class ControlAdmin(admin.ModelAdmin):
    pass
admin.site.register(Control, ControlAdmin)


class ScreenControlsAdmin(admin.ModelAdmin):
    pass
admin.site.register(ScreenControls, ScreenControlsAdmin)
