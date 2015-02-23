import Service from './service';
import MockServer from './mock-server';
import MockSocket from './mock-socket';

if(typeof window === 'undefined') {
	window = global;
}

window.SocketService = Service;
window.MockSocket    = MockSocket;
window.MockServer    = MockServer;
