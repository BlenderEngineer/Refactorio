<?php

include __DIR__ . '/../utils/prepareStringForCmd.php';
use PHPUnit\Framework\TestCase;

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
