<?php
/**
 * Copyright (c) 2013 Robin Appelman <icewind@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OCA\Files_Markdown;

class WKHTMLtoPDF {
	private $bin;

	public function __construct() {
		$this->bin = realpath(__DIR__ . '/../bin/wkhtmltopdf');
		if (!file_exists($this->bin)) {
			throw new \Exception('binary not found');
		}
	}

	public function renderHTMLFile($source, $target) {
		$cmd = $this->bin . ' --output-format pdf ' . escapeshellarg($source) . ' ' . escapeshellarg($target);
		exec($cmd);
	}
}
