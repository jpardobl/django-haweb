from django import forms
from haweb.models import Control
from hautomation_x10 import settings

class ControlForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(ControlForm, self).__init__(*args, **kwargs)
        self.fields["protocol"] = forms.ChoiceField(choices=[ (x, x) for x in haclient.get_protocols(
            settings.HA_SERVER,
            settings.HA_USERNAME,
            settings.HA_PASSWORD,)])

        self.fields["protocol"].widget.attrs = {"class": "span3"}
        self.fields["did"].widget.attrs = {"class": "span4"}
        self.fields["control_type"].widget.attrs = {"class": "span3"}

    class Meta:
        model = Control
