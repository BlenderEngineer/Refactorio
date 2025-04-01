<?php
function prepareStringForCmd($stringInput) {
    return str_replace(
        ["\n", "\"", "`", "$"],
        ["\\n", "\\\"", "\\`", "\\$"],
        $stringInput
    );
}
?>
