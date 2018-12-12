/*global L*/
m = {
	isJoining: false,
	isPortrait: false,
	screenSizeEvents: ["load", "DOMContentLoaded","resize","orientationchange",],
	hideElement: `display: none`,
	showElement: `display: block`,
	menuActive: false,
};
v = {};
c = {
	
	messages_feed: null,
	username: null,
	loggedIn: false,
	still_typing: null,
	
	initialize() {
		
		try{
			L.attachAllElementsById(v);
			
			//let window listen for events that change screen orientation
			c.updateOrientation();			
			m.screenSizeEvents.forEach( function( eventType ) {
				
				window.addEventListener(eventType, c.updateOrientation);
			});
			L.noPinchZoom(); //for iOS
			c.load_socket();
			v.portraitMenuTab.addEventListener('click', c.toggleMenu);
			v.landscapeMenuTab.addEventListener('click', c.toggleMenu);
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

			document.querySelectorAll(`.logoutButtons`).forEach( button => {
				button.addEventListener( `click`, c.logout );
			})
			
		}
		catch(error){
			//handle error
		}

	},
	
	logout() {
		
		console.log( `${c.username} is logging out.` );
		window.location.href = './index.php?logout';
	},
	
	/////////////////////////////////
	toggleMenu(eo){
		if(m.menuActive){
			if(eo.target.id === "portraitMenuTab" || eo.target.id === "portraitTabArrow"){
				v.portraitMenu.css('bottom: 100%');
			}
			else{
				v.landscapeMenu.css('left: 100%');
			}
			m.menuActive = false
			c.toggleTabArrow();
		}
		else{
			if(eo.target.id === "portraitMenuTab" || eo.target.id === "portraitTabArrow"){
				v.portraitMenu.css('bottom: 0');
			}
			else{
				v.landscapeMenu.css('left: 0');
			}
			m.menuActive = true;
			c.toggleTabArrow();
		}
	},
	/////////////////////////////////
	toggleTabArrow(){
		if(m.isPortrait){
			if(m.menuActive){
				v.portraitTabArrow.css('transform: rotate(135deg); bottom: 40%;');
			}
			else{
				v.portraitTabArrow.css('transform: rotate(-45deg); bottom: 20%;');
			}
		}
		else{
			if(m.menuActive){
				v.landscapeTabArrow.css('transform: rotate(-135deg); right: 20%;');
			}
			else{
				v.landscapeTabArrow.css('transform: rotate(45deg); right: 40%;');
			}
		}
	},
	/////////////////////////////////
	updateOrientation(){
		window.innerHeight >= window.innerWidth 
			? m.isPortrait = true
			: m.isPortrait = false
			c.switchMenus()
	},
	/////////////////////////////////
	switchMenus(){
		console.log(`is portrait`, m.isPortrait);
		if( m.isPortrait ) {
			
			v.portraitMenu.css(m.showElement);
			v.landscapeMenu.css(m.hideElement);
			v.landscapeMenu.css('left: 100%');
			v.landscapeTabArrow.css("transform: rotateZ(45deg);right: 40%;");
		} else if(!m.isPortrait) {
			
			v.portraitMenu.css(m.hideElement);
			v.portraitMenu.css('bottom: 100%');
			v.landscapeMenu.css(m.showElement);
			v.portraitTabArrow.css("transform: rotateZ(-45deg);bottom:20%;");
		}
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
		socket.on( `update_joining`, function( joining ){
			
			console.log ( joining );
			m.isJoining = true;
			
			//show popup
			v.whoIsTyping.innerHTML =  `${joining} is joining`;
			v.typingContainer.css('bottom: 50px;');
			
			//hide popup and, etc.  
			setTimeout(function(){
				m.isJoining = false;
				v.typingContainer.css('bottom: 20px;');
				v.whoIsTyping.innerHTML = '';
			}, 1500)
			
		})
		
		///////////////
		socket.on( 'update_typing', function( typing ) {
			
			if(m.isJoining){ return }
			
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
	/*
	loginUser() {
	
		return new Promise( resolve => {
			
			v.usernameInput.onkeydown = function( eventObject ) {
				
				let username = v.usernameInput.value
				
				if( eventObject.keyCode !== 13 ) { return; }
				if( username === `` || username === null || username === 'null' || username === 'undefined' || username === undefined) { return; }
				
				v.usernameInput.value = ``;
				c.hideVeil( true );
				resolve( username );
			}
		})
	}
	*/
	
}; 