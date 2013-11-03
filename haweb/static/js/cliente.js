/*******************************************************************
 *  cliente.js
 *******************************************************************/

/**************************************************************************
 *        Cliente
 **************************************************************************/
;(function (exports) {
    'use strict';

    /************************************************************
     *      Cliente class.
     ************************************************************/
    /********************************************
     *      Default config
     *
     ********************************************/
    var CLIENTE_CONFIG = {
        // Id of dom element parent. It has preference over parent gobj.
        parent_dom_id: ''
    };

    /********************************************
     *      Auxiliary
     ********************************************/
    function IsNumeric(num) {
        return (num >=0 || num < 0);
    }

    function pon_texto(self, texto) {
        self.$mensajes.html(texto);
    }

    /********************************************
     *      Configure events
     ********************************************/
    function configure_item_events(self) {
        /*--------------------------------*
         *      Set DOM events
         *--------------------------------*/

        /*
         *  Get our DOM elements
         */
        self.$mensajes = $('#mensajes');
        self.$button = $('#button');

        /*
         *  Configure events
         */
        self.$button.on("click", self, function(event){
            event.stopPropagation();
            var self = event.data;
            var kw = {
            };
            self.send_event(self, 'EV_COMANDO', kw);
        });

        return 1;
    }

    /***************************************************************
     *      Actions
     ***************************************************************/
    function ac_update_driver(self, event) {
        pon_texto(self, "Update driver recibido:" + event.kw.data);
        return 1;
    }


    /********************************************
     *      Automata
     ********************************************/
    var CLIENTE_FSM = {
        'event_list': [
            'EV_DEVICE_UPDATE: bottom input',
            'EV_ERROR: bottom input'
        ],
        'state_list': [
            'ST_IDLE',
            ],
        'machine': {
            'ST_IDLE':
            [
                ['EV_DEVICE_UPDATE',    ac_update_driver,   undefined],
                ['EV_ERROR',    ac_update_driver,   undefined]
            ]
        }
    }

    /********************************************
     *      Class
     ********************************************/
    var Cliente = GObj.__makeSubclass__();
    var proto = Cliente.prototype; // Easy access to the prototype
    proto.__init__= function(name, parent, kw, gaplic) {
        this.name = name || '';  // set before super(), to put the same smachine name
        GObj.prototype.__init__.call(this, CLIENTE_FSM, CLIENTE_CONFIG);
        __update_dict__(this.config, kw || {});
        return this;
    };
    proto.start_up= function() {
        //**********************************
        //  start_up
        //**********************************
        var self = this;
        configure_item_events(self);

        self.gaplic.subscribe_event_outside(
            'plugin_controller_gaplic',             // gaplic_name
            'hautomation',     // role
            'plugin_controller',       // gobj_name
            'EV_DEVICE_UPDATE',    // event_name
            self,           // subscriber_gobj
            null,           // origin_role
            {               // kw
                user_name: self.user_name
            }
        );
    }

    exports.Cliente = Cliente;
}(this));
