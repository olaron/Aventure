<?php

include_once "model/DB.php";

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

$node = Node::getById($_POST["id"]);


if ($node){
    $retour = array(
        'success' => true,
        'content' => $node->getContent(),
        'author' => $node->getAuthor(),
        'links' => array()
    );
    $links = $node->getLinks();
    foreach($links as $link ){

        $retour['links'][] = array(
            'action' => $link->getAction(),
            'leadTo' => $link->getTo(),
            'author' => $link->getAuthor()
        );

    }
}
else{
    $retour = array(
        'success' => true,
        'notFound' => true
    );
}

echo json_encode($retour);