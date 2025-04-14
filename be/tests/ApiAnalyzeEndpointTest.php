<?php


use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ServerRequestInterface;
use GuzzleHttp\Psr7\ServerRequest;
use React\Http\Message\Response;

final class ApiAnalyzeEndpointTest extends TestCase
{
    /**
     *
     * @param ServerRequestInterface $request
     * @return Response
     */
    private function apiAnalyzeHandler(ServerRequestInterface $request)
    {
        $path = $request->getUri()->getPath();
        if ($path === '/api/analyze') {
            $body = (string)$request->getBody();

            
            $data = json_decode($body, true);
            
            if (!isset($data['code'])) {
                $result = 'Could not receive analysis';
                return new Response(
                    404,
                    ['Content-Type' => 'application/json'],
                    json_encode(['result' => $result])
                );
            }

            $result = getAiAnalysis($data['code']);
            return new Response(
                200,
                ['Content-Type' => 'application/json'],
                json_encode(['result' => $result])
            );
        }
        return new Response(404);
    }

    public function testApiAnalyzeReturnsValidResponse()
    {

        $payload = ['code' => "echo 'Hello, world!';"];

        $request = new ServerRequest(
            'POST',
            '/api/analyze',
            ['Content-Type' => 'application/json'],
            json_encode($payload)
        );

        $response = $this->apiAnalyzeHandler($request);

        // Verify the response status is 200.
        $this->assertEquals(200, $response->getStatusCode(), "Expected status code 200");

        $data = json_decode((string)$response->getBody(), true);
        $this->assertIsArray($data, "Response should be a valid JSON array");
        $this->assertArrayHasKey('result', $data, "Response should include a 'result' key");

        // Verify that getAiAnalysis returned the expected structure.
        $analysis = $data['result'];
        $this->assertArrayHasKey('suggestions', $analysis, "Analysis should include 'suggestions'");
        $this->assertArrayHasKey('codeSamples', $analysis, "Analysis should include 'codeSamples'");
    }

    public function testApiAnalyzeMissingCodeReturnsError()
    {
        // Create a payload without the 'code' key.
        $payload = [];
        $request = new ServerRequest(
            'POST',
            '/api/analyze',
            ['Content-Type' => 'application/json'],
            json_encode($payload)
        );

        $response = $this->apiAnalyzeHandler($request);

        // Check for a 404 error when 'code' is missing.
        $this->assertEquals(404, $response->getStatusCode(), "Expected status code 404 for missing code");

        $data = json_decode((string)$response->getBody(), true);
        $this->assertIsArray($data, "Response should be a valid JSON array");
        $this->assertEquals('Could not receive analysis', $data['result'], "Expected error message for missing code");
    }
}
