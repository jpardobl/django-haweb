from django.conf.urls import patterns, include, url
from django.conf.urls.i18n import i18n_patterns
from django.utils.translation import ugettext_lazy as _


urlpatterns = patterns('',
    url(_(r'^screen/(?P<slug>[\w-]+)/$'), 'haweb.views.screen', name='screen'),
)
