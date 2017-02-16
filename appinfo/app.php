<?php
$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener(
	'OCA\Files::loadAdditionalScripts',
	function () {
		//load the required files
		OCP\Util::addscript('files_markdown', 'editor');
		OCP\Util::addStyle('files_markdown', 'preview');
	});
