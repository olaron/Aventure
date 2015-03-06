<?php

class Node {
    private $content;
    private $author;
    private $id;
    private $links;

    private function __construct($id, $content, $author){
        $this->content = $content;
        $this->author = $author;
        $this->id = $id;
    }

    public function getContent(){
        return htmlspecialchars_decode($this->content);
    }

    public function getAuthor(){
        return $this->author;
    }

    public function getLinks(){
        if(!$this->links){
            $this->links = Link::getLinksFromId($this->id);
        }
        return $this->links;
    }

    private static function makeNode($row){
        return new Node($row["id"],$row["content"],$row["author"]);
    }

    public static function getById($id){
        $result = DB::sendQuery("select * from nodes where id = '$id'");
        if (DB::isResultNull($result)){
            return false;
        }
        return Node::makeNode($result->fetch_array());
    }

    public static function addNode($id, $author, $content){
        $content = htmlspecialchars($content);
        DB::sendQuery("insert into nodes (id, author, content)
                            values ('$id', '$author', '$content')");
    }

    public static function modifyNode($id, $content){
        $content = htmlspecialchars($content);
        DB::sendQuery("update nodes set content='$content'
                            where id='$id'");
    }

}