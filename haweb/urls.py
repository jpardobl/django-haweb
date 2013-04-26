from django.conf.urls import patterns, include, url
from django.conf.urls.i18n import i18n_patterns
from django.utils.translation import ugettext_lazy as _


urlpatterns = patterns('',

    url(_(r'^screen_cotrols/(?P<slug>[\w-]+)?/?$'), 'haweb.views.screen_controls', name='screen_controls'),
    url(r'^control/(?P<protocol>[a-z0-9A-Z]{3,4})?/?(?P<did>[\d\w]+)?', 'haweb.views.control', name='control_by_id'),

    url(r'^cmd/pl_switch/(?P<protocol>[a-z0-9A-Z]{3,4})?/?(?P<did>[\d\w]+)?/?(?P<value>[\d\w]+)?/?', 'haweb.views.pl_switch', name="pl_switch"),
    url(r'^cmd/pl_dim/(?P<protocol>[a-z0-9A-Z]{3,4})?/?(?P<did>[\d\w]+)?/?(?P<value>[\d\w]+)?/?', 'haweb.views.pl_dim', name="pl_dim"),
    url(r'^cmd/pl_bri/(?P<protocol>[a-z0-9A-Z]{3,4})?/?(?P<did>[\d\w]+)?/?(?P<value>[\d\w]+)?/?', 'haweb.views.pl_bri', name="pl_bri"),

    url(_(r'^(?P<slug>[\w-]+)?/?$'), 'haweb.views.screen', name='screen'),
)
