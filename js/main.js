// Générateurs de formulaires //

function newButton(id, type, text, icon,clickCallback){
    var glyph = $("<span>")
        .attr("class", "glyphicon glyphicon-"+icon)
        .attr("aria-hidden", "true");
    return $('<button>')
        .attr("class", "btn btn-default")
        .attr("type", type)
        .attr("id", id)
        .click(clickCallback)
        .append(glyph , " "+text);
}

function newInput(name, type, placeholder){
    return $("<input>")
        .attr("class", "form-control")
        .attr("type", type)
        .attr("name",name)
        .attr("placeholder", placeholder);
}

function newTextarea(id, placeholder, value){
    return $("<textarea>")
        .attr("class", "form-control")
        .attr("id", id)
        .attr("placeholder", placeholder)
        .val(value);
}

function newHiddenInput(name,value){
    return $("<input>")
        .attr("type","hidden")
        .attr("name",name)
        .attr("value",value);
}

function newInputGroup(inputs){
    return $("<div>")
        .attr("class","input-group")
        .append(inputs);
}

function newButtonGroup(buttons){
    return $("<span>")
        .attr("class","input-group-btn")
        .append(buttons);
}

function newFormulaire(id,action,classe ,inputs,submitCallback){
    $("#"+id).remove();
    return $("<form>")
        .attr("id",id)
        .attr("class",classe)
        .submit(submitCallback)
        .append(inputs,newHiddenInput("action",action));
}

////////////////////


////////// Edition //////////

function creerFormEdition(content){
    return newFormulaire("form-ecrire","ecriture","toHide",
        [
            newTextarea("text-ecrire","Écrivez ici",content),
            newButton("bouton-valider-ecrire","submit","Valider","ok"),
            newButton("bouton-annuler","button","Annuler", "remove",DisplayNode),
            newHiddenInput("id",id)
        ],
        RequestNewNode
    );
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

////////////////////


////////// Lien //////////

function creerFormLien(){
    return newFormulaire("form-choice","lien","toHide",
        [
            newInputGroup(
                [
                    newInput("choix","text","Choix"),
                    $("<span>").attr("class","input-group-addon"),
                    newInput("destination", "text", "ID de destination"),
                    newButtonGroup(
                        [
                            newButton("bouton-valider-choix","submit","Valider", "ok"),
                            newButton("bouton-annuler-choix","button","Annuler","remove")
                        ]
                    )
                ]
            ),
            newHiddenInput("id",id)
        ],
        RequestNewLink
    );
}

function RequestNewLink(){

    return false;
}

////////////////////


////////// Connexion //////////

function creerFormConnexion(){
    return newFormulaire("form-connexion","connexion","navbar-form navbar-right navbar-hide",
        [
            newInput("pseudo","text","Pseudo"),
            newInput("password","password","Mot de passe"),
            newButton("","submit","Se connecter","off"),
            newButton("","button","Retour","remove",retourNavbar)
        ],
        requestConnexion
    );
}

function retourNavbar(){
    hideNavForms(function(){
        $("#pas-connecte").fadeIn();
    });
}

function requestConnexion(){
    $.ajax({
        type: "POST",
        url: "ajax.php",
        data: $(this).serialize(),
        success: onConnexion,
        error: ajaxError
    });
}

function onConnexion(data){
    alert("todo");
}

/////////////////////


// Fonctions utilitaires //

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

function getId(){
    id = getURLVariable("id");
    if (!id) {
        id = "start";
        history.replaceState(null,null,location.href+"?id="+id);
    }
    RequestNode(id);
}

function ajaxError(resultat, statut, erreur){
    console.log(resultat);
    console.log(statut);
    console.log(erreur);
}

//////////////////////


//// Document ready ////

$(document).ready(function(){
    $(".toHide").hide();

    getId();

    requestSession();

    $("#btn-inscription").click(function(){
        $(".navbar-hide")
            .fadeOut()
            .promise()
            .done(function(){
                $("#form-inscription").fadeIn();
            })
    });

    $("#btn-connexion").click(function(){
        hideNavForms(function(){
            var form = creerFormConnexion();
            $("#navbar").prepend(form);
            form.fadeIn();
        })
    });

    $(".btn-retour").click(function(){
        retourNavbar();
    });

    $("#bouton-ecrire,#bouton-modifier").click(function(){
        HideAll(function(){
            var form = creerFormEdition(node.content);
            $("#main").prepend(form);
            form.fadeIn();
        })
    });

    $("#bouton-ajouter-choix").click(function(){
        var form = creerFormLien();
        $("#main-choices").prepend(form);
        form.fadeIn();

    });

});

/////////////////////


// Requêtes de démarrage //

function requestSession(){
    $.ajax({
        type: "POST",
        url: "ajax.php",
        data: {action: "session"},
        success: onSessionSuccess,
        error: ajaxError
    });
}

function onSessionSuccess(data){
    if(data.connecte){
        $("#connecte").fadeIn();
        $("#pseudo").html(data.pseudo);
    }
    else{
        $("#pas-connecte").fadeIn();
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

////////////////////


// Affichage //

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

function hideNavForms(callback){
    $(".navbar-hide")
        .fadeOut()
        .promise()
        .done(callback);
}

function HideAll(callback){
    $(".toHide")
        .fadeOut()
        .promise()
        .done(callback);
}

////////////////////