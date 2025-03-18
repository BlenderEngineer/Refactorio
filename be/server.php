<?php

require __DIR__ . '/vendor/autoload.php';

use Psr\Http\Message\ServerRequestInterface;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\Socket\SocketServer;

// Directory to the static vite build output
$publicDir = realpath(__DIR__ . '/../fe/dist');

function getAIScore($userCode) {
    /*$command = "echo 'Give me a single-digit code score' | ollama run deepseek-r1";*/
	//$userCode = "i forgot";
	$command = "echo \"Respond only(user will only see the number between those tags, so dont give any explanation so your response would run faster) with code quality(0-10), acceptable answer: <codeScore>0</codeScore> now I'm giving you user message: $userCode\" | ollama run deepseek-r1";
	echo $command;
    $output = shell_exec($command);
    echo $output;
    preg_match('/<codeScore>(.|\n)*?<\/codeScore>/', $output, $matches);
    return $matches[1] ?? 0;
}

$http = new HttpServer(function (ServerRequestInterface $request) use ($publicDir) {
    $path = $request->getUri()->getPath();
	
	if ($path === '/api/codeScore'){
		$data = json_decode($request->getBody()->getContents(), true);
        $userCode = $data['code'] ?? '';
        $score = getAIScore($userCode);
        return new Response(
            200,
            ['Content-Type' => 'application/json'],
            json_encode(['result' => $score])
        );
    }
    elseif ($path === '/') {
        $path = '/index.html';
    }

    // Gets the full path to the requested file
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

echo "Server running at http://127.0.0.1:8080" . PHP_EOL;
