<?php

require __DIR__ . '/vendor/autoload.php';

use Psr\Http\Message\ServerRequestInterface;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\Socket\SocketServer;

// Directory to the static vite build output
$publicDir = realpath(__DIR__ . '/../fe/dist');

$http = new HttpServer(function (ServerRequestInterface $request) use ($publicDir) {
    $path = $request->getUri()->getPath();
    if (strpos($path, '/api/') === 0) {
        if ($path === '/api/analyze'){
            $body = (string)$request->getBody();
            $data = json_decode($body, true);

            if(!isset($data['code'])){
                $result = 'Could not receive analysis';
                return new Response(
                    404,
                    ['Content-Type' => 'application/json'],
                    json_encode(['result' => $result])
                );
            }
            $result = 'code has been received';
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
