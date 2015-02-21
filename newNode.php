<?php

include_once "model/DB.php";

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

$node = Node::getById($_POST["id"]);

if(!$node){
    Node::addNode($_POST["id"],$_POST["user"],$_POST["content"]);
    $retour = array(
        'success' => true
    );
}
else{
    if($node->getAuthor() === $_POST["user"]){
        Node::modifyNode($_POST["id"],$_POST["content"]);
        $retour = array(
            'success' => true
        );
    }
    else{
        $retour = array(
            'success' => false
        );
    }
}

echo json_encode($retour);