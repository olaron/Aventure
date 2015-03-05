<?php

session_start();

include_once "model/DB.php";

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

$r = array('success' => true);

if($_POST["action"] === "session"){
    if(isset($_SESSION["pseudo"]) && !empty($_SESSION["pseudo"])){
        $r['connecte'] = true;
        $r['pseudo'] = $_SESSION["pseudo"];
    }
    else{
        $r['connecte'] = false;
    }
}

elseif($_POST["action"] === "connexion"){
    if(User::allowConnection($_POST["pseudo"],$_POST["password"])){
        $r['connecte'] = true;
        $r['pseudo'] = $_POST["pseudo"];
        $_SESSION["pseudo"] = $_POST["pseudo"];
    }
    else{
        $r['connecte'] = false;
    }
}

elseif($_POST["action"] === "deconnexion"){
    unset($_SESSION["pseudo"]);
}

elseif($_POST["action"] === "inscription"){
    if(!User::checkPseudo($_POST["pseudo"])){
        $r["erreurPseudoUsed"] = true;
    }

    if(!ctype_alnum($_POST["pseudo"])){
        $r["erreurAlphaNum"] = true;
    }

    if(strlen($_POST["pseudo"])<2){
        $r["erreurPseudoLength"] = true;
    }

    if(strlen($_POST["password"])<6){
        $r["erreurPassLength"] = true;
    }

    if($_POST["password"] !== $_POST["confirmation"]){
        $r["erreurConfirmation"] = true;
    }

    if(!(isset($r["erreurPseudoUsed"]) || isset($r["erreurAlphaNum"]) || isset($r["erreurPseudoLength"]) || isset($r["erreurPassLength"]) || isset($r["erreurConfirmation"]))){
        User::addUser($_POST["pseudo"],$_POST["password"]);
        $r['connecte'] = true;
        $r['pseudo'] = $_POST["pseudo"];
        $_SESSION["pseudo"] = $_POST["pseudo"];
    }

}

elseif(isset($_SESSION["pseudo"]) && !empty($_SESSION["pseudo"])){

}


echo json_encode($r);