(function() {
    "use strict";
    function helpers$delay$$delay(callback, context) {
      window.setTimeout(function(context) {
        callback.call(context);
      }, 4, context);
    }

    var helpers$delay$$default = helpers$delay$$delay;
    function helpers$message$event$$socketEventMessage(name, data, origin) {
        var ports           = null;
        var source          = null;
        var bubbles         = false;
        var cancelable      = false;
        var lastEventId     = '';
        var targetPlacehold = null;

        try {
            var messageEvent = new MessageEvent(name);
            messageEvent.initMessageEvent(name, bubbles, cancelable, data, origin, lastEventId);

            Object.defineProperties(messageEvent, {
                target:  {
                    get: function() { return targetPlacehold; },
                    set: function(value) { targetPlacehold = value; }
                },
                srcElement: {
                    get: function() { return this.target; }
                },
                currentTarget: {
                    get: function() { return this.target; }
                }
            });
        }
        catch (e) {
            // We are unable to create a MessageEvent Object. This should only be happening in PhantomJS.
            var messageEvent = {
                type             : name,
                bubbles          : bubbles,
                cancelable       : cancelable,
                data             : data,
                origin           : origin,
                lastEventId      : lastEventId,
                source           : source,
                ports            : ports,
                defaultPrevented : false,
                returnValue      : true,
                clipboardData    : undefined
            };

            Object.defineProperties(messageEvent, {
                target:  {
                    get: function() { return targetPlacehold; },
                    set: function(value) { targetPlacehold = value; }
                },
                srcElement: {
                    get: function() { return this.target; }
                },
                currentTarget: {
                    get: function() { return this.target; }
                }
            });
        }

        return messageEvent;
    }

    var helpers$message$event$$default = helpers$message$event$$socketEventMessage;
    function helpers$url$transform$$urlTransform(url) {
      var urlPath = helpers$url$transform$$urlParse('path', url);

      if(urlPath === '') {
        return url + '/';
      }

      return url;
    }

    /*
    * The following functions (isNumeric & urlParse) was taken from
    * https://github.com/websanova/js-url/blob/764ed8d94012a79bfa91026f2a62fe3383a5a49e/url.js
    * which is shared via the MIT license with minimal modifications.
    */
    function helpers$url$transform$$isNumeric(arg) {
      return !isNaN(parseFloat(arg)) && isFinite(arg);
    }

    function helpers$url$transform$$urlParse(arg, url) {
      var _ls = url;

      if (!arg) { return _ls; }
      else { arg = arg.toString(); }

      if (_ls.substring(0,2) === '//') { _ls = 'http:' + _ls; }
      else if (_ls.split('://').length === 1) { _ls = 'http://' + _ls; }

      url = _ls.split('/');
      var _l = {auth:''}, host = url[2].split('@');

      if (host.length === 1) { host = host[0].split(':'); }
      else { _l.auth = host[0]; host = host[1].split(':'); }

      _l.protocol=url[0];
      _l.hostname=host[0];
      _l.port=(host[1] || ((_l.protocol.split(':')[0].toLowerCase() === 'https') ? '443' : '80'));
      _l.pathname=( (url.length > 3 ? '/' : '') + url.slice(3, url.length).join('/').split('?')[0].split('#')[0]);
      var _p = _l.pathname;

      if (_p.charAt(_p.length-1) === '/') { _p=_p.substring(0, _p.length-1); }
      var _h = _l.hostname, _hs = _h.split('.'), _ps = _p.split('/');

      if (arg === 'hostname') { return _h; }
      else if (arg === 'domain') {
          if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(_h)) { return _h; }
          return _hs.slice(-2).join('.');
      }
      //else if (arg === 'tld') { return _hs.slice(-1).join('.'); }
      else if (arg === 'sub') { return _hs.slice(0, _hs.length - 2).join('.'); }
      else if (arg === 'port') { return _l.port; }
      else if (arg === 'protocol') { return _l.protocol.split(':')[0]; }
      else if (arg === 'auth') { return _l.auth; }
      else if (arg === 'user') { return _l.auth.split(':')[0]; }
      else if (arg === 'pass') { return _l.auth.split(':')[1] || ''; }
      else if (arg === 'path') { return _l.pathname; }
      else if (arg.charAt(0) === '.') {
        arg = arg.substring(1);
        if(helpers$url$transform$$isNumeric(arg)) {arg = parseInt(arg, 10); return _hs[arg < 0 ? _hs.length + arg : arg-1] || ''; }
      }
      else if (helpers$url$transform$$isNumeric(arg)) { arg = parseInt(arg, 10); return _ps[arg < 0 ? _ps.length + arg : arg] || ''; }
      else if (arg === 'file') { return _ps.slice(-1)[0]; }
      else if (arg === 'filename') { return _ps.slice(-1)[0].split('.')[0]; }
      else if (arg === 'fileext') { return _ps.slice(-1)[0].split('.')[1] || ''; }
      else if (arg.charAt(0) === '?' || arg.charAt(0) === '#') {
        var params = _ls, param = null;

        if(arg.charAt(0) === '?') { params = (params.split('?')[1] || '').split('#')[0]; }
        else if(arg.charAt(0) === '#') { params = (params.split('#')[1] || ''); }

        if(!arg.charAt(1)) { return params; }

        arg = arg.substring(1);
        params = params.split('&');

        for(var i=0,ii=params.length; i<ii; i++) {
            param = params[i].split('=');
            if(param[0] === arg) { return param[1] || ''; }
        }

        return null;
      }

      return '';
    }

    var helpers$url$transform$$default = helpers$url$transform$$urlTransform;
    function helpers$websocket$properties$$webSocketProperties(websocket) {
      var eventMessageSource = function(callback) {
        return function(event) {
          event.target = websocket;
          callback.apply(websocket, arguments);
        }
      };

      Object.defineProperties(websocket, {
        onopen: {
          enumerable: true,
          get: function() { return this._onopen; },
          set: function(callback) {
            this._onopen = eventMessageSource(callback);
            this.service.setCallbackObserver('clientOnOpen', this._onopen, websocket);
          }
        },
        onmessage: {
          enumerable: true,
          get: function() { return this._onmessage; },
          set: function(callback) {
            this._onmessage = eventMessageSource(callback);
            this.service.setCallbackObserver('clientOnMessage', this._onmessage, websocket);
          }
        },
        onclose: {
          enumerable: true,
          get: function() { return this._onclose; },
          set: function(callback) {
            this._onclose = eventMessageSource(callback);
            this.service.setCallbackObserver('clientOnclose', this._onclose, websocket);
          }
        },
        onerror: {
          enumerable: true,
          get: function() { return this._onerror; },
          set: function(callback) {
            this._onerror = eventMessageSource(callback);
            this.service.setCallbackObserver('clientOnError', this._onerror, websocket);
          }
        }
      });
    }
    var helpers$websocket$properties$$default = helpers$websocket$properties$$webSocketProperties;

    function service$$SocketService() {
      this.list = {};
    }

    service$$SocketService.prototype = {
      server: null,

      /*
      * This notifies the mock server that a client is connecting and also sets up
      * the ready state observer.
      *
      * @param {client: object} the context of the client
      * @param {readyStateFunction: function} the function that will be invoked on a ready state change
      */
      clientIsConnecting: function(client, readyStateFunction) {
        this.observe('updateReadyState', readyStateFunction, client);

        // if the server has not been set then we notify the onclose method of this client
        if(!this.server) {
          this.notify(client, 'updateReadyState', window.MockSocket.CLOSED);
          this.notifyOnlyFor(client, 'clientOnError');
          return false;
        }

        this.notifyOnlyFor(client, 'updateReadyState', window.MockSocket.OPEN);
        this.notify('clientHasJoined', this.server);
        this.notifyOnlyFor(client, 'clientOnOpen', helpers$message$event$$default('open', null, this.server.url));
      },

      /*
      * Closes a connection from the server's perspective. This should
      * close all clients.
      *
      * @param {messageEvent: object} the mock message event.
      */
      closeConnectionFromServer: function(messageEvent) {
        this.notify('updateReadyState', window.MockSocket.CLOSING);
        this.notify('clientOnclose', messageEvent);
        this.notify('updateReadyState', window.MockSocket.CLOSED);
        this.notify('clientHasLeft');
      },

      /*
      * Closes a connection from the clients perspective. This
      * should only close the client who initiated the close and not
      * all of the other clients.
      *
      * @param {messageEvent: object} the mock message event.
      * @param {client: object} the context of the client
      */
      closeConnectionFromClient: function(messageEvent, client) {
        this.notifyOnlyFor(client, 'updateReadyState', window.MockSocket.CLOSING);
        this.notifyOnlyFor(client, 'clientOnclose', messageEvent);
        this.notifyOnlyFor(client, 'updateReadyState', window.MockSocket.CLOSED);
        this.notify('clientHasLeft');
      },


      /*
      * Notifies the mock server that a client has sent a message.
      *
      * @param {messageEvent: object} the mock message event.
      */
      sendMessageToServer: function(messageEvent) {
        this.notify('clientHasSentMessage', messageEvent);
      },

      /*
      * Notifies all clients that the server has sent a message
      *
      * @param {messageEvent: object} the mock message event.
      */
      sendMessageToClients: function(messageEvent) {
        this.notify('clientOnMessage', messageEvent);
      },

      /*
      * Setup the callback function observers for both the server and client.
      *
      * @param {observerKey: string} either: connection, message or close
      * @param {callback: function} the callback to be invoked
      * @param {server: object} the context of the server
      */
      setCallbackObserver: function(observerKey, callback, server) {
        this.observe(observerKey, callback, server);
      },

      /*
      * Binds a callback to a namespace. If notify is called on a namespace all "observers" will be
      * fired with the context that is passed in.
      *
      * @param {namespace: string}
      * @param {callback: function}
      * @param {context: object}
      */
      observe: function(namespace, callback, context) {

        // Make sure the arguments are of the correct type
        if( typeof namespace !== 'string' || typeof callback !== 'function' || (context && typeof context !== 'object')) {
          return false;
        }

        // If a namespace has not been created before then we need to "initialize" the namespace
        if(!this.list[namespace]) {
          this.list[namespace] = [];
        }

        this.list[namespace].push({callback: callback, context: context});
      },

      /*
      * Remove all observers from a given namespace.
      *
      * @param {namespace: string} The namespace to clear.
      */
      clearAll: function(namespace) {

        if(!this.verifyNamespaceArg(namespace)) {
          return false;
        }

        this.list[namespace] = [];
      },

      /*
      * Notify all callbacks that have been bound to the given namespace.
      *
      * @param {namespace: string} The namespace to notify observers on.
      * @param {namespace: url} The url to notify observers on.
      */
      notify: function(namespace) {

        // This strips the namespace from the list of args as we dont want to pass that into the callback.
        var argumentsForCallback = Array.prototype.slice.call(arguments, 1);

        if(!this.verifyNamespaceArg(namespace)) {
          return false;
        }

        // Loop over all of the observers and fire the callback function with the context.
        for(var i = 0, len = this.list[namespace].length; i < len; i++) {
          this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
        }
      },

      /*
      * Notify only the callback of the given context and namespace.
      *
      * @param {context: object} the context to match against.
      * @param {namespace: string} The namespace to notify observers on.
      */
      notifyOnlyFor: function(context, namespace) {

        // This strips the namespace from the list of args as we dont want to pass that into the callback.
        var argumentsForCallback = Array.prototype.slice.call(arguments, 2);

        if(!this.verifyNamespaceArg(namespace)) {
          return false;
        }

        // Loop over all of the observers and fire the callback function with the context.
        for(var i = 0, len = this.list[namespace].length; i < len; i++) {
          if(this.list[namespace][i].context === context) {
            this.list[namespace][i].callback.apply(this.list[namespace][i].context, argumentsForCallback);
          }
        }
      },

      /*
      * Verifies that the namespace is valid.
      *
      * @param {namespace: string} The namespace to verify.
      */
      verifyNamespaceArg: function(namespace) {
        if(typeof namespace !== 'string' || !this.list[namespace]) {
          return false;
        }

        return true;
      }
    };

    var service$$default = service$$SocketService;

    function mock$server$$MockServer(url) {
      var service = new service$$default();
      this.url    = helpers$url$transform$$default(url);

      window.MockSocket.services[this.url] = service;

      this.service   = service;
      service.server = this;
    }

    mock$server$$MockServer.prototype = {
      service: null,

      /*
      * This is the main function for the mock server to subscribe to the on events.
      *
      * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
      *
      * @param {type: string}: The event key to subscribe to. Valid keys are: connection, message, and close.
      * @param {callback: function}: The callback which should be called when a certain event is fired.
      */
      on: function(type, callback) {
        var observerKey;

        if(typeof callback !== 'function' || typeof type !== 'string') {
          return false;
        }

        switch(type) {
          case 'connection':
            observerKey = 'clientHasJoined';
            break;
          case 'message':
            observerKey = 'clientHasSentMessage';
            break;
          case 'close':
            observerKey = 'clientHasLeft';
            break;
        }

        // Make sure that the observerKey is valid before observing on it.
        if(typeof observerKey === 'string') {
          this.service.setCallbackObserver(observerKey, callback, this);
        }
      },

      /*
      * This send function will notify all mock clients via their onmessage callbacks that the server
      * has a message for them.
      *
      * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
      */
      send: function(data) {
        helpers$delay$$default(function() {
          this.service.sendMessageToClients(helpers$message$event$$default('message', data, this.url));
        }, this);
      },

      /*
      * Notifies all mock clients that the server is closing and their onclose callbacks should fire.
      */
      close: function() {
        helpers$delay$$default(function() {
          this.service.closeConnectionFromServer(helpers$message$event$$default('close', null, this.url));
        }, this);
      }
    };

    var mock$server$$default = mock$server$$MockServer;

    function mock$socket$$MockSocket(url) {
      this.binaryType = 'blob';
      this.url        = helpers$url$transform$$default(url);
      this.readyState = window.MockSocket.CONNECTING;
      this.service    = window.MockSocket.services[this.url];

      helpers$websocket$properties$$default(this);

      helpers$delay$$default(function() {
        // Let the service know that we are both ready to change our ready state and that
        // this client is connecting to the mock server.
        this.service.clientIsConnecting(this, this._updateReadyState);
      }, this);
    }

    mock$socket$$MockSocket.CONNECTING = 0;
    mock$socket$$MockSocket.OPEN       = 1;
    mock$socket$$MockSocket.CLOSING    = 2;
    mock$socket$$MockSocket.LOADING    = 3;
    mock$socket$$MockSocket.CLOSED     = 4;
    mock$socket$$MockSocket.services   = {};

    mock$socket$$MockSocket.prototype = {

      /*
      * Holds the on*** callback functions. These are really just for the custom
      * getters that are defined in the helpers/websocket-properties. Accessing these properties is not advised.
      */
      _onopen    : null,
      _onmessage : null,
      _onerror   : null,
      _onclose   : null,

      /*
      * This holds reference to the service object. The service object is how we can
      * communicate with the backend via the pub/sub model.
      *
      * The service has properties which we can use to observe or notifiy with.
      * this.service.notify('foo') & this.service.observe('foo', callback, context)
      */
      service: null,

      /*
      * This is a mock for the native send function found on the WebSocket object. It notifies the
      * service that it has sent a message.
      *
      * @param {data: *}: Any javascript object which will be crafted into a MessageObject.
      */
      send: function(data) {
        helpers$delay$$default(function() {
          this.service.sendMessageToServer(helpers$message$event$$default('message', data, this.url));
        }, this);
      },

      /*
      * This is a mock for the native close function found on the WebSocket object. It notifies the
      * service that it is closing the connection.
      */
      close: function() {
        helpers$delay$$default(function() {
          this.service.closeConnectionFromClient(helpers$message$event$$default('close', null, this.url), this);
        }, this);
      },

      /*
      * This is a private method that can be used to change the readyState. This is used
      * like this: this.protocol.subject.observe('updateReadyState', this._updateReadyState, this);
      * so that the service and the server can change the readyState simply be notifing a namespace.
      *
      * @param {newReadyState: number}: The new ready state. Must be 0-4
      */
      _updateReadyState: function(newReadyState) {
        if(newReadyState >= 0 && newReadyState <= 4) {
          this.readyState = newReadyState;
        }
      }
    };

    var mock$socket$$default = mock$socket$$MockSocket;

    if(typeof window === 'undefined') {
        window = global;
    }

    window.SocketService = service$$default;
    window.MockSocket    = mock$socket$$default;
    window.MockServer    = mock$server$$default;
}).call(this);

//# sourceMappingURL=mock-socket.js.map