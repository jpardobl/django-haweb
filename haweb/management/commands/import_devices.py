import logging
from django.conf import settings
from hautomation_restclient.manage import list_devices
from django.core.management.base import BaseCommand, CommandError
from haweb.models import Control
from django.db import IntegrityError

class Command(BaseCommand):
    args = ''
    help = 'Imports all devices from Python Home Automation Python Project REST API server. Project must be configured'

   
    def handle(self, *args, **options):
        logging.basicConfig(level=logging.DEBUG)

        while True:
            protocol = raw_input("PLease insert the protocol of the devices to import? ")
            if len(protocol) == 0:
                self.stderr.write("Answer not valid. Protocol?")
                continue
            break
        
        devices = list_devices(protocol, settings.HA_SERVER, settings.HA_USERNAME, settings.HA_PASSWORD)
        
        for dev in devices:
            logging.info("Adding device DID: %s" % dev["did"])
            c = Control(
                did=dev["did"],
                protocol=protocol,
                caption=dev["caption"],
                control_type=dev["device_type"],
                )
            try:
                c.save()
            except IntegrityError:
                continue
            