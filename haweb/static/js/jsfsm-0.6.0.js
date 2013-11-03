/*  jsfsm: Port of python ginsfsm packate
 *  Author: Ginés Martínez Sánchez
 *  Email: ginsmar at artgins.com
 *  Licence: MIT (http://www.opensource.org/licenses/mit-license)
 */

/**********************************************************
 *        Auxiliary functions
 **********************************************************/
Function.prototype.__makeSubclass__ = function() {
    'use strict';

    function Class() {
        if (!(this instanceof Class)) {
              throw('Constructor called without "new"');
        }
        if ('__init__' in this) {
            this.__init__.apply(this, arguments);
        }
    }
    Function.prototype.__makeSubclass__.nonconstructor.prototype= this.prototype;
    Class.prototype= new Function.prototype.__makeSubclass__.nonconstructor();
    return Class;
};
Function.prototype.__makeSubclass__.nonconstructor= function() {};

/* Update a dict with another dict: ONLY existing items!! */
function __update_dict__(destination, source) {
    'use strict';
    for (var property in source) {
        if (destination.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    return destination;
}


/**
 * Finds the index of the element in the array.
 *
 * @param {Function} elm Element to look for.
 * @param {Function[]} list Array to search through.
 * @return {Number} Index of the specified elm, -1 if not found
 */
function index_of_list(elm, list) {
    'use strict';
    // Existence of a native index
    var nativeIndexOf = list.indexOf? true : false;

    // Return the index via the native method if possible
    if(nativeIndexOf) {
        return list.indexOf(elm);
    }

    // There is no native method
    // Use a manual loop to find the index
    var i = list.length;
    while(i--) {
        // If the elm matches, return it's index
        if(list[i] === elm) {
            return i;
        }
    }

    // Default to returning -1
    return -1;
}

function __clone__(obj) {
    'use strict';
    if(obj === null || obj === undefined || typeof(obj) !== 'object') {
        return obj;
    }
    var temp = new obj.constructor();
    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            temp[key] = __clone__(obj[key]);
        }
    }
    return temp;
}

function elm_in_list(elm, list) {
    'use strict';
    if(list===undefined || list === null) {
        throw "ERROR: elm_in_list() list empty";
    }
    for(var i=0; i<list.length; i++) {
        if(elm === list[i]) {
            return true;
        }
    }
    return false;
}

function none_in_list(list) {
    'use strict';
    for(var i=0; i<list.length; i++) {
        if(!list[i]) {
            return true;
        }
    }
    return false;
}

function delete_from_list(list, elm) {
    'use strict';
    for(var i=0; i<list.length; i++) {
        if(elm === list[i]) {
            list.splice(i,1);
            return true;
        }
    }
    return false; // elm doesn't exist!
}

function same_list(arrA, arrB) {
    'use strict';
    //check if lengths are different
    if(arrA.length !== arrB.length) {
        return false;
    }

    //slice so we do not effect the orginal
    //sort makes sure they are in order
    var cA = arrA.slice().sort();
    var cB = arrB.slice().sort();

    for(var i=0;i<cA.length; i++) {
        if(cA[i]!==cB[i]) {
            return false;
        }
    }
    return true;
}

function __strip__(s){
    'use strict';
    return ( s || '' ).replace( /^\s+|\s+$/g, '' );
}

function __set__(arr) {
    'use strict';
    var seen = {},
        result = [];
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        var el = arr[i];
        if (!seen[el]) {
            seen[el] = true;
            result.push(el);
        }
    }
    return result;
}

function get_function_name(func) {
    'use strict';
    var fName = null;
    if (typeof func === "function" || typeof func === "object") {
        fName = ("" + func).match(/function\s*([\w\$]*)\s*\(/);
    }
    if (fName !== null) {
        return fName[1] + '()';
    }
    return '';
}


if(typeof GLOBAL !== 'undefined') {
    // export to node.js
    GLOBAL.__clone__ = __clone__;
    GLOBAL.index_of_list = index_of_list;
    GLOBAL.elm_in_list = elm_in_list;
    GLOBAL.delete_from_list = delete_from_list;
    GLOBAL.__strip__ = __strip__;
    GLOBAL.__set__ = __set__;
    GLOBAL.get_function_name = get_function_name;
    GLOBAL.__update_dict__ = __update_dict__;
    GLOBAL.same_list = same_list;
    GLOBAL.none_in_list = none_in_list;
}

/*  SMachine: A simple Finite State Machine.
 *  Same functionality as smachine.py (ginsfsm package)
 *  Author: Ginés Martínez Sánchez
 *  Email: ginsmar at artgins.com
 *  Licence: MIT (http://www.opensource.org/licenses/mit-license)
 */

/**************************************************************************
 *        SMachine
 **************************************************************************/
; (function(exports) {
    'use strict';

    /************************************************************
     *        SMachine
     ************************************************************/
    var SMachine = {
    };
    SMachine._inside = 0;
    SMachine.tracing = false;
    SMachine.logger = function(msg) {
        console.log(msg);
    };

    /************************************************************
     *        Get current "fecha"
     ************************************************************/
    function get_current_datetime() {
        var currentTime = new Date();
        var month = currentTime.getMonth() + 1;
        if (month < 10) {
            month = "0" + month;
        }
        var day = currentTime.getDate();
        if (day < 10) {
            day = "0" + day;
        }
        var year = currentTime.getFullYear();
        var fecha = year + "/" + month + "/" + day;

        var hours = currentTime.getHours();
        if (hours < 10) {
            hours = "0" + hours;
        }
        var minutes = currentTime.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var seconds = currentTime.getSeconds();
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        var hora = hours + ":" + minutes + ":" + seconds;
        return fecha + " " + hora;
    }

    /************************************************************
     *        Timeout functions
     ************************************************************/
    SMachine.set_timeout = function(fsm, msec) {
        if (!fsm) {
            var msg = "ERROR SMachine.set_timeout(): fsm is NULL";
            this.logger(msg);
            throw msg;
        }
        if (fsm.timer_id !== -1) {
            clearTimeout(fsm.timer_id);
            fsm.timer_id = -1;
        }
        if(msec !== -1) {
            fsm.timer_id = setTimeout(
                function() {
                    SMachine.got_timer(fsm);
                },
                msec
            );
        }
    };

    SMachine.clear_timeout = function(fsm) {
        if (fsm.timer_id !== -1) {
            clearTimeout(fsm.timer_id);
            fsm.timer_id = -1;
        }
	}

    SMachine.got_timer = function(fsm) {
        //this.logger("GOT_TIMER!!!! on " + fsm.name);
        fsm.timer_id = -1;
        SMachine.inject_event(fsm, fsm.timer_event_name);
    };

    /************************************************************
     *        Create
     ************************************************************/
    SMachine.create = function(fsm_desc, gobj) {
        if (!fsm_desc) {
            var msg = 'SMachine.create() did not get parameter fsm_desc';
            this.logger(msg);
            throw msg;
        }
        var fsm = {};
        var self = fsm;
        self.gobj = gobj;
        self.name = fsm_desc.name || '';
        self.event_list = __clone__(fsm_desc.event_list) || [];
        self.event_attrs = [];
        self.state_list = __clone__(fsm_desc.state_list) || [];
        self.states = [];
        self.last_state = 0;
        self.current_state = 1;
        self.timer_id = -1; // for now, only one timer per fsm, and hardcoded.
        self.timer_event_name = "EV_TIMEOUT";

        /*
         *  If exists gobj, this will be the first input parameter
         *  when executing the actions, instead of fsm.
         */
        if (self.gobj) {
            self.gobj.fsm = fsm;
        }

        // check state names
        var state_names = __clone__(fsm.state_list); // dup list
        for (var st_name in fsm_desc.machine) {
            if (elm_in_list(st_name, state_names)) {
                delete_from_list(state_names, st_name);
            } else {
                var msg = "machine state: " + st_name + " is NOT in state-list";
                this.logger(msg);
                throw msg;
            }
        }
        if (state_names.length > 0) {
            var msg = "state-list OVERFILLED: " + state_names;
            this.logger(msg);
            throw msg;
        }

        // remove attributes from event_list and move attrs to _event_attr list
        var event_list = [];
        var event_attrs = [];
        for (var i=0; i<self.event_list.length; i++) {
            var ev = self.event_list[i];
            var name = ev.split(':');
            var ev_name = name[0];
            ev_name = __strip__(ev_name);
            event_list.push(ev_name);

            var ev_attrs = name[1];
            ev_attrs = __strip__(ev_attrs);
            var attrs_list = ev_attrs.split(' ');
            event_attrs.push(attrs_list);
        }
        self.event_list = event_list;
        self.event_attrs = event_attrs;

        // build _output_set from event attributes
        var output_set = []; //__set__()
        for(var idx=0; idx < self.event_list.length; idx++) {
            var ev_name = self.event_list[idx];
            var attrs = self.event_attrs[idx];
            if (elm_in_list('output', attrs)) {
                output_set.push(ev_name);
            }
        }
        self.output_set = __set__(output_set);

        // check event names
        var event_names = __clone__(self.event_list);
        var set_event_names = __clone__(self.output_set);  // start with output_set!
        for (var st in fsm_desc.machine) {
            if (fsm_desc.machine.hasOwnProperty(st)) {
                var st_desc = fsm_desc.machine[st];
                var len = st_desc.length;
                for (var idx=0; idx < len; idx++) {
                    var ev_ac_nt = st_desc[idx];
                    if (!ev_ac_nt) {
                        // In IE the last comma in a list [] include a new undefined element.
                        continue;
                    }
                    var ev_name = ev_ac_nt[0];
                    var ac = ev_ac_nt[1];
                    var nt = ev_ac_nt[2];

                    if (elm_in_list(ev_name, event_names)) {
                        set_event_names.push(ev_name);
                    } else {
                        var msg = "event name: "+ ev_name + " is NOT in event-list";
                        this.logger(msg);
                        throw msg;
                    }
                }
              }
        }
        set_event_names = __set__(set_event_names);
        if (event_names.length !== set_event_names.length) {
            var msg = "event-list OVERFILLED: /" + event_names + " /" + set_event_names;
            this.logger(msg);
            throw msg;
        }

        // check next state names and actions
        state_names = __clone__(self.state_list);
        for (var st in fsm_desc.machine) {
            if (fsm_desc.machine.hasOwnProperty(st)) {
              var st_desc = fsm_desc.machine[st];
              var len = st_desc.length;
              for (var idx=0; idx < len; idx++) {
                var ev_ac_nt = st_desc[idx];
                if (!ev_ac_nt) {
                    // In IE the last comma in a list [] include a new undefined element.
                    continue;
                }
                var ev_name = ev_ac_nt[0];
                var ac = ev_ac_nt[1];
                var nt = ev_ac_nt[2];

                if (nt && !elm_in_list(nt, state_names)) {
                    var msg = "next statename: "+ nt + " is NOT in state-list";
                    this.logger(msg);
                    throw msg;
                }
                if(ac && typeof ac !== 'function') {
                    var msg = "action: "+ ac + " is NOT a FUNCTION";
                    this.logger(msg);
                    throw msg;
                }
              }
            }
        }

        // Build constant names (like C enum) for states: dict of name:id
        self.state_index = {'': 0};
        for(var i=0; i<self.state_list.length; i++) {
            var elm = self.state_list[i];
            self.state_index[elm] = i+1;
        }

        // Build constant names (like C enum) for events: dict of name:id
        self.event_index = {'': 0};
        for(var i=0; i<self.event_list.length; i++) {
            var elm = self.event_list[i];
            self.event_index[elm] = i+1;
        }

        /*
        #   Build list of states
        #   self._states is organized as:
        #
        #   [0]
        #       [0] [1] [2]... [n.events-1]
        #   [1]
        #       [0] [1] [2]... [n.events-1]
        #   [2]
        #       [0] [1] [2]... [n.events-1]
        #   ...
        #   [n.states-1]
        #       [0] [1] [2]... [n.events-1]
        #            |
        #            `--> [action, next_state]
        #
        #
        #   If a event is defined in a state, then,
        #   the element is a list([action,next_state]) instead of int.
        #
        #   This organization occupies more memory than necessary,
        #   but the execution is faster.
        #
        */

        self.states = new Array(self.state_list.length+1);
        for(var i=0; i<self.state_list.length; i++) {
            var st = self.state_list[i];
            var st_idx = self.state_index[st];
            var st_desc = fsm_desc.machine[st];
            self.states[st_idx] = new Array(self.event_list.length + 1);

            for(var j=0; j<st_desc.length; j++) {
                var ev_ac_nt = st_desc[j];
                if (!ev_ac_nt) {
                    // In IE the last comma in a list [] include a new undefined element.
                    continue;
                }

                var iev = self.event_index[ev_ac_nt[0]];
                // Get the action
                var ac = ev_ac_nt[1];
                // Save the next state
                var next_state_id;
                if (ev_ac_nt[2]) {
                    next_state_id = self.state_index[ev_ac_nt[2]];
                } else {
                    next_state_id = undefined;
                }
                // Save action/next-state
                self.states[st_idx][iev] = [ac, next_state_id];
            }
        }
        return fsm;
    };

    /************************************************************
     *        public set_new_state
     ************************************************************/
    SMachine.set_new_state = function(fsm, new_state) {
        if (!fsm) {
            var msg = "ERROR SMachine.set_new_state(): fsm is NULL";
            this.logger(msg);
            throw msg;
        }
        var state_id = fsm.state_index[new_state] || 0;
        if (state_id <= 0) {
            var msg = "ERROR set_new_state UNKNOWN: " + new_state;
            this.logger(msg);
            throw msg;
        }
        SMachine._set_new_state(fsm, state_id);
        //this.logger("set_new_state of '" + fsm.name + "' to: " + state_id);
    };

    /************************************************************
     *        private set_new_state
     ************************************************************/
    SMachine._set_new_state = function(fsm, state_id) {
        if (!fsm) {
            var msg = "ERROR SMachine.___set_new_state(): fsm is NULL";
            this.logger(msg);
            throw msg;
        }
        if (state_id <= 0 || state_id > fsm.state_list.length) {
            var msg = "___set_new_state() state_id INVALID " + state_id;
            this.logger(msg);
            throw msg;
        }
        var tracing = false;
        if (this.tracing || (fsm.gobj && fsm.gobj._get_machine_trace())) {
            tracing = true;
        }
        fsm.last_state = fsm.current_state;
        fsm.current_state = state_id;
        if (tracing) {
            if (fsm.last_state !== state_id) {
                var hora = get_current_datetime();
                var msg = hora + this._tab(fsm) + ' - mach: ' + fsm.name +
                    ', new_st: ' + fsm.state_list[state_id-1];
                this.logger(msg);
            }
        }
    };

    /************************************************************
     *        Return the name of the current state.
     ************************************************************/
    SMachine.get_current_state = function(fsm) {

        if (fsm.current_state <= 0 || fsm.state_list.length == 0) {
            return null;
        }
        return fsm.state_list[fsm.current_state - 1];
	}

    /************************************************************
     *        Inject event.
     ************************************************************/
    SMachine.inject_event = function(fsm, event) {
        if (!fsm) {
            var msg = "ERROR SMachine.inject_event(): fsm is NULL";
            this.logger(msg);
            throw msg;
        }
        var self = fsm;
        var logger = this.logger;
        var event_name;
        var result;
        var action;

        if (typeof event === 'string') {
            event_name = event;
        } else {
            if (!event.hasOwnProperty('event_name')) {
                var msg = "ERROR SMachine.inject_event(): invalid event TYPE";
                this.logger(msg);
                throw msg;
            }
            event_name = event.event_name;
        }

        var event_id = self.event_index[event_name] || 0;
        if (event_id <= 0) {
            var msg = "ERROR SMachine.inject_event('" + self.name +
				"'): UNKNOWN event '" + event_name + "'";
            this.logger(msg);
            throw msg;
        }

        this._increase_inside(fsm);

        if (self.states) {
            action = self.states[self.current_state][event_id];
        }

        var tracing = false;
        var hora;
        if (this.tracing || (fsm.gobj && fsm.gobj._get_machine_trace())) {
            tracing = true;
            hora = get_current_datetime();
        }

        if (!action) {
            var msg = hora + this._tab(fsm) + '-> mach: ' + self.name +
                ', st: ' + self.state_list[self.current_state-1] +
                ', ev: ' + event_name + " (NOT ACCEPTED, no match action)";
            this.logger(msg);
            this._decrease_inside(fsm);
            return -1;  //# EventNotAcceptedError
        }

        if (tracing) {
            var action_name = '';
            if (action[0]) {
                action_name = get_function_name(action[0]);
            }
            var msg = hora + this._tab(fsm) + '-> mach: ' + self.name +
                ', st: ' + self.state_list[self.current_state-1] +
                ', ev: ' + self.event_list[event_id - 1] +
                ', ac: ' + action_name;
            this.logger(msg);
        }

        var action_self;
        // If gobj exists, it will be the first parameter, else, fsm.
        if (self.gobj) {
            action_self = self.gobj;
        } else {
            action_self = self;
        }

        if (action[1]) {
            SMachine._set_new_state(self, action[1]);
        }

        if(tracing) {
            // In develop is better not to catch the interrupt for have more info.
            if (action[0]) {
                //# Action found, execute
                result = action[0](action_self, event);
            }
        } else {
            try {
                if (action[0]) {
                    //# Action found, execute
                    result = action[0](action_self, event);
                }
            } catch (e) {
                var msg = "ERROR executing the action: " + e;
                this.logger(msg);
            }
        }

        if (tracing) {
                var msg = hora + this._tab(fsm) + '<- mach: ' + self.name +
                    ', st: ' + self.state_list[self.current_state-1] +
                    ', ret: ' + result;
                this.logger(msg);
            }

        this._decrease_inside(fsm);
        return result;
    };

    /************************************************************
     *        get event lists.
     ************************************************************/
    SMachine.get_event_list = function(fsm) {
        var list = __clone__(fsm.event_list) || [];
        return list;
    };

    SMachine.get_output_event_list = function(fsm) {
        var list = __clone__(fsm.output_set) || [];
        return list;
    };

    /************************************************************
     *        return current indent.
     ************************************************************/
    SMachine.get_current_state = function(fsm) {
        if (!fsm) {
            var msg = "ERROR SMachine.get_new_state(): fsm is NULL";
            this.logger(msg);
            throw msg;
        }
        if (fsm.current_state <= 0 || fsm.state_list.length === 0) {
            return undefined;
        }
        return fsm.state_list[fsm.current_state - 1];
    };

    /************************************************************
     *        set tracing
     *        Do the trace global for all smachines.
     ************************************************************/
    SMachine.set_machine_trace = function(value) {
        this.tracing = value;
    };

    /************************************************************
     *        indentation functions.
     ************************************************************/
    SMachine._tab = function(fsm) {
        // Yeah, I know my grandfather.
        if(fsm.gobj && fsm.gobj.gaplic && fsm.gobj.gaplic._tab) {
            return fsm.gobj.gaplic._tab();
        }

        var self = this;
        var spaces, pad;
        if (self._inside <= 0) {
            spaces = 1;
        } else {
            spaces = self._inside * 2;
        }
        pad = '';
        while (spaces--) {
            pad += ' ';
        }
        return pad;
    };

    SMachine._increase_inside = function(fsm) {
        // Yeah, I know my grandfather.
        if(fsm.gobj && fsm.gobj.gaplic && fsm.gobj.gaplic._increase_inside) {
            fsm.gobj.gaplic._increase_inside();
            return;
        }
        this._inside += 1;
    };
    SMachine._decrease_inside = function(fsm) {
        // Yeah, I know my grandfather.
        if(fsm.gobj && fsm.gobj.gaplic && fsm.gobj.gaplic._decrease_inside) {
            fsm.gobj.gaplic._decrease_inside();
            return;
        }
        this._inside -= 1;
    };

    //=======================================================================
    //      Expose the class via the global object
    //=======================================================================
	exports.SMachine = SMachine;
	exports.get_current_datetime = get_current_datetime;

}(this));

/*  GObj: Objects with a simple Finite State Machine.
 *  Same functionality as gobj.py (ginsfsm package)
 *  Author: Ginés Martínez Sánchez
 *  Email: ginsmar at artgins.com
 *  Licence: MIT (http://www.opensource.org/licenses/mit-license)
 */

/**************************************************************************
 *        GObj
 **************************************************************************/
;(function(exports) {
    // Place the script in strict mode
    'use strict';

    /************************************************************
     *      Event class.
     ************************************************************/
    function Event(destination, event_name, source, kw) {
        this.destination = destination;
        this.event_name = event_name;
        this.source = source;
        this.kw = kw;
    }

    /************************************************************
     *      _Subscription class.
     ************************************************************/
    function _Subscription(event_name, subscriber_gobj, kw) {
        this.event_name = event_name;
        this.subscriber_gobj = subscriber_gobj;
        this.kw = kw;
    }

    /************************************************************
     *      GObj class.
     ************************************************************/
    var GObj = Object.__makeSubclass__();
    var proto = GObj.prototype; // Easy access to the prototype

    proto.__init__= function(fsm_desc, config) {
        var self = this;
        self.fsm = SMachine.create(fsm_desc, self);
        if (self.name) {
            self.fsm.name = self.name;
        }
        self.config = __clone__(config);
        self.gaplic = undefined;
        self.parent = undefined;
        self._dl_subscriptions = [];
        self.dl_childs = [];
        self.tracing = false;

        // Help to jquery links.
        self.$head_insert_point = null;
        self.$tail_insert_point = null;

        return self;
    };

    proto.logger = function(msg) {
        console.log(msg);
    };

    /************************************************************
     *        JQuery Helpers.
     ************************************************************/
    /*
     *  Head/tail to link with jquery parent/childs elements.
     */
    proto.get_head_insert_point = function() {
        return this.$head_insert_point;
    }
    proto.get_tail_insert_point = function() {
        return this.$tail_insert_point;
    }
    proto.build_jquery_link_list = function() {
        var self = this;
        var elm = self.config.parent_dom_id;
        if (elm) {
            var $elm = $(elm);
            $elm.append(self.get_head_insert_point());
        } else {
            if (!self.parent) {
                var msg = "ERROR GObj '" + self.name + "' WITHOUT parent";
                self.gaplic.logger(msg);
                throw msg;
            }
            var $parent_insert_point = self.parent.get_tail_insert_point();
            if ($parent_insert_point) {
                var child_insert_point = self.get_head_insert_point();
                if (child_insert_point) {
                    $parent_insert_point.append(self.get_head_insert_point());
                }
            }
        }
    }

    /************************************************************
     *        add child.
     ************************************************************/
    proto._add_child = function(gobj) {
        if (gobj.parent) {
            var msg = "ERROR GObj._add_child(): ALREADY HAS PARENT";
            this.logger(msg);
            throw msg;
        }
        this.dl_childs.push(gobj);
        gobj.parent = this;
    };

    /************************************************************
     *        get n-child.
     ************************************************************/
    proto.get_nchild = function(n) {
        return this.dl_childs[n];
    };

    /************************************************************
     *        set tracing for this gobj.
     ************************************************************/
    proto.set_machine_trace = function(value) {
        this.tracing = value;
    };
    proto._get_machine_trace = function() {
        return this.tracing;
    };

    /************************************************************
     *      wrap SMachine set_timeout
     ************************************************************/
    proto.set_timeout = function(msec) {
        SMachine.set_timeout(this.fsm, msec);
    }
    proto.clear_timeout = function() {
        SMachine.clear_timeout(this.fsm);
    }

    /************************************************************
     *      wrap SMachine set_new_state
     ************************************************************/
    proto.set_new_state = function(new_state) {
        SMachine.set_new_state(this.fsm, new_state);
    }
    proto.get_current_state = function() {
        return SMachine.get_current_state(this.fsm);
    }

    /************************************************************
     *      _event_factory
     ************************************************************/
    proto._event_factory = function(destination, event, kw) {
        if (!(typeof event === 'string' || event instanceof Event)) {
            var msg = "ERROR GObj._event_factory(): BAD TYPE event";
            this.logger(msg);
            throw msg;
        }

        if (!(typeof destination === 'string' || destination instanceof GObj)) {
            var msg = "ERROR GObj._event_factory(): BAD TYPE destination";
            this.logger(msg);
            throw msg;
        }

        if (event instanceof Event) {
            // duplicate the event
            //TODO: if event.source[-1] != self:
            //    event.source.append(self)
            event = new Event(event.destination,
                event.event_name,
                event.source,
                event.kw);
            // TODO: if len(kw):
            //    event.__dict__.update(**kw)
            if (destination) {
                event.destination = destination;
            }
        } else {
            event = new Event(destination, event, this, kw);
        }

        return event;
    };

    /************************************************************
     *      send_event
     ************************************************************/
    proto.send_event = function(destination, event, kw) {
        //TODO: destination = self._resolv_destination(destination)
        var fsm;
        var ret;
        if (!destination || !destination.fsm) {
            var name = event.name || event;
            var msg = "ERROR send_event('"+ name + "') NO DESTINATION.";
            this.logger(msg);
            throw msg;
        }
        fsm = destination.fsm;
        event = this._event_factory(destination, event, kw || {});
        ret = SMachine.inject_event(fsm, event);
        return ret;
    };

    /************************************************************
     *      post_event
     ************************************************************/
    proto.post_event = function(destination, event, kw) {
        event = this._event_factory(destination, event, kw || {});
        this._enqueue_event(event);
    };

    /************************************************************
     *      _enqueue_event
     ************************************************************/
    proto._enqueue_event = function(event) {
        if (this.gaplic) {
            // Yeah, I know my parent.
            this.gaplic._enqueue_event(event);
        } else {
            var msg = "ERROR _enqueue_event() no supported.";
            this.logger(msg);
            throw msg;
        }
    };

    /************************************************************
     *      broadcast_event
     ************************************************************/
    proto.broadcast_event = function(oevent, kw) {
        if (this._some_subscriptions) {
            //var subscriptions = __clone__(this._dl_subscriptions); bucle infinito
            var subscriptions = this._dl_subscriptions;
            var sended_gobj = [];  // don't repeat events
            var len = subscriptions.length;
            for(var i=0; i<len; i++) {
                var sub = subscriptions[i];
                if (elm_in_list(sub.subscriber_gobj, sended_gobj)) {
                    continue;
                }
                var event = this._event_factory(sub.subscriber_gobj, oevent, kw);

                if (none_in_list(sub.event_name) || elm_in_list(event.event_name, sub.event_name)) {
                    var ret;

                    var change_original_event_name = sub.kw.change_original_event_name;
                    if (change_original_event_name) {
                        event.event_name = change_original_event_name;
                    }
                    //if hasattr(sub, 'use_post_event'):
                    //    ret = self.post_event(sub.subscriber_gobj, event)
                    //else:
                    ret = this.send_event(sub.subscriber_gobj, event);
                    sended_gobj.push(sub.subscriber_gobj);
                    /*
                    if (this.owned_event_filter) {
                        ret = self.owned_event_filter(ret)
                        if ret is True:
                            return True  # propietary event, retorno otra cosa?
                    }
                    */
                }
            }
        }
    };

    /************************************************************
     *      subscribe_event
     ************************************************************/
    proto.subscribe_event = function(event_name, subscriber_gobj, kw) {
        subscriber_gobj = subscriber_gobj || this.parent;
        kw = kw || {};
        if (subscriber_gobj) {
            if (!(typeof subscriber_gobj === 'string' || subscriber_gobj instanceof GObj)) {
                var msg = "ERROR GObj.subscribe_event(): BAD TYPE subscriber_gobj";
                this.logger(msg);
                throw msg;
            }

            if (typeof subscriber_gobj === 'string') {
                var new_subscriber_gobj = this.gaplic.find_unique_gobj(subscriber_gobj);
                if (!new_subscriber_gobj) {
                    var msg = "ERROR GObj.subscribe_event(): '" + subscriber_gobj + "' gobj NOT FOUND";
                    this.logger(msg);
                    throw msg;
                }
                subscriber_gobj = new_subscriber_gobj;
            }
        }

        var output_events = SMachine.get_output_event_list(this.fsm);

        if (!(event_name instanceof Array)) {
            event_name = [event_name];
        }

        for (var i=0; i<event_name.length; i++) {
            var name = event_name[i];
            if (!name) {
                continue;
            }

            if (!(typeof name === 'string')) {
                var msg = "ERROR GObj.subscribe_event('" + this.name + "'): '"
                    + name + "' is not a string";
                this.logger(msg);
                throw msg;
            }

            if (!elm_in_list(name, output_events)) {
                var msg = "ERROR GObj.subscribe_event('" + this.name + "'): '"
                    + name + "' not in output-event list";
                this.logger(msg);
                throw msg;
            }
        }

        var existing_subs = this._find_subscription(event_name, subscriber_gobj);
        if (existing_subs) {
            // avoid duplication subscriptions
            this.delete_subscription(event_name, subscriber_gobj);
        }
        var subscription = new _Subscription(event_name, subscriber_gobj, kw);
        this._dl_subscriptions.push(subscription);
        this._some_subscriptions = true;
    };

    /************************************************************
     *      _find_subscription
     ************************************************************/
    proto._find_subscription = function(event_name, subscriber_gobj) {
        if (!(event_name instanceof Array)) {
            event_name = [event_name];
        }

        for(var i=0; i<this._dl_subscriptions.length; i++) {
            var sub = this._dl_subscriptions[i];
            if (same_list(sub.event_name, event_name) &&
                    sub.subscriber_gobj === subscriber_gobj) {
                return sub;
            }
        }
        return undefined;
    };

    /************************************************************
     *      delete_subscription
     ************************************************************/
    proto.delete_subscription = function(event_name, subscriber_gobj) {
        var existing_subs = this._find_subscription(event_name, subscriber_gobj);
        if (existing_subs) {
            delete_from_list(this._dl_subscriptions, existing_subs);
            if (this._dl_subscriptions.length > 0) {
                this._some_subscriptions = false;
            }
            return true;
        }
        var msg = "ERROR SMachine.delete_subscription(): sub '" + event_name + "' NOT FOUND";
        this.logger(msg);
        return false;
    };

    //=======================================================================
    //      Expose the class via the global object
    //=======================================================================
    exports.GObj = GObj;
    exports.Event = Event;
}(this));

/*  GRouter: interchange of events between gaplics.
 *  Same functionality as router.py (ginsfsm package)
 *  Author: Ginés Martínez Sánchez
 *  Email: ginsmar at artgins.com
 *  Licence: MIT (http://www.opensource.org/licenses/mit-license)
 */

/*  GAplic
 *  Same functionality as gaplic.py (ginsfsm package)
 *  Author: Ginés Martínez Sánchez
 *  Email: ginsmar at artgins.com
 *  Licence: MIT (http://www.opensource.org/licenses/mit-license)
 */

/**************************************************************************
 *        GAplic
 **************************************************************************/
;(function (exports) {
    'use strict';

    /************************************************************
     *      Global system of gaplics
     ************************************************************/
    /*
     *  To facilite the work with jquery, I generate all gobjs as named gobjs.
     *  If a gobj has no name, generate a unique name with uniqued_id.
     */
    var unique_id = 0;

    function get_unique_id()
    {
        ++unique_id;
        return unique_id
    }

    /*
     *  Callbacks to create all gobjs after gaplic and main gobj
     *  has beeen created.
     */
    var callbacks = {};

    function add_gaplic_callback(spacename, fn) {
        var callback = callbacks[spacename];
        if (!callback) {
             callback = callbacks[spacename] = jQuery.Callbacks();
        }
        callback.add(fn);
    }

    /*
     *  Fire callback functions
     */
    function fire_gaplic_callbacks(spacename, gaplic) {
        var callback = callbacks[spacename];
        if (callback) {
            callback.fire(gaplic);
        }
    }



    /************************************************************
     *      GAplic class.
     ************************************************************/
    function process_qevent(gobj) {
        var MAX_ITERATIONS = 10;
        var gaplic = gobj.gaplic;
        var qevent = gaplic.qevent;
        for (var it=0; it<MAX_ITERATIONS; it++) {
            if(qevent.length > 0) {
                var ev = qevent.shift();
                ev.source.send_event(ev.destination, ev.event_name, ev.kw);
            }
        }
        if(qevent.length > 0) {
            // continue later processing events.
            gobj.set_timeout(gobj, 10);
        }
        return 1;
    }
    var GAPLIC_FSM = {
        'event_list': [
            'EV_TIMEOUT: top output'
        ],
        'state_list': ['ST_IDLE'],
        'machine': {
            'ST_IDLE':
            [
                ['EV_TIMEOUT', process_qevent, 'ST_IDLE']
            ]
        }
    };
    var GAPLIC_CONFIG = {
    };

    var GAplic = GObj.__makeSubclass__();
    var proto = GAplic.prototype; // Easy access to the prototype

    GAplic.prototype.__init__= function(name, roles, settings) {
        this.name = name || '';  // set before super(), to put the same smachine name
        if (typeof roles === 'string') {
            this.roles = [roles];
        } else {
            this.roles = roles || [];
        }
        GObj.prototype.__init__.call(this, GAPLIC_FSM, GAPLIC_CONFIG);
        __update_dict__(this.config, settings || {});
        this.parent = null;
        this.qevent = [];   // queue for post events.
        this.gaplic = this;
        this._inside = 0;
        this._unique_named_gobjs = {};

        this.start_up()

    };
    proto.logger = function(msg) {
        console.log(msg);
    };
    proto.start_up = function() {
        /**********************************
         *          Start up
         **********************************/
        var self = this;
        self.router = self.create_gobj(
            'router',
            GRouter,
            self
        );
        self.router.set_machine_trace(true);
    };

    /************************************************************
     *        create_gobj factory.
     *
    The gclass have to be defined as:

    var GClass = GObj.__makeSubclass__();
    var proto = GClass.prototype; // Easy access to the prototype
    proto.__init__= function(name, parent, kw) {
        this.name = name || '';  // set before super(), to put the same smachine name
        GObj.prototype.__init__.call(this, GCLASS_FSM, GCLASS_CONFIG);
        __update_dict__(this.config, kw || {});
        return this;
    };
    proto.start_up= function() {
        //**********************************
        //  start_up
        //**********************************
    }

     ************************************************************/
    proto.create_gobj = function(name, gclass, parent, kw) {
        if (!name) {
            // force all gobj to have a name.
            // useful to make DOM elements with id depending of his gobj.
            name = [
                'random-id-',
                get_unique_id()
            ].join('');
        }
        if (typeof parent === 'string') {
            // find the named gobj
            parent = this.find_unique_gobj(parent);
            if (!parent) {
                var msg = "WARNING GAplic.create_gobj('" + name + "'): " +
                    "WITHOUT registered named PARENT: '" + parent + "'";
                this.logger(msg);
            }
        }
        var gobj = new gclass(name, parent, kw);
        gobj.gaplic = this;
        gobj.logger = this.logger;
        if (name) {
            //register named gobj!
            this._register_unique_gobj(gobj);
        }
        if (parent) {
            parent._add_child(gobj)
        }
        if (gobj.start_up) {
            gobj.start_up();
        }
        return gobj;
    };


    /************************************************************
     *        Destroy a gobj
     ************************************************************/
    proto.destroy_gobj = function (gobj) {
        /* TODO
        */
        var self = this;
    }

    /************************************************************
     *        Send an event to an external gaplic
     ************************************************************/
    proto.send_event_outside = function (
            gaplic_name,
            role,
            gobj_name,
            event_name,
            subscriber_gobj,
            origin_role,
            kw) {
        var self = this;

        return self.send_event(self.router,
            'EV_SEND_EVENT_OUTSIDE',
            {
                gaplic_name:gaplic_name,
                role:role,
                gobj_name:gobj_name,
                event_name:event_name,
                subscriber_gobj:subscriber_gobj,
                origin_role:origin_role,
                kw:kw
            }
        )
    }

    /************************************************************
     *        Subscribe to an external event
     ************************************************************/
    proto.subscribe_event_outside = function (
            gaplic_name,
            role,
            gobj_name,
            event_name,
            subscriber_gobj,
            origin_role,
            kw) {
        var self = this;

        kw['__subscribe_event__'] = true;

        return self.send_event_outside(
            gaplic_name,
            role,
            gobj_name,
            event_name,
            subscriber_gobj,
            origin_role,
            kw
        )
    }

    /************************************************************
     *        register a unique gobj
     ************************************************************/
    proto._register_unique_gobj = function(gobj) {
        var self = this;
        var named_gobj = self._unique_named_gobjs[gobj.name];
        if (named_gobj) {
            var msg = "ERROR GAplic._register_unique_gobj(): '" +
                gobj.name +
                "' ALREADY REGISTERED";
            self.logger(msg);
            throw msg;
            return false;
        }
        self._unique_named_gobjs[gobj.name] = gobj;
        return true;
    }

    /************************************************************
     *        deregister a unique gobj
     ************************************************************/
    proto._deregister_unique_gobj = function (gobj) {
        /* TODO
        named_gobj = self._unique_named_gobjs.get(gobj.name, None)
        if named_gobj is not None:
            del self._unique_named_gobjs[gobj.name]
            return true
        return False
        */
        var self = this;
    }

    /************************************************************
     *        find a unique gobj
     ************************************************************/
    proto.find_unique_gobj = function (gobj_name) {
        var named_gobj = this._unique_named_gobjs[gobj_name];
        return named_gobj;
    }

    /************************************************************
     *        enqueue event
     ************************************************************/
    proto._enqueue_event = function(event) {
        /* The best solution for execute events outside of cicle,
         * is to start a very short timer.
         **/
        this.qevent.push(event);
        this.set_timeout(this, 1);
    };

    /************************************************************
     *        indentation functions.
     ************************************************************/
    proto._tab = function() {
        var self = this;
        var spaces, pad;
        if (self._inside <= 0) {
            spaces = 1;
        } else {
            spaces = self._inside * 2;
        }
        pad = '';
        while (spaces--) {
            pad += ' ';
        }
        return pad;
    };

    proto._increase_inside = function() {
        this._inside += 1;
    };
    proto._decrease_inside = function() {
        this._inside -= 1;
    };

    //=======================================================================
    //      Expose the class via the global object
    //=======================================================================
    exports.__jsfsm_version__ = '0.5.0';
    exports.GAplic = GAplic;
    exports.add_gaplic_callback = add_gaplic_callback;
    exports.fire_gaplic_callbacks = fire_gaplic_callbacks;
}(this));

/**************************************************************************
 *        GRouter
 **************************************************************************/
;(function (exports) {
    'use strict';

    /************************************************************
     *      GRouter class.
     ************************************************************/
    var event_fields = [
        'message_type',
        'serial',
        'event_name',
        'destination_gaplic',
        'destination_role',
        'destination_gobj',
        'origin_gaplic',
        'origin_role',
        'origin_gobj',
        'kw'
    ]
    var event_ack_fields = [
        'message_type',
        'serial',
        'event_name'
    ]
    var event_nack_fields = [
        'message_type',
        'serial',
        'event_name',
        'error_message'
    ]
    var identity_card_fields = [
        'message_type',
        'my_gaplic_name',
        'my_roles'
    ]
    var identity_card_ack_fields = [
        'message_type',
        'my_gaplic_name',
        'my_roles'
    ]

    /********************************************
     *      Auxiliary
     ********************************************/
    var serial = 0;
    function incr_serial() {
        ++serial;
        if (serial > 10) {
            serial = 1;
        }
        return serial;
    }

    // intra event container
    function IntraEvent(
            message_type,
            serial,
            event_name,
            destination_gaplic,
            destination_role,
            destination_gobj,
            origin_gaplic,
            origin_role,
            origin_gobj,
            kw) {
        this.message_type = message_type;
        this.serial = serial;
        this.event_name = event_name;
        this.destination_gaplic = destination_gaplic;
        this.destination_role = destination_role;
        this.destination_gobj = destination_gobj;
        this.origin_gaplic = origin_gaplic;
        this.origin_role = origin_role;
        this.origin_gobj = origin_gobj;
        this.kw = kw;

        this.toJSON = function () {
            return {
                message_type: this.message_type,
                serial: this.serial,
                event_name: this.event_name,
                destination_gaplic: this.destination_gaplic,
                destination_role: this.destination_role,
                destination_gobj: this.destination_gobj,
                origin_gaplic: this.origin_gaplic,
                origin_role: this.origin_role,
                origin_gobj: this.origin_gobj,
                kw: this.kw
            };
        }
    }

    // ack container
    function Ack(
            message_type,
            serial,
            event_name) {
        this.message_type = message_type;
        this.serial = serial;
        this.event_name = event_name;

        this.toJSON = function () {
            return {
                message_type: this.message_type,
                serial: this.serial,
                event_name: this.event_name
            };
        }
    }

    // nack container
    function Nack(
            message_type,
            serial,
            event_name,
            error_message) {
        this.message_type = message_type;
        this.serial = serial;
        this.event_name = event_name;
        this.error_message = error_message;

        this.toJSON = function () {
            return {
                message_type: this.message_type,
                serial: this.serial,
                event_name: this.event_name,
                error_message: this.error_message
            };
        }
    }

    // identity card container
    function IdentityCard(
            message_type,
            my_gaplic_name,
            my_roles) {
        this.message_type = message_type;
        this.my_gaplic_name = my_gaplic_name;
        this.my_roles = my_roles;

        this.toJSON = function () {
            return {
                message_type: this.message_type,
                my_gaplic_name: this.my_gaplic_name,
                my_roles: this.my_roles
            };
        }
    }

    // Class for static route
    function StaticRoute(name, roles, urls, connex_mode) {
        this.gaplic_name = name;
        if (typeof roles === 'string') {
            this.roles = [roles];
        } else {
            this.roles = roles;
        }
        if (typeof urls === 'string') {
            this.urls = [urls];
        } else {
            this.urls = urls;
        }
        this.connex_mode = connex_mode;

        this.idx_url = 0;
        this.dl_output_events = [];  // queue of pending output events
        this.cur_pending_event = null;
        this.connex_handler = null;
        this.identity_ack = false;  // don't send events until recv ident ack
    }

    // GAplics registry.
    function GAplicRegistry(router) {
        var self = this;
        self.router = router;
        self.my_gaplic_name = router.gaplic.name;  // self gaplic name
        self.my_roles = router.gaplic.roles;  // self roles
        self.static_routes = [];
    }


    /********************************************
     *      Actions
     ********************************************/
    function ac_add_static_route(self, event) {
        /* Add external gaplic.

        *Event data:*
            * :attr:`name`: name of external gaplic.
            * :attr:`roles`: roles of the gaplic.
            * :attr:`urls`: urls of external gaplic.
        */
        var name = event.kw.name;
        var urls = event.kw.urls;
        var roles = event.kw.roles;
        var connex_mode = event.kw.connex_mode;
        self.add_static_route(name, roles, urls, connex_mode);
        return 1;
    }

    function ac_send_event_outside(self, event) {
        var gaplic_name = event.kw.gaplic_name;
        var role = event.kw.role;
        var gobj_name = event.kw.gobj_name;
        var event_name = event.kw.event_name;
        var subscriber_gobj = event.kw.subscriber_gobj;
        var origin_role = event.kw.origin_role;
        var kw = event.kw.kw;

        var registry = self.registry;
        var route = self.search_route(gaplic_name, role);
        if (!route) {
            self.logger("ERROR route NOT FOUND: " + gaplic_name + '/' + role);
            return 0;
        }
        if (!origin_role) {
            origin_role = registry.my_roles[0];
        }

        var intra_event = new IntraEvent(
            '__event__',                // message_type
            incr_serial(),              // serial
            event_name,                 // event_name
            gaplic_name,                // destination_gaplic
            role,                       // destination_role
            gobj_name,                  // destination_gobj
            registry.my_gaplic_name,    // origin_gaplic
            origin_role,                // origin_role
            subscriber_gobj.name,       // origin_gobj
            kw);                        // kw

        self.enqueue_pending_event(route, intra_event);
        if (!route.cur_pending_event) {
            self.fire_pending_events(route);
        }
        return 1;
    }

    function ac_on_open(self, event) {
        var route = event.kw.static_route;
        var websocket = route.connex_handler;
        websocket.opened = true;

        var url = route.urls[route.idx_url];
        self.logger('SOCKJS Opened: ' + url);
        self.send_identity_card(route);
        return 1;
    }

    function ac_on_close(self, event) {
        var route = event.kw.static_route;
        var websocket = route.connex_handler;
        websocket.opened = false;

        var url = route.urls[route.idx_url];
        self.logger('SOCKJS Close: ' + url);
        route.connex_handler = null;

        // point to next url
        var ln = route.urls.length;
        route.idx_url = (++route.idx_url) % ln;
        self.set_timeout(self.config.timeout_retry*1000);
        return 1;
    }

    function ac_on_message(self, event) {
        var route = event.kw.static_route;
        var websocket = route.connex_handler;
        var intra_event = event.kw.data;
        var registry = self.registry;
        var message_type = intra_event.message_type;
        var url = route.urls[route.idx_url];

        if (self.config.trace_router) {
            var prefix = registry.my_gaplic_name + ' <== ' + url;
            self.trace_intra_event(prefix, intra_event);
        }

        if (message_type == '__identity_card_ack__') {
            // TODO: check if the info we have is correct
            route.identity_ack = true;
            self.fire_pending_events(route);
            return 1;

        } else if (message_type == '__event_nack__') {
            // If ACK then delete current pending event
            self.logger("ERROR " + intra_event.error_message);
            var cur_pending_event = route.cur_pending_event;
            if (!cur_pending_event ||
                    intra_event.serial != cur_pending_event.serial) {
                self.logger("ERROR ack cur_pending_event");
            }
            delete route.cur_pending_event;
            route.cur_pending_event = null;
            self.fire_pending_events(route);
            return 1;

        } else if (message_type == '__event_ack__') {
            // If ACK then delete current pending event
            var cur_pending_event = route.cur_pending_event;
            if (!cur_pending_event ||
                    intra_event.serial != cur_pending_event.serial) {
                self.logger("ERROR ack cur_pending_event");
            }
            delete route.cur_pending_event;
            route.cur_pending_event = null;
            self.fire_pending_events(route);
            return 1;

        } else if (message_type == '__event__') {
            /*
             *  I suppose I only have ONE gaplic and the event is for us.
             *  We are not intermediary router.
             */
            var dst_gobj = intra_event.destination_gobj;
            var ack = null;

            try {
                var named_gobj = self.gaplic.find_unique_gobj(dst_gobj);
            } catch (e) {
                ack = new Nack(
                    '__event_nack__',       // message_type
                    intra_event.serial,     // serial
                    intra_event.event_name, // event_name
                    e                       // error_message
                );
                self.direct_to_route(route, ack);
                return 1;
            }
            if (!named_gobj) {
                ack = new Nack(
                    '__event_nack__',       // message_type
                    intra_event.serial,     // serial
                    intra_event.event_name, // event_name
                    "GObj " + dst_gobj + " UNKNOWN" // error_message
                );
                self.direct_to_route(route, ack);
                return 1;
            }

            // simple ack, no checkout, for the sender could remove the msg.
            ack = new Ack(
                '__event_ack__',        // message_type
                intra_event.serial,     // serial
                intra_event.event_name  // event_name
            );
            self.direct_to_route(route, ack);

            // inject the event in the gaplic
            var ret = self.send_event(
                named_gobj,
                intra_event.event_name,
                intra_event.kw
            )

            // send action resp as event if they subscribe it.
            if (intra_event.kw.__subscribe_response__) {
                var resp = new IntraEvent(
                    '__event__',                // message_type
                    incr_serial(),              // serial
                    intra_event.event_name,     // event_name
                    intra_event.origin_gaplic,  // destination_gaplic
                    '',                         // destination_role
                    intra_event.origin_gobj,    // destination_gobj
                    registry.my_gaplic_name,    // origin_gaplic
                    registry.my_roles[0],       // origin_role
                    named_gobj.name,            // origin_gobj
                    {'action_return': ret});    // kw
                self.direct_to_route(route, resp);
                self.enqueue_pending_event(route, resp);
            }
            if (!route.cur_pending_event) {
                self.fire_pending_events(route);
            }

        } else {
            self.logger("ERROR message_type UNKNOWN: " + message_type);
        }
        return 1;
    }

    function ac_timeout(self, event) {
        var something_todo = self.check_routes();
        if (something_todo) {
            self.set_timeout(self.config.timeout_retry*1000);
        }
        return 1;
    }

    var GROUTER_FSM = {
        'event_list': [
            'EV_ADD_STATIC_ROUTE: top input',
            'EV_SEND_EVENT_OUTSIDE: top input',
            'EV_ON_OPEN: bottom input',
            'EV_ON_CLOSE: bottom input',
            'EV_ON_MESSAGE: bottom input',
            'EV_TIMEOUT'
        ],
        'state_list': [
            'ST_IDLE'              /* idle state */
            ],
        'machine': {
            'ST_IDLE':
            [
                ['EV_ADD_STATIC_ROUTE',     ac_add_static_route,    'ST_IDLE'],
                ['EV_SEND_EVENT_OUTSIDE',   ac_send_event_outside,  'ST_IDLE'],
                ['EV_ON_OPEN',              ac_on_open,             'ST_IDLE'],
                ['EV_ON_CLOSE',             ac_on_close,            'ST_IDLE'],
                ['EV_ON_MESSAGE',           ac_on_message,          'ST_IDLE'],
                ['EV_TIMEOUT',              ac_timeout,             'ST_IDLE'],
            ]
        }
    }

    var GROUTER_CONFIG = {
        trace_router: true,             // trace route messages
        timeout_retry: 5,               // timeout retry, in seconds
        timeout_idle: 5,                // idle timeout, in seconds
        limit_pending_output: 2         // maximum messages without response
    };

    var GRouter = GObj.__makeSubclass__();
    var proto = GRouter.prototype; // Easy access to the prototype
    proto.__init__= function(name, parent, kw) {
        this.name = name || '';  // set before super(), to put the same smachine name
        GObj.prototype.__init__.call(this, GROUTER_FSM, GROUTER_CONFIG);
        __update_dict__(this.config, kw || {});
        return this;
    };

    /**********************************
     *          Start up
     **********************************/
    proto.start_up = function() {
        var self = this;
        self.registry = new GAplicRegistry(self);
        self.set_timeout(self.config.timeout_idle*1000);
    }

    /*****************************************
     *      Trace intra event
     *****************************************/
    proto.trace_intra_event = function(prefix, intra_event) {
        var self = this;
        var hora = get_current_datetime();
        var message_type = intra_event.message_type
        var fields= null;

        if (message_type == '__event__') {
            fields = event_fields;
        } else if (message_type == '__event_ack__') {
            fields = event_ack_fields;
        } else if (message_type == '__event_nack__') {
            fields = event_nack_fields;
        } else if (message_type == '__identity_card__') {
            fields = identity_card_fields;
        } else if (message_type == '__identity_card_ack__') {
            fields = identity_card_ack_fields;
        } else {
            self.logger('ERROR unknown message type: ' + message_type);
        }

        try {
            var trace = "\n" + hora + " " + prefix + "\n";
            for (var i=0; i<fields.length; i++) {
                var f = fields[i];
                //trace += "    "+ f +": " + intra_event[f] + "\n";
                trace += "    "+ f +": " +
                    JSON.stringify(intra_event[f]) + "\n";
            }
            self.logger(trace)
        } catch (e) {
            var msg = "ERROR executing the action: " + e;
            self.logger(msg);
        }
    }

    /*****************************************
     *      Try to send pending events
     *****************************************/
    proto.fire_pending_events = function(route) {
        var self = this;

        var dl_output_events = route.dl_output_events;
        var websocket = route.connex_handler;
        if (!(websocket && websocket.opened)) {
            return false;
        }

        if (route.cur_pending_event) {

            if (self.config.trace_router) {
                var url = route.urls[route.idx_url];
                var prefix = self.registry.my_gaplic_name + ' ==> ' + url;
                self.trace_intra_event(prefix, route.cur_pending_event);
            }

            self.send_message(
                websocket,
                route.cur_pending_event
            );
            return true
        }
        if (dl_output_events.length > 0) {
            route.cur_pending_event = dl_output_events.shift();

            if (self.config.trace_router) {
                var url = route.urls[route.idx_url];
                var prefix = self.registry.my_gaplic_name + ' ==> ' + url;
                self.trace_intra_event(prefix, route.cur_pending_event);
            }

            self.send_message(
                websocket,
                route.cur_pending_event
            );
            return true
        } else {
            return false;
        }
    }

    /*****************************************
     *      Enqueue event
     *****************************************/
    proto.enqueue_pending_event = function(route, intra_event) {
        var self = this;

        var dl_output_events = route.dl_output_events;
        if (dl_output_events.length > self.config.limit_pending_output) {
            self.logger("ERROR output event queue FULL: " +
                        dl_output_events.length);
            return;
        }

        dl_output_events.push(intra_event);
    }

    /**********************************
     *      Setup websocket
     **********************************/
    proto.add_static_route = function (name, roles, urls, connex_mode) {
        var self = this;
        var static_routes = self.registry.static_routes;
        var r = new StaticRoute(name, roles, urls, connex_mode);
        static_routes.push(r);
        self.setup_websocket(r);
    }

    /**********************************
     *      Setup websocket
     **********************************/
    proto.setup_websocket = function(static_route) {
        var self = this;

        function on_open_event(self, r) {
            var gobj = self;
            var _r = r;
            return function() {
                gobj.send_event(gobj, 'EV_ON_OPEN', {static_route:_r});
            }
        }
        function on_close_event(self, r) {
            var gobj = self;
            var _r = r;
            return function() {
                gobj.send_event(gobj, 'EV_ON_CLOSE', {static_route:_r});
            }
        }
        function on_message_event(self, r) {
            var gobj = self;
            var _r = r;
            return function(e) {
                gobj.send_event(
                    gobj,
                    'EV_ON_MESSAGE',
                    {
                        static_route:_r,
                        data:e.data
                    }
                );
            }
        }
        var url = static_route.urls[static_route.idx_url];

        self.logger('Opening SOCKJS: ' + url);
        var websocket = new SockJS(url);

        websocket.onopen = on_open_event(self, static_route);
        websocket.onclose = on_close_event(self, static_route);
        websocket.onmessage = on_message_event(self, static_route);
        static_route.connex_handler = websocket;
        return websocket;
    }

    /**********************************
     *      Search route
     **********************************/
    proto.search_route = function(gaplic_name, role) {
        var self = this;
        var static_routes = self.registry.static_routes;

        // TODO: busca por gaplic

        for (var idx_route=0; idx_route<static_routes.length; idx_route++) {
            var route = static_routes[idx_route];
            var roles = route.roles;
            for (var idx_role=0; idx_role<roles.length; idx_role++) {
                var ro = route.roles[idx_role];
                if (ro == role) {
                    return route;
                }
            }
        }
        return null;
    }

    /**********************************
     *      Check routes
     **********************************/
    proto.check_routes = function() {
        var self = this;
        var registry = self.registry;
        var static_routes = registry.static_routes;
        var ret = false;
        for (var idx=0; idx<static_routes.length; idx++) {
            var r = static_routes[idx];
            if (!r.connex_handler) {
                self.setup_websocket(r);
                ret = true;
                continue;
            }
            if (!r.identity_ack) {
                //TODO: retransmite la identity si timeout
                ret = true;
            }

            //TODO: retransmite cur_pending_event si timeout

        }
        return ret;
    }

    /**********************************
     *      Send jsonify message
     **********************************/
    proto.send_message = function(websocket, event) {
        var self = this;
        event = JSON.stringify(event);
        websocket.send(event);
        self.set_timeout(self.config.timeout_retry*1000);
    }

    /**********************************
     *      Send message to route
     **********************************/
    proto.direct_to_route = function(route, intra_event) {
        var self = this;

        var websocket = route.connex_handler;
        if (!(websocket && websocket.opened)) {
            return false;
        }

        if (self.config.trace_router) {
            var url = route.urls[route.idx_url];
            var prefix = self.registry.my_gaplic_name + ' ==> ' + url;
            self.trace_intra_event(prefix, intra_event);
        }
        self.send_message(
            websocket,
            intra_event
        );
        return true;
    }

    /**********************************
     *      Send identity card
     **********************************/
    proto.send_identity_card = function(route) {
        var self = this;
        var my_gaplic_name = self.registry.my_gaplic_name
        var my_roles = self.registry.my_roles

        var idc = new IdentityCard(
            '__identity_card__',  // message_type
            my_gaplic_name,
            my_roles
        );

        var websocket = route.connex_handler;
        if (!(websocket && websocket.opened)) {
            return false;
        }

        if (self.config.trace_router) {
            var url = route.urls[route.idx_url];
            var prefix = my_gaplic_name + ' ==> ' + url;
            self.trace_intra_event(prefix, idc);
        }
        self.send_message(
            websocket,
            idc
        );
        return true
    }

    /************************************************************
     *        Subscribe to an gobj event of external gaplic.
     ************************************************************/
    proto.mt_subscribe_external_event = function (
            gaplic_name, gobj_name, event_name, subscriber_gobj, kw) {
        var self = this;
    }

    //=======================================================================
    //      Expose the class via the global object
    //=======================================================================
    exports.GRouter = GRouter;

}(this));
