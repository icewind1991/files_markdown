<?php

use OCA\FilesMarkdown\AppInfo\Application;
/** @var Application $app */
$app = \OC::$server->query(Application::class);
$app->register();

