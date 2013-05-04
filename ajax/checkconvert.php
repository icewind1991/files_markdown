<?php
/**
 * Copyright (c) 2013 Robin Appelman <icewind@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

\OCP\JSON::checkLoggedIn();
\OCP\JSON::callCheck();
\OCP\JSON::setContentTypeHeader();

try {
	$converter = new \OCA\Files_Markdown\WKHTMLtoPDF();
	echo 'true';
} catch (Exception $e) {
	echo 'false';
}
