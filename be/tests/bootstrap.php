<?php
// tests/bootstrap.php

// Define a constant that signals PHPUnit is running.
define('PHPUNIT_RUNNING', true);

// Now, load the Composer autoloader (which in turn loads your application files).
require __DIR__ . '/../vendor/autoload.php';
