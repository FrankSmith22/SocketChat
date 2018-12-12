<?php
/**
 * Always start the session.
 */
session_start();

if( isset( $_POST["login"] ) ) {
	
	$username = $_POST["username"];
	$invalid_usernames = array(
		"",
		"null",
		null,
		"undefined",
	);
	
	if( ! in_array( $username, $invalid_usernames ) ) {
		
		$_SESSION["username"] = $username;
	}
}

if( isset( $_GET["logout"] ) ) {
	
	unset( $_SESSION["username"] );
	session_destroy();
	session_unset();
}
?>
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
		
		<title>Socket Chat</title>
		
		<link rel="manifest" href="manifest.json">
		<link rel="icon" id="favicon"  href="./assets/images/codiadChatLogo192x192.png" type="image/x-icon">
		<link rel="apple-touch-icon" href="./assets/images/codiadChatLogo192x192.png" >
		<link rel="apple-touch-icon" sizes="180x180" href="./assets/images/codiadChatLogo192x192.png" >
		
		<link rel="stylesheet" href="./assets/css/styles.css?v=<?php echo date( "U" );?>">
		<script src="./assets/js/L.js"></script>
		<script src="./assets/js/socket.io.js"></script>
		<script src="./assets/js/script.js?v=<?php echo date( "U" );?>"></script>
	</head>
	<body>
		<?php
			if( ! isset( $_SESSION["username"] ) ) {
		?>
			<div class="loginContainer">
				<form class="loginForm" action="./index.php" method="post">
					<label>Username:</label>
					<input name="username" placeholder="John Doe" type="text" required="required" />
					<label>Password:</label>
					<input name="password" placeholder="password" type="password" />
					<input name="login" type="submit" value="Login" />
				</form>
			</div>
		<?php
		} else {
		?>
			<!--<div id="veil">
			</div>-->
			<div id="app">
				<div id="landscapeMenu">
					<div>Join a private lobby</div>
					<div>Menu Option</div>
					<div>Menu Option</div>
					<div class="logoutButtons">Logout</div>
					<div id="landscapeMenuTab">
						<div id="landscapeTabArrow"></div>
					</div>
				</div>
				<div id="portraitMenu">
					<div>Join a private lobby</div>
					<div>Menu Option</div>
					<div>Menu Option</div>
					<div class="logoutButtons">Logout</div>
					<div id="portraitMenuTab">
						<div id="portraitTabArrow"></div>
					</div>
				</div>
				<div id="messagesFeed"></div>
				<div id="typingContainer">
					<p id="whoIsTyping"></p>
				</div>
				<div id="messageTyper">
					<input id="txtFieldMessage" placeholder="Type message here ... " type="text" />
				</div>
			</div>
			<script>
				/*global c*/
				c.username = `<?php echo $_SESSION["username"];?>`;
				window.onload = c.initialize;
			</script>
		<?php
			}
		?>
	</body>
</html>

