<?php
/**
 * Copyright (c) 2013 Robin Appelman <icewind@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

\OCP\JSON::checkLoggedIn();
\OCP\JSON::callCheck();

try {
	$converter = new \OCA\Files_Markdown\WKHTMLtoPDF();
} catch (Exception $e) {
	\OC_JSON::error(array('error' => 'binary not found'));
	exit();
}

$sourceName = \OC\Files\Filesystem::getLocalFile($_POST['name']);
$sourceName = basename($sourceName);
$sourceName = substr($sourceName, 0, strrpos($sourceName, '.'));
$targetName = $sourceName . '.pdf';

// we can't use /tmp on all system since systemd's PriveTmp prevents apache's tmp files from being accessed by wkpdftohtml
$basedir = \OC_User::getHome(\OC_User::getUser()) . '/files_markdown';
if (!is_dir($basedir)) {
	mkdir($basedir);
}

$targetFile = $basedir . '/' . $targetName;
$sourceFile = $basedir . '/' . $sourceName . '.html';
$source = $_POST['html'];

$css = realpath(__DIR__ . '/../css/render.css');
$template = new \OC_Template('files_markdown', 'render');
$template->assign('css', file_get_contents($css));
$template->assign('mathjaxcss', $_POST['mathjaxcss']);
$template->assign('html', $source);
$html = $template->fetchPage();
file_put_contents($sourceFile, $html);

$converter->renderHTMLFile($sourceFile, $targetFile);

if (preg_match("/MSIE/", $_SERVER["HTTP_USER_AGENT"])) {
	header('Content-Disposition: attachment; filename="' . rawurlencode($targetName) . '"');
} else {
	header('Content-Disposition: attachment; filename*=UTF-8\'\'' . rawurlencode($targetName)
		. '; filename="' . rawurlencode($targetName) . '"');
}
header('Content-Transfer-Encoding: binary');
header('Content-Type: application/pdf');
header('Content-Length: ' . filesize($targetFile));
readfile($targetFile);
unlink($targetFile);
unlink($sourceFile);
