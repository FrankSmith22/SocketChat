<!doctype html>
<html>
	<head>
		<meta name="viewport" content="
		width=device-width,
		height=device-height,
		initial-scale=1.0,
		minimum-scale=1.0,
		maximum-scale=1.0
		user-scalable=no">
		<link rel="stylesheet" href="./assets/css/styles.css?v=<?php echo date( "U" );?>">
		<script src="./assets/js/L.js"></script>
		<script src="./assets/js/socket.io.js"></script>
		<script src="./assets/js/script.js?v=<?php echo date( "U" );?>"></script>
	</head>
	<body>
		<div id="veil">
			<div id="veilMessage">
				Username: <input id="usernameInput" name="usernameInput" placeholder="John Doe" type="text" />
			</div>
		</div>
		<div id="app">
			<div id="messagesFeed"></div>
			<div id="messageTyper">
				<input id="txtFieldMessage" placeholder="Type message here ... " type="text" />
			</div>
		</div>
		<script>
			/*
				global c
			*/
			window.onload = c.initialize;
		</script>
	</body>
</html>