
////////// Edition //////////

function creerFormEdition(content){
    return newFormulaire("form-ecrire","ecriture","toHide",
        [
            newTextarea("text-ecrire","Écrivez ici",content),
            newButton("bouton-valider-ecrire","submit","Valider","btn-success","ok"),
            newButton("bouton-annuler","button","Annuler","btn-danger", "remove",DisplayNode),
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
                            newButton("bouton-valider-choix","submit","Valider","", "ok"),
                            newButton("bouton-annuler-choix","button","Annuler","","remove")
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


////////// Inscription //////////

function creerFormInscription(){
    return newFormulaire("form-inscription","inscription","navbar-form navbar-right navbar-hide",
        [
            newInput("pseudo","text","Pseudo"),
            newInput("password","password","Mot de passe"),
            newInput("confirmation","password","Confirmation"),
            newButton("","submit","S'inscrire","btn-success","plus"),
            newButton("","button","Retour","btn-danger","remove",retourNavbar)
        ],
        requestInscription
    )
}

function requestInscription(){
    $("#errors").html();
    $.ajax({
        type: "POST",
        url: "ajax.php",
        data: $(this).serialize(),
        success: onInscription,
        error: ajaxError
    });
    return false;
}

function onInscription(data){
    var errors = "";
    if(data.erreurPseudoUsed){
        errors += "Pseudo déjà utilisé. "
    }
    if(data.erreurAlphaNum){
        errors += "Le pseudo doit seulement contenir des caractères alphanumériques. "
    }
    if(data.erreurPseudoLength){
        errors += "Le pseudo doit contenir au moins 2 caractères. "
    }
    if(data.erreurPassLength){
        errors += "Le mot de passe doit contenir au moins 6 caractères. "
    }
    if(data.erreurConfirmation){
        errors += "La confirmation du mot de passe est incorrect."
    }
    $("#errors").html(errors);
    if(data.connecte){
        hideNavForms(function(){
            $("#pseudo").html(data.pseudo);
            $("#connecte").fadeIn();
        });
    }
}

///////////////////


////////// Connexion //////////

function creerFormConnexion(){
    return newFormulaire("form-connexion","connexion","navbar-form navbar-right navbar-hide",
        [
            newInput("pseudo","text","Pseudo"),
            newInput("password","password","Mot de passe"),
            newButton("","submit","Se connecter","btn-success","off"),
            newButton("","button","Retour","btn-danger","remove",retourNavbar)
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
    return false;
}

function onConnexion(data){
    if(data.connecte){
        hideNavForms(function(){
            $("#pseudo").html(data.pseudo);
            $("#connecte").fadeIn();
        });
    }
    else{
        $("#errors").html("Pseudo ou mot de passe incorrect.");
    }
}

/////////////////////


////////// Deconnexion //////////

function requestDeconnexion(){
    $.ajax({
        type: "POST",
        url: "ajax.php",
        data: {action: "deconnexion"},
        success: onDeconnexion,
        error: ajaxError
    });
}

function onDeconnexion(){
    hideNavForms(function(){
        $("#pas-connecte").fadeIn();
    })
}

////////////////////


//// Document ready ////

$(document).ready(function(){
    $(".toHide").hide();

    getId();

    requestSession();

    $("#btn-inscription").click(function(){
        hideNavForms(function(){
            //$("#form-inscription").fadeIn();
            var form = creerFormInscription();
            $("#navbar").prepend(form);
            form.fadeIn();
        })
    });

    $("#btn-connexion").click(function(){
        hideNavForms(function(){
            var form = creerFormConnexion();
            $("#navbar").prepend(form);
            form.fadeIn();
        })
    });

    $("#btn-deconnexion").click(function(){
        requestDeconnexion();
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
        $("#pseudo").html(data.pseudo);
        $("#connecte").fadeIn();
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


// Générateurs de formulaires //

function newButton(id, type, text,classe, icon, clickCallback){
    if(!!icon){
        var glyph = $("<span>")
            .attr("class", "glyphicon glyphicon-"+icon)
            .attr("aria-hidden", "true");
    }
    else{
        var glyph = "";
    }

    if(!classe){
        classe = "btn-default"
    }

    return $('<button>')
        .attr("class", "btn "+classe)
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