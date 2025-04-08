<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../server.php';


class prepareStringForCmdTest extends TestCase
{
    public function testNewLine(){
		$rawString = "\n";
		$filteredString = prepareStringForCmd($rawString);
        $this->assertEquals($filteredString, "\\n");
    }
	public function testAllCharacters(){
		$rawString = "\n\"$`";
		$filteredString = prepareStringForCmd($rawString);
        $this->assertEquals($filteredString, "\\n\\\"\\$\\`");
    }
}
?>
