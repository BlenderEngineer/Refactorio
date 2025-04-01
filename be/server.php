<?php

require __DIR__ . '/vendor/autoload.php';

use Psr\Http\Message\ServerRequestInterface;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\Socket\SocketServer;

// Directory to the static vite build output
$publicDir = realpath(__DIR__ . '/../fe/dist');

function extractJsonFromText($input) {
    echo "extractJsonFromText received input: " . $input . "\n";
    
    $start = strpos($input, '{');
    $end = strrpos($input, '}');
    if ($start === false || $end === false || $end < $start) {
        echo "extractJsonFromText: Could not find valid JSON delimiters.\n";
        return null;
    }
    $jsonStr = substr($input, $start, $end - $start + 1);
    echo "extractJsonFromText extracted JSON: " . $jsonStr . "\n";
    return $jsonStr;
}

function getAiAnalysis($userCode, $maxAttempts = 5) {
    $attempt = 0;
    while ($attempt < $maxAttempts) {
        $attempt++;
        echo "getAiAnalysis attempt: $attempt\n";
        
        $prompt = "Please analyze the following code for improvements in readability, maintainability, and performance. " .
                  "Return your response as a JSON object with exactly two keys: 'suggestions' and 'codeSamples'. " .
                  "The 'suggestions' key should be an array of textual bullet-point recommendations (each item a single string). " .
                  "The 'codeSamples' key should be an array of code snippets corresponding to some or all of the suggestions (if applicable). " .
                  "Do not include any extra text, markdown, or commentary outside of the JSON object. " .
                  "Here is the code to analyze:\n";
        
        $combined = $prompt . "\n" . $userCode;
        echo "Combined prompt and code:\n" . $combined . "\n";
        
        $tempFile = tempnam(sys_get_temp_dir(), 'ai_input');
        file_put_contents($tempFile, $combined);
        
        //windows type command is used to output the file contents
        $command = "type $tempFile | ollama run deepseek-r1";
        echo "Executing command:\n" . $command . "\n";
        $output = shell_exec($command);
        echo "Raw output:\n" . $output . "\n";
        
        unlink($tempFile);

        $jsonStr = extractJsonFromText($output);
        if (!$jsonStr) {
            echo "Attempt $attempt: Failed to extract JSON. Retrying\n";
            continue;
        }
        
        $json = json_decode($jsonStr, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "Attempt $attempt: JSON decoding error: " . json_last_error_msg() . ". Retrying\n";
            continue;
        }
        
        echo "Successfully decoded JSON on attempt $attempt.\n";
        return $json;
    }
    
    echo "Exceeded maximum attempts ($maxAttempts). Returning empty analysis.\n";
    return [
        'suggestions' => [],
        'codeSamples' => []
    ];
}


$http = new HttpServer(function (ServerRequestInterface $request) use ($publicDir) {
    $path = $request->getUri()->getPath();
    if (strpos($path, '/api/') === 0) {
        if ($path === '/api/analyze') {
            $body = (string)$request->getBody();
            echo "HTTP /api/analyze body: " . $body . "\n";
            $data = json_decode($body, true);
            echo "Decoded JSON from request: " . print_r($data, true) . "\n";

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
    }
    if ($path === '/') {
        $path = '/index.html';
    }

    $file = realpath($publicDir . $path);
    
    // Checks if file exists and is in the correct directory
    if ($file !== false && strpos($file, $publicDir) === 0 && file_exists($file)) {
        $mimeType = 'text/plain';
        if (preg_match('/\.html$/i', $file)) {
            $mimeType = 'text/html';
        } elseif (preg_match('/\.css$/i', $file)) {
            $mimeType = 'text/css';
        } elseif (preg_match('/\.js$/i', $file)) {
            $mimeType = 'application/javascript';
        } elseif (preg_match('/\.svg$/i', $file)) {
            $mimeType = 'image/svg+xml';
        }

        return new Response(
            200,
            ['Content-Type' => $mimeType],
            file_get_contents($file)
        );
    } else {
        return new Response(
            404,
            ['Content-Type' => 'text/plain'],
            '404 Not Found'
        );
    }
});

$socket = new SocketServer('127.0.0.1:8080');
$http->listen($socket);

echo "Server running at http://127.0.0.1:8080" . "\n";
?>
