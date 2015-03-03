<?php

session_start();

include_once "model/DB.php";

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

if($_POST["action"] == "session"){
    if(isset($_SESSION["pseudo"]) && !empty($_SESSION["pseudo"])){
        $retour = array(
            'success' => true,
            'connecte' => true,
            'pseudo' => $_SESSION["pseudo"]
        );
    }
    else{
        $retour = array(
            'success' => true,
            'connecte' => false
        );
    }
}
elseif(isset($_SESSION["pseudo"]) && !empty($_SESSION["pseudo"])){

}


echo json_encode($retour);