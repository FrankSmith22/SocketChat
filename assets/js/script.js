/*global L*/
m = {};
v = {};
c = {
	
	messages_feed: null,
	username: null,
	loggedIn: false,
	still_typing: null,
	
	async initialize() {
		
		L.attachAllElementsById(v);
		L.noPinchZoom(); //for iOS
		v.usernameInput.focus();
		c.username = await c.loginUser();
		c.load_socket();
		v.txtFieldMessage.focus();
		v.txtFieldMessage.addEventListener( 'keydown', ( eventObject ) => {
			
			if( c.still_typing ) {
				
				clearTimeout( c.still_typing );
				c.still_typing = null;
			}
			
			c.still_typing = setTimeout( function() {
				
				socket.emit( "stop_typing" );
			}, 1000 );
			socket.emit( "start_typing" );
			
			if( eventObject.keyCode == 13 ) {
				
				socket.emit( 'message', v.txtFieldMessage.value );
				v.txtFieldMessage.value = "";
			}
		});
	},
	/////////////////////////////////
	load_socket() {
		
		let collaborative_server = `https://aaserver.abbas411.com:60003`;
		socket = io.connect( collaborative_server, {
			'forceNew': true,
		});
		
		/////////////////
		socket.emit( `join`, c.username );
		
		//////////////////
		socket.on( 'connect_failed', function() {
			
			console.log( 'Connection Failed' );
		});
		
		//////////////////
		socket.on( 'disconnect', function() {
			
			console.log( 'Disconnected' );
		});
		
		/////////////////
		socket.on( 'message', function( message ) {
			
			console.log( message );
		});
		
		///////////////
		socket.on( 'update_conversation', function( conversation ) {
			
			console.log( "loading conversation" );
			let length = conversation.length;
			v.messagesFeed.innerHTML = "";
			
			for( i = 0; i < length; i++ ) {
				
				if( c.username === conversation[i][0] ) {
					
					v.messagesFeed.innerHTML += 
					`<div class="personalMessageContainer">
						<div class="personalMessage">
							<div class="usernameLabel">
								${conversation[i][0].replace(/</gi,"&lt;").replace(/>/gi,"&gt;")}
							</div>
							<div class="messageContent">
								${conversation[i][1].replace(/</gi,"&lt;").replace(/>/gi,"&gt;")}
							</div>
						</div>
					</div>`;
				} else {
					
					v.messagesFeed.innerHTML += `
					<div class="messageContainer">
						<div class="message">
							<div class="usernameLabel">
								${conversation[i][0].replace(/</gi,"&lt;").replace(/>/gi,"&gt;")}
							</div>
							<div class="messageContent">
								${conversation[i][1].replace(/</gi,"&lt;").replace(/>/gi,"&gt;")}
							</div>
						</div>
					</div>`;
				}
			}
			v.messagesFeed.scrollTo( 0, v.messagesFeed.scrollHeight );
		});
		
		///////////////
		socket.on( 'update_typing', function( typing ) {
			
			console.log( typing );
			if( typing.length === 0 ) {
				//transition whoIsTyping Div down below messageTyper
				v.typingContainer.css('bottom: 20px;');
				v.whoIsTyping.innerHTML = "";
				
			} else {
				
				let message = '';
				let ending = '';
				
				for( let i = 3;i--; ) {
					
					if( typing[i] ) {
						
						//fill the whoIsTyping Div with last three..
						message += typing[i] + ", ";
						v.typingContainer.css('bottom: 50px;');
					}
				}
				
				if( typing.length === 1 ) {
					
					ending = " is typing ... "
				} else {
					
					ending = " are typing ... "
				}
				
				v.whoIsTyping.innerText = message.substring( 0, message.length - 2 ) + ending;
			}
		});
	},
	
	/////////////////////
	hideVeil(boolean){
		if(boolean){
			v.veil.css(`
				visibility: hidden;
				opacity: 0;
				display: none;
			`)
		} else {
			v.veil.css(`
				visibility: visible;
				opacity: 1;
				display: block;				
			`)			
		}
	},
	/////////////////////
	loginUser() {
		
		return new Promise( resolve => {
			
			v.usernameInput.onkeydown = function( eventObject ) {
				
				let username = v.usernameInput.value
				
				if( eventObject.keyCode !== 13 ) { return; }
				if( username === `` || username === null || username === 'null' || username === 'undefined' || username === undefined) { return; }
				
				resolve( username );
				v.usernameInput.value = ``;
				c.hideVeil( true );
			}
		})
	}

}; 