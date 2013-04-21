from django.db import models
from django.utils.translation import ugettext_lazy as _


class Control(models.Model):
    caption = models.CharField(_("caption"), max_length=30)
    protocol = models.CharField(_("protocol"), max_length=10)
    did = models.CharField(_("address"), max_length=100)
    control_type = models.CharField(_("control type"), max_length=7, choices=(("switch", "Switch"), ("dimmer", "Dimmer")))

    class Meta:
        verbose_name = _("Control")
        verbose_name_plural = _("Controls")

# Create your models here.
class Screen(models.Model):
    title = models.CharField(_("title"), max_length=100)
    slug = models.CharField(max_length=100)

    def __unicode__(self):
        return u"%s" % self.title
    class Meta:
        verbose_name = _("Screen")
        verbose_name_plural = _("Screens")


class ScreenControls(models.Model):
    screen = models.ForeignKey(Screen)
    control = models.ForeignKey(Control)
    order = models.IntegerField()
