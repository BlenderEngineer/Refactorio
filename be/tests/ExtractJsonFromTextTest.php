<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../server.php';

class ExtractJsonFromTextTest extends TestCase {

    public function testValidJsonInText() {
        $input = "text text {\"key\":\"value\"}text text";
        $expected = "{\"key\":\"value\"}";
        $this->assertEquals($expected, extractJsonFromText($input));
    }
    
    public function testValidJsonOnly() {
        $input = "{\"key\":\"value\"}";
        $expected = "{\"key\":\"value\"}";
        $this->assertEquals($expected, extractJsonFromText($input));
    }
    
    public function testNoOpeningBrace() {
        $input = "Not a JSON }";
        $this->assertNull(extractJsonFromText($input));
    }
    
    public function testNoClosingBrace() {
        $input = "Not a JSON {";
        $this->assertNull(extractJsonFromText($input));
    }
    
    public function testInvalidJSON() {
        $input = "Random } text {";
        $this->assertNull(extractJsonFromText($input));
    }
}
