<?php

include_once 'User.php';
include_once "Link.php";
include_once 'Node.php';

class DB {
    private static $bd = null;
    private $dbLink;

    private function __construct (){
         $this->dbLink = mysqli_connect("localhost", "root", "") or die('Erreur de connexion au serveur : ' . mysqli_connect_error());
         mysqli_select_db($this->dbLink , "aventure") or die('Erreur dans la sélection de la base : ' . mysqli_error($this->dbLink));
    }

    public static function getInstance (){
        if (self::$bd == null)
        {
            self::$bd = new DB();
            if (self::$bd == null)
                ;//echo 'Erreur de connection à la BDD';
        }
        return self::$bd->dbLink;
    }

    public static function sendQuery($query){
        $link = DB::getInstance();

        if(!($dbResult = mysqli_query($link, $query)))
        {
            //echo 'Erreur de requête.<br/>';
            // Affiche le type d'erreur.
            //echo 'Erreur : ' . mysqli_error($link) . '<br/>';
            // Affiche la requête envoyée.
            //echo 'Requête : ' . $query . '<br/>';
            exit();
        }
        return $dbResult;

    }

    public static function isResultNull($result){
        return (mysqli_num_rows($result) === 0);
    }
}
