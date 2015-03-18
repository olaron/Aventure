<?php

class Link {
    private $from;
    private $to;
    private $action;
    private $author;
    private $id;

    private function __construct($from, $to, $action, $author,$id){
        $this->author = $author;
        $this->from = $from;
        $this->to = $to;
        $this->action = $action;
        $this->id =$id;
    }

    public function getFrom()
    {
        return $this->from;
    }

    public function getTo()
    {
        return $this->to;
    }

    public function getAction()
    {
        return $this->action;
    }

    public function getAuthor()
    {
        return $this->author;
    }

    public function getId(){
        return $this->id;
    }

    private static function makeLink($row){
        return new Link($row["from_node"],$row["to_node"],$row["link_action"],$row["pseudo"],$row["id_link"]);
    }

    public static function getLinksFromId($id){
        $result = DB::sendQuery("select * from links where from_node = '$id'");
        $links = [];
        while($row = $result->fetch_array()){
            $links[] = Link::makeLink($row);
        }
        return $links;
    }

    public static function checkLinkId($id){
        return DB::isResultNull(DB::sendQuery("select * from links where id_link = '$id'"));
    }

    public static function getLinkById($id){
        $result = DB::sendQuery("select * from links where id_link = '$id'");
        return Link::makeLink($result->fetch_array());
    }

    public static function addLink($from, $to, $action, $author){
        if (DB::isResultNull(
                DB::sendQuery("select * from links where from_node = '$from'
                    and to_node = '$to' and link_action = '$action' and pseudo = '$author'"))
        ) {
            DB::sendQuery("insert into links (from_node, link_action, to_node, pseudo)
                          values ('$from', '$action', '$to', '$author' )");
        }

    }

    public static function editLink($id,$destination,$texte){
        $texte = htmlspecialchars($texte);
        DB::sendQuery("update links set link_action = '$texte', to_node = '$destination'
                            where id_link = '$id'");
    }

}