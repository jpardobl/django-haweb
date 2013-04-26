from django import forms
from haweb.models import Control


class ControlForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(ControlForm, self).__init__(*args, **kwargs)
        self.fields["protocol"].widget.attrs = {"class": "span3"}
        self.fields["did"].widget.attrs = {"class": "span4"}
        self.fields["control_type"].widget.attrs = {"class": "span3"}

    class Meta:
        model = Control
