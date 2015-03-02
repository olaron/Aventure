<?php

session_start();

include_once "model/DB.php";

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

if(isset($_SESSION["pseudo"])){
    if(!empty($_SESSION["pseudo"])){

    }
}



echo json_encode($retour);