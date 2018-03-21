<?php
$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener(
	'OCA\Files::loadAdditionalScripts',
	function () {
		$policy = new \OC\Security\CSP\ContentSecurityPolicy();
		$policy->setAllowedImageDomains(['*']);
		$frameDomains = $policy->getAllowedFrameDomains();
		$frameDomains[] = 'www.youtube.com';
		$frameDomains[] = 'prezi.com';
		$frameDomains[] = 'player.vimeo.com';
		$frameDomains[] = 'vine.co';
		$policy->setAllowedFrameDomains($frameDomains);
		\OC::$server->getContentSecurityPolicyManager()->addDefaultPolicy($policy);

		//load the required files
		OCP\Util::addscript('files_markdown', '../build/editor');
		OCP\Util::addStyle('files_markdown', '../build/styles');
		OCP\Util::addStyle('files_markdown', 'preview');
	});


$eventDispatcher->addListener(
	'OCA\Files_Sharing::loadAdditionalScripts',
	function () {
		OCP\Util::addScript('files_markdown', '../build/editor');
		OCP\Util::addStyle('files_markdown', '../build/styles');
		OCP\Util::addStyle('files_markdown', 'preview');
	});
