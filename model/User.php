<?php

class User {
    private $pseudo;
    private $hash;
    private $salt;

    private function __construct ($pseudo,$hash,$salt){
        $this->pseudo = $pseudo;
        $this->hash = $hash;
        $this->salt = $salt;
    }

    public function getPseudo(){
        return $this->pseudo;
    }

    private function getSalt(){
        return $this->salt;
    }

    private function getHash(){
        return $this->hash;
    }

    private static function makeUser($row){
        return new User($row["pseudo"],$row["hash"],$row["salt"]);
    }

    public static function getByPseudo($pseudo){
        $result = DB::sendQuery("select * from users where pseudo = '$pseudo'");
        return User::makeUser($result->fetch_array());
    }

    public static function allowConnection($pseudo, $pass){
        $user = User::getByPseudo($pseudo);
        $hash = hash("sha256",$user->getSalt().$pass);
        return ($hash === $user->getHash());
    }

    public static function addUser($pseudo,$pass){
        if (DB::isResultNull(
                DB::sendQuery("select * from users where pseudo = '$pseudo'"))
        ){
            $salt = openssl_random_pseudo_bytes(64);
            $hash = hash("sha256",$salt.$pass);
            DB::sendQuery("insert into users (pseudo, hash, salt)
                            values ('$pseudo', '$hash', '$salt')");
        }
        else{
            //echo 'Le pseudo \"'.$pseudo.'\" est déjà utilisé.';
        }
    }

}