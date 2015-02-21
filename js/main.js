/*Array.prototype.look = function(t){
    for (var i = 0; i<this.length; i++){
        if(this[i]==t){
            return i;
        }
    }
    return -1;
}

var o = [1,4,5,'test'];

console.log(o.look('teest'));

try{
    fonctionlol()
} catch(e) {
    console.log(e.name + ' - ' + e.message);
} finally {
    console.log('Finally !')
}
*/
/*
var tab = {};
tab['a'] = 12;
tab['b'] = "test";

console.log(tab['b']);
console.log(tab.length);
*/
/*
function Identite(nom,prenom){
    this.nom = nom;
    this.prenom = prenom;
}

Identite.prototype.laTotale = function (){
    return this.nom + ' - ' + this.prenom;
}

Identite.prototype.taille = 175;

var o = new Identite('pons', 'olivier');
var p = new Identite('pons', 'olivier2');

console.log(o.laTotale());
console.log(Identite.prototype);
console.log(o.taille);
console.log(p.taille);
o.taille = 200;
console.log(o.taille);
console.log(p.taille);
*/

//QCM: qui est le createur de jQuery?

/*
$(document).ready(OnReady());

var OnReady = function(){

});
*/

//QCM $("form")
// revoyer "false" dans un callback de la fonction $("form").submit(Callback) interompt l'envoi au serveur

/*
$(document).ready(OnReady);
function OnReady(){
    $("form").submit(OnSubmit);
}
function OnSubmit(data){
    $.ajax({
        type: $(this).attr("method"),
        url: $(this).attr("action"),
        data: $(this).serialize(),
        success: OnSuccess
    });
    return false;
}
function OnSuccess(data){
    $("#result").html(data); // le serveur doit renvoyer du JSON
}

{
    success: true,
    message: "bien"
}
*/
/*
$(document).ready(OnReady);
function OnReady(){
    $("#form-souscription").submit(OnSubmit);
}
function OnSubmit(data){
    var data = $(this).serialize();
    $(this).find(":input").prop("disabled", true);
    $(this).slideUp(function(){
        $(this).find(":input").removeAttr("disabled");
    });
    $.ajax({
        type: $(this).attr("method"),
        url: $(this).attr("action"),
        data: data,
        success: OnSuccess
    });

    return false;
}
function OnSuccess(data){
    $("#result").fadeOut(function(){
        $(this)
            .html(data.message)
            .fadeIn();
    });
    if(!data.success){
        $("#form-souscription").slideDown();
    }
}
*/

function getURLVariable(variable){
    var vars = location.search.substring(1).split("&");
    for (var i=0; i<vars.length; i++){
        var pair = vars[i].split("=");
        if(pair[0] == variable){
            return pair[1];
        }
    }
    return false;
}

$(document).ready(function(){
    $(".toHide").hide();

    id = getURLVariable("id");
    if (!id) {
        id = "start";
        history.replaceState(null,null,location.href+"?id="+id);
    }
    RequestNode(id);

    $("#bouton-ecrire,#bouton-modifier").click(function(){
        HideAll(function(){
            $("#text-ecrire").val(node.content);
            $("#form-ecrire").fadeIn();
        })
    });
    $("#form-ecrire").submit(RequestNewNode);
    $("#bouton-annuler").click(DisplayNode);

    $("#bouton-ajouter-choix").click(function(){
        $("#form-choice").fadeIn();
    });
    $("#form-ecrire").submit(RequestNewLink);

});

function RequestNewLink(){

}

function RequestNewNode(){
    var content = $("#text-ecrire").val();
    $(this).find(":input").prop("disabled", true);
    HideAll(function(){
        $(this).find(":input").removeAttr("disabled");
    });
    $.ajax({
        type: "POST",
        url: "newNode.php",
        data: {user: "Master", id: id, content: content}, //pas sécurisé
        success: OnNewNodeSuccess,
        error: function(){console.log("Error in RequestNewNode()")}
    });
    return false;
}

function OnNewNodeSuccess(data){
    if(data.success){
        RequestNode();
    }
    else{
        alert("Erreur lors de la requette d'ajout.");
        DisplayNode();
    }
}

function RequestNode(){
    $.ajax({
        type: "POST",
        url: "getNode.php",
        data: {id: id},
        success: OnRequestNodeSuccess,
        error: function(){console.log("Error in RequestNode()")}
    })
}

function OnRequestNodeSuccess(node){
    if(node.success){
        window.node = node;
        DisplayNode();
    }
    else{
        alert("Erreur lors de la requette d'acquisition.");
    }

}

function DisplayNode(){
    HideAll(function(){
        if(node.notFound){
            $("#content").html("Cette partie de l'histoire n'a pas été encore écrite.");
            //if utilisateur connecté
            $("#bouton-ecrire").fadeIn();

        }
        else{
            $("#content").html(node.content)
        }

        if(node.author === "Master"){ // à modifier
            $("#bouton-modifier").fadeIn();
        }

        $("#content").fadeIn();

        //if utilisateur connecté
        $("#bouton-ajouter-choix").fadeIn();
    });
}

function HideAll(callback){
    $(".toHide")
        .fadeOut()
        .promise().done(callback);
}