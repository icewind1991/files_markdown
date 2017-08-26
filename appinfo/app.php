<?php
$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener(
	'OCA\Files::loadAdditionalScripts',
	function () {
		$policy = new \OC\Security\CSP\ContentSecurityPolicy();
		$policy->setAllowedImageDomains(['*']);
		\OC::$server->getContentSecurityPolicyManager()->addDefaultPolicy($policy);
		
		//load the required files
		OCP\Util::addscript('files_markdown', '../build/editor');
		OCP\Util::addStyle('files_markdown', 'preview');
	});
