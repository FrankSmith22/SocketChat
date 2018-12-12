let fs = require( 'fs' );
let https = require( 'https' );
//Server port and address to listen on.
let address = "0.0.0.0";//Default: Bind to all ports ( 0.0.0.0 )
let port = "60003";//Default: Port 1337

function run_server() {
	
    setTimeout( function() {
		
		try {
			
			let options = {
				key:    fs.readFileSync( "/etc/letsencrypt/live/aaserver.abbas411.com/privkey.pem" ),
				cert:   fs.readFileSync( "/etc/letsencrypt/live/aaserver.abbas411.com/fullchain.pem" ),
				ca:     fs.readFileSync( "/etc/letsencrypt/live/aaserver.abbas411.com/chain.pem" )
			};
			
			let app = https.createServer( options );
			let io = require( 'socket.io' ).listen( app );//socket.io server listens to https connections
			
			app.listen( port, address );
			
			//==========================================
			
			let clients = {
				"0": "Server",
			};
			let conversation = [];
			let typing = [];
			let verbose = true;
			
			if( verbose ) {
				
				console.log( "> server launched" );
			}
			
			io.sockets.on( 'connection', function( socket ) {
			
				////////////////////////
				socket.on( 'disconnect', function() {
					
					if( clients[socket.id] !== undefined ) {
						
						io.sockets.emit( 'message', `${clients[socket.id]} - Is leaving.` );
						delete clients[socket.id];
					}
				});
				
				////////////////////////
				socket.on( 'echo', function( message ) {
					
					if( clients[socket.id] !== undefined ) {
						
						io.sockets.emit( 'message', `${clients[socket.id]} - ${message}` );
					}
				});
				
				socket.on( 'join', function( username = "John Doe" ) {
					
					clients[socket.id] = username;
					io.sockets.emit( 'message', `${clients[socket.id]} - Is joining.` );
					io.sockets.emit(`update_joining`, clients[socket.id] );			
					socket.emit( 'update_conversation', conversation );
				
				});
				
				////////////////////////
				socket.on( 'message', function( message ) {
					
					if( clients[socket.id] !== undefined && message !== "" ) {
						
						console.log( clients[socket.id] + " has sent " + message );
						conversation.push( [clients[socket.id], message] );
						io.sockets.emit( 'update_conversation', conversation );
					}
				});
				
				socket.on( 'start_typing', function() {
					
					if( clients[socket.id] !== undefined ) {
						
						if( ! typing.includes( clients[socket.id] ) ) {
							
							typing.push( clients[socket.id] );
						}
						io.sockets.emit( 'update_typing', typing );
					}
				});
				
				socket.on( 'stop_typing', function() {
					
					if( clients[socket.id] !== undefined ) {
						
						typing.splice( typing.indexOf( clients[socket.id] ), 1);
						io.sockets.emit( 'update_typing', typing );
					}
				});
			});
			
		} catch( e ) {
			
			console.log( "--- Attempting to start the server again ---" );
			check_certificates();
		}
	}, 5000);
}

run_server();