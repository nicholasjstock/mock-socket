(function() {
    "use strict";
    var mockServer;

    module('Mock Socket Tests', {
      setup: function() {
        mockServer = new MockServer('ws://localhost:8080');
        mockServer.on('connection', function(server) {
          server.send('hello');
        });
      }
    });

    asyncTest('Connection with the server happens correctly', function() {
      var mockSocket = new MockSocket('ws://localhost:8080');

      expect(1);

      mockSocket.onopen = function() {
        ok(true, 'onopen fires as expected');
        start();
      };
    });

    asyncTest('On message with the server happens correctly', function() {
      var mockSocket = new MockSocket('ws://localhost:8080');

      expect(1);

      mockSocket.onmessage = function() {
        ok(true, 'onmessage fires as expected');
        start();
      };
    });
    module('Websocket message event Tests');

    test('Mock message event has correct properties', function(){
        var testObject = {foo: 'bar'};
        var eventMessage = socketEventMessage('open', 'testing', 'ws://localhost');

        eventMessage.target = testObject;

        equal(eventMessage.source, null);
        equal(eventMessage.target, eventMessage.srcElement);
        equal(eventMessage.target, eventMessage.currentTarget);
        equal(eventMessage.currentTarget.foo, 'bar');

        equal(eventMessage.lastEventId, '');
        equal(eventMessage.clipboardData, undefined);
        equal(eventMessage.defaultPrevented, false);
        equal(eventMessage.returnValue, true);
        equal(eventMessage.type, 'open');
    });
    module('Multiple clients test');

    asyncTest('that the onopen function will only be called once for each client', function() {
      var socketUrl       = 'ws://localhost:8080';
      var webSocketServer = new MockServer(socketUrl);
      var socketA         = new MockSocket(socketUrl);
      var socketB         = new MockSocket(socketUrl);

      expect(4);

      // this should be called twice, once for both socketA and socketB
      webSocketServer.on('connection', function() {
        ok(true, 'mock server on connection fires as expected');
      });

      socketA.onopen = function() {
        ok(true, 'mocksocket onopen fires as expected');
      };

      socketB.onopen = function() {
        ok(true, 'mocksocket onopen fires as expected');
        start();
      };
    });

    asyncTest('mock clients will connect to the right mock server', function() {
      var serverA = new MockServer('ws://localhost:8080');
      var serverB = new MockServer('ws://localhost:8081');

      var socketA = new MockSocket('ws://localhost:8080');
      var socketB = new MockSocket('ws://localhost:8080');

      expect(4);

      // this should be called twice, once for both socketA and socketB
      serverA.on('connection', function() {
        ok(true, 'mock server on connection fires as expected');
      });

      serverB.on('connection', function() {
        ok(false, 'This should not be called');
      });

      socketA.onopen = function() {
        ok(true, 'mocksocket onopen fires as expected');
      };

      socketB.onopen = function() {
        ok(true, 'mocksocket onopen fires as expected');
        start();
      };
    });

    asyncTest('mock clients onopen functions are fired only once', function() {
      var socketURL  = 'ws://localhost:8080';
      var mockServer = new MockServer(socketURL);
      var socketA    = new MockSocket(socketURL);

      expect(2);

      socketA.onopen = function() {
        ok(true, 'mocksocket onopen fires as expected');

        var socketB = new MockSocket(socketURL);
        socketB.onopen = function() {
          ok(true, 'mocksocket onclose fires as expected');
          start();
        };
      };
    });

    asyncTest('mock clients can send message to the right mock server', function() {
      var serverA = new MockServer('ws://localhost:8080');
      var serverB = new MockServer('ws://localhost:8081');
      var dataA   = 'foo';
      var dataB   = 'bar';
      var socketA = new MockSocket('ws://localhost:8080');
      var socketB = new MockSocket('ws://localhost:8081');

      expect(6);

      serverA.on('connection', function(server) {
        ok(true, 'mock server on connection fires as expected');

        server.on('message', function(event) {
          equal(event.data, dataA);
        });
      });

      serverB.on('connection', function(server) {
        ok(true, 'mock server on connection fires as expected');

        server.on('message', function(event) {
          equal(event.data, dataB);
          start();
        });
      });

      socketA.onopen = function() {
        ok(true, 'mocksocket onopen fires as expected');
        this.send(dataA);
      };

      socketB.onopen = function() {
        ok(true, 'mocksocket onopen fires as expected');
        this.send(dataB);
      };
    });

    asyncTest('mock clients can send message to the right mock server', function() {
      var semaphore  = 0;
      var mockServer = new MockServer('ws://localhost:8080');
      var socketA    = new MockSocket('ws://localhost:8080');
      var socketB    = new MockSocket('ws://localhost:8080');

      expect(2);

      mockServer.on('connection', function(server) {
        semaphore++;

        // Wait for both clients to connect then close the connection.
        if(semaphore === 2) {
          server.close();
        }
      });

      socketA.onclose = function() {
        ok(true, 'mocksocket onclose fires as expected');
      };

      socketB.onclose = function() {
        ok(true, 'mocksocket onclose fires as expected');
        start();
      };
    });


    asyncTest('closing a client will only close itself and not other clients', function() {
      var semaphore  = 0;
      var mockServer = new MockServer('ws://localhost:8080');
      var socketA    = new MockSocket('ws://localhost:8080');
      var socketB    = new MockSocket('ws://localhost:8080');

      expect(1);

      mockServer.on('connection', function(server) {
        semaphore++;

        // Wait for both clients to connect then send the message.
        if(semaphore === 2) {
          server.send('Closing socket B')
        }
      });

      socketA.onclose = function() {
        ok(false, 'mocksocket should not close');
      };

      socketB.onmessage = function() {
        this.close();
      };

      socketB.onclose = function() {
        ok(true, 'mocksocket onclose fires as expected');
        start();
      };
    });
    module('Mocksocket onclose test');

    asyncTest('that the mocksocket onclose function is called after closing mocksocket', function() {
      var socketUrl  = 'ws://localhost:8080';
      var mockServer = new MockServer(socketUrl);
      var mockSocket = new MockSocket(socketUrl);

      expect(4);

      mockServer.on('close', function() {
        ok(true, 'mock server on close fires as expected');
      });

      mockSocket.onclose = function(event) {
        ok(true, 'mocksocket onclose fires as expected');
        equal(this.readyState, MockSocket.CLOSING, 'the readystate is correct to closed');
        equal(event.currentTarget.url, urlTransform(socketUrl), 'onclose function receives a valid event obejct');

        // TODO: add more checks to validate the event object
        start();
      };

      mockServer.close();
    });

    asyncTest('that the mocksocket onclose function is called after closing the mockserver', function() {
      var socketUrl  = 'ws://localhost:8080';
      var mockServer = new MockServer(socketUrl);
      var mockSocket = new MockSocket(socketUrl);

      expect(4);

      mockServer.on('close', function() {
        ok(true, 'mock server on close fires as expected');
      });

      mockSocket.onclose = function(event) {
        ok(true, 'onclose fires as expected');
        equal(this.readyState, MockSocket.CLOSING, 'the readystate is correct to closed');
        equal(event.currentTarget.url, urlTransform(socketUrl), 'onclose function receives a valid event obejct');

        // TODO: add more checks to validate the event object
        start();
      };

      mockServer.close();
    });
    module('Mocksocket onmessage tests');

    asyncTest('that the mocksocket onmessage function is called after a message is sent', function() {
      var messageData = 'simple string';
      var socketUrl   = 'ws://localhost:8080';
      var mockServer  = new MockServer(socketUrl);
      var mockSocket  = new MockSocket(socketUrl);

      expect(4);

      mockServer.on('connection', function(server) {
        server.send(messageData);
      });

      mockSocket.onmessage = function(event) {
        ok(true, 'mocksocket onmessage fires as expected');
        equal(this.readyState, MockSocket.OPEN, 'the readystate is correct set to open');
        equal(event.currentTarget.url, urlTransform(socketUrl), 'onmessage function receives a valid event obejct');
        equal(event.data, messageData, 'onmessage function receives the correct message');
        start();
      };
    });
    module('Mocksocket onopen tests');

    asyncTest('that the mocksocket onopen function is called after mocksocket object is created', function() {
      var socketUrl  = 'ws://localhost:8080';
      var mockServer = new MockServer(socketUrl);
      var mockSocket = new MockSocket(socketUrl);

      expect(3);

      mockSocket.onopen = function(event) {
        ok(true, 'mocksocket onopen fires as expected');
        equal(this.readyState, MockSocket.OPEN, 'the readystate is correct set to open');
        equal(event.currentTarget.url, urlTransform(socketUrl), 'onopen function receives a valid event obejct');
        start();
      };
    });


    asyncTest('that the mock server connection function is called after mocksocket object is created', function() {
      var socketUrl  = 'ws://localhost:8080';
      var mockServer = new MockServer(socketUrl);
      var mockSocket = new MockSocket(socketUrl);

      expect(1);

      mockServer.on('connection', function() {
        ok(true, 'mock server on connection fires as expected');
        start();
      });
    });


    asyncTest('that the mock server connection function is called after mocksocket object is created', function() {
      var semaphore  = false;
      var socketUrl  = 'ws://localhost:8080';
      var mockServer = new MockServer(socketUrl);
      var mockSocket = new MockSocket(socketUrl);

      expect(2);

      mockServer.on('connection', function() {
        ok(!semaphore, 'The mock server\'s connection was called first before the onopen function');
        semaphore = true;
      });

      mockSocket.onopen = function(event) {
        ok(semaphore, 'The onopen function was called second after the mock server\'s connection function');
        semaphore = true;
        start();
      };
    });
    var service;
    var blankFunction = function() {};

    module('Service Tests', {
      setup: function() {
        service = new SocketService();
      }
    });

    test('Initialization is done correctly', function(){
      deepEqual(service.list, {}, 'the services list is set to an empty object after initialization');
    });

    test('observe method works', function(){
      service.observe('testNamespace', blankFunction, null);

      equal(service.list.testNamespace.length, 1, 'the testNamespace has an element in it');
      deepEqual(service.list.testNamespace[0].callback, blankFunction, 'the element in testNamespace has the correct callback');

      equal(service.observe('testNamespace', 1, null), false, 'when adding an observer with a non function callback then the observe method returns false');
      equal(service.list.testNamespace.length, 1, 'the testNamespace has only 1 element and not 2');
    });

    test('clearAll method works', function(){
      service.observe('testNamespace', blankFunction, null);
      service.observe('testNamespace', blankFunction, null);
      service.observe('fooNamespace', blankFunction, null);

      equal(service.list.testNamespace.length, 2, 'the testNamespace has 2 elements in it');
      equal(service.list.fooNamespace.length, 1, 'the fooNamespace has 1 element in it');

      service.clearAll('testNamespace');

      equal(service.list.testNamespace.length, 0, 'the testNamespace has 0 elements in it');
      equal(service.list.fooNamespace.length, 1, 'the fooNamespace has 1 element in it');

      service.clearAll('fooNamespace');

      equal(service.list.testNamespace.length, 0, 'the testNamespace has 0 elements in it');
      equal(service.list.fooNamespace.length, 0, 'the fooNamespace has 0 elements in it');

      equal(service.clearAll(), false, 'Calling clearAll with no namespace will return false');
    });

    asyncTest('notify method works', function() {
      var sampleData = {
        foo: 'bar'
      };
      var testFunciton = function() {
        ok(true, 'The test function was called');
      };
      var fooFunciton = function(fooData) {
        ok(true, 'The foo function was called');
        deepEqual(sampleData, fooData, 'Arguments are correctly passed to observers');
        start();
      };

      expect(4);

      service.observe('testNamespace', testFunciton, null);
      service.notify('testNamespace');

      service.observe('fooNamespace', fooFunciton, null);
      service.notify('fooNamespace', sampleData);

      equal(service.notify('barNamespace'), false, 'trying to notify on a namespace that has not been initialized will return false');
    });
    module('Mock Socket Update Readystate Test', {
      setup: function() {
        var mockServer = new MockServer('ws://localhost:8080');
      }
    });

    test('that ready state can only be set to 0-4', function() {
      var mockSockets = new MockSocket('ws://localhost:8080');

      expect(3);

      equal(mockSockets.readyState, 0);
      mockSockets._updateReadyState(5);
      equal(mockSockets.readyState, 0);
      mockSockets._updateReadyState(4);
      equal(mockSockets.readyState, 4);
    });
    module('Url Transform Tests');

    test('Url transform is done correctly', function(){
      equal(urlTransform('ws://localhost:8080'), 'ws://localhost:8080/');
      equal(urlTransform('ws://localhost:8080/'), 'ws://localhost:8080/');
      equal(urlTransform('ws://localhost:8080/foo'), 'ws://localhost:8080/foo');
      equal(urlTransform('ws://localhost.com'), 'ws://localhost.com/');
      equal(urlTransform('ws://localhost.com:8080/'), 'ws://localhost.com:8080/');
      equal(urlTransform('ws://localhost.com/foo'), 'ws://localhost.com/foo');
      equal(urlTransform('ws://localhost.com/foo/'), 'ws://localhost.com/foo/');
    });
}).call(this);

//# sourceMappingURL=tests.js.map