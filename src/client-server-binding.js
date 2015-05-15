var socketMessageEvent = require('./helpers/message-event');
var delay = require('./helpers/delay');

function ClientServerBinding(client, server) {
	this.send = function(msgs) {
		delay(function() {
			if (client.onmessage) {
				if (msgs instanceof Array === false) {
					msgs = [msgs];
				}
				for (var i = 0; i < msgs.length; i++) {
					var msg = msgs[i];
					client.onmessage(socketMessageEvent('message', msg, server.url));
				}
			}
		}, this);
	}

	this.on = function(type, callback) {
		server.on.call(server, type, callback);
	}

	this.close = function() {
		client.close.call(client);
	}
}

module.exports = ClientServerBinding