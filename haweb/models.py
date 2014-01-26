from django.db import models
from django.utils.translation import ugettext_lazy as _
from hautomation_restclient import manage as haclient
from django.conf import settings
from django.db import IntegrityError


class RestApiException(Exception):
    pass

try:
    PROTOCOL_CHOICES = [(x, x) for x in haclient.get_protocols(
        settings.HA_SERVER,
        settings.HA_USERNAME,
        settings.HA_PASSWORD,)]
except Exception:
    PROTOCOL_CHOICES = ()



class Control(models.Model):
    caption = models.CharField(_("caption"), max_length=30)
    protocol = models.CharField(_("protocol"), choices=PROTOCOL_CHOICES, max_length=10)
    did = models.CharField(_("address"), max_length=100)
    control_type = models.CharField(
        _("control type"),
        max_length=7,
        choices=(("switch", "Switch"), ("dimmer", "Dimmer")))

    def __unicode__(self):
        return u"%s" % self.caption

    def save(self, *args, **kwargs):
        try:
            if self.id is None:
                haclient.add_device(
                    self.protocol,
                    self.did,
                    self.caption,
                    self.control_type,
                    settings.HA_SERVER,
                    settings.HA_USERNAME,
                    settings.HA_PASSWORD,)

            else:
                haclient.upd_device(
                    self.protocol,
                    self.did,
                    settings.HA_SERVER,
                    "caption=%s&device_type=%s" % (self.caption, self.control_type),
                    settings.HA_USERNAME,
                    settings.HA_PASSWORD,
                )
            return super(Control, self).save(*args, **kwargs)
            

        except haclient.RestApiException, err:
            if err.status_code == 409:
                return super(Control, self).save(*args, **kwargs)
                raise IntegrityError(err)
            raise

    def delete(self, *args, **kwargs):

        haclient.del_device(
            self.protocol,
            self.did,
            settings.HA_SERVER,
            settings.HA_USERNAME,
            settings.HA_PASSWORD,)

        return super(Control, self).delete(*args, **kwargs)

    class Meta:
        verbose_name = _("Control")
        verbose_name_plural = _("Controls")


# Create your models here.
class Screen(models.Model):
    title = models.CharField(_("title"), max_length=100)
    slug = models.CharField(max_length=100)

    @property
    def controls(self):
        return Control.objects.filter(
            id__in=[x.control.id for x in ScreenControls.objects.filter(screen=self)])

    def __unicode__(self):
        return u"%s" % self.title

    class Meta:
        verbose_name = _("Screen")
        verbose_name_plural = _("Screens")


class ScreenControls(models.Model):
    screen = models.ForeignKey(Screen)
    control = models.ForeignKey(Control)
    order = models.IntegerField()

    def __unicode__(self):
        return u"%s(%s)" % (self.control, self.order)

    def save(self, *args, **kwargs):
        if self.id is None and self.order is None:
            self.order = ScreenControls.objects.filter(screen=self.screen).count() + 1

        return super(ScreenControls, self).save(*args, **kwargs)


    class Meta:
        ordering = ["order", ]
