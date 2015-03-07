
////////// Edition //////////

function creerFormEdition(content){
    return newFormulaire("form-ecrire","edition","toHide",
        [
            newTextarea("content","Écrivez ici",content),
            newButton("bouton-valider-ecrire","submit","Valider","btn-success","ok"),
            newButton("bouton-annuler","button","Annuler","btn-danger", "remove",DisplayNode),
            newHiddenInput("id",id)
        ],
        RequestNewNode
    );
}

function RequestNewNode(){
    //var content = $("#text-ecrire").val();
    var data = $(this).serialize();
    $(this).find(":input").prop("disabled", true);
    HideAll(function(){
        $(this).find(":input").removeAttr("disabled");
    });
    /*
    $.ajax({
        type: "POST",
        url: "newNode.php",
        data: {user: "Master", id: id, content: content}, //pas sécurisé
        success: OnNewNodeSuccess,
        error: function(){console.log("Error in RequestNewNode()")}
    });
    */
    ajaxRequest(onNewNodeSuccess,data);
    return false;
}

function onNewNodeSuccess(data){
    if(data.erreurLogin){
        alert("Vous devez être connecté pour effectuer cette action.");
    }
    else if(!data.erreurAuteur){
        alert("Vous n'avez pas le droit d'effectuer cette action.");
        //RequestNode();
    }
    else{
        alert("Erreur lors de la requette d'ajout.");
        DisplayNode();
    }
}

////////////////////


////////// Lien //////////

function creerFormLien(){
    return newFormulaire("form-choice","newlink","toHide",
        [
            newInput("choix","text","Choix"),
            newInput("destination", "text", "ID de destination"),
            newButtonGroup(
                [
                    newButton("bouton-valider-choix","submit","Valider","", "ok"),
                    newButton("bouton-annuler-choix","button","Annuler","","remove")
                ]
            ),
            newHiddenInput("id",id)
        ],
        RequestNewLink
    );
}

function RequestNewLink(){
    ajaxRequest(onNewLink,$(this).serialize());
    return false;
}

function onNewLink(data){
    if(data.erreurLogin){
        alert("Vous devez être connecté pour effectuer cette action.");
    }
    else{
        DisplayNode();
    }

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
    /*
    $.ajax({
        type: "POST",
        url: "ajax.php",
        data: $(this).serialize(),
        success: onInscription,
        error: ajaxError
    });
    */
    ajaxRequest(onInscription,$(this).serialize());
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
    ajaxRequest(onConnexion,$(this).serialize());
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
    ajaxRequest(onDeconnexion,{action: "deconnexion"});
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
        $("#choices").prepend(form);
        form.fadeIn();
    });

});

/////////////////////


// Requêtes de démarrage //

function requestSession(){
    ajaxRequest(onSessionSuccess,{action: "session"});
}

function onSessionSuccess(data){
    if(data.connecte){
        window.pseudo = data.pseudo;
        $("#pseudo").html(data.pseudo);
        $("#connecte").fadeIn();
        DisplayNode();
    }
    else{
        $("#pas-connecte").fadeIn();
    }
}

function RequestNode(page){
    ajaxRequest(OnRequestNodeSuccess,{action:"getpage",id:page});
    /*
    $.ajax({
        type: "POST",
        url: "getNode.php",
        data: {id: id},
        success: OnRequestNodeSuccess,
        error: function(){console.log("Error in RequestNode()")}
    })
    */
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
        if(node.erreurNotFound){
            $("#content").html("Cette partie de l'histoire n'a pas été encore écrite.");
            //if utilisateur connecté
            $("#bouton-ecrire").fadeIn();

        }
        else{
            $("#content").html(node.content.replace(/\n/g, "<br>"))
        }

        if(node.author === pseudo){
            $("#bouton-modifier").fadeIn();
        }

        $("#content").fadeIn();

        if(!!pseudo){
            $("#bouton-ajouter-choix").fadeIn();
        }

        $("#choices")
            .fadeIn()
            .html("");
        for(var i in node.links){
            var link = node.links[i];
            $("#choices").append(newButton("","button",link.action,"","",function(){
                goToPage(link.leadTo);
            }))
        }

    });
}

function goToPage(page){
    var url = location.href.split("?")[0];
    console.log(url);
    history.pushState(null,null,url+"?id="+page);
    RequestNode(page);
}

function hideNavForms(callback){
    $(".navbar-hide")
        .fadeOut()
        .promise()
        .done(callback);
    $("#errors").slideUp(function(){
        $("#errors")
            .slideDown()
            .html("");

    })
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

function ajaxRequest(successCallback,data){
    $.ajax({
        type: "POST",
        url: "ajax.php",
        data: data,
        success: successCallback,
        error: ajaxError
    });
}

function ajaxError(resultat, statut, erreur){
    console.log(resultat);
    console.log(statut);
    console.log(erreur);
}

//////////////////////


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

function newTextarea(name, placeholder, value){
    return $("<textarea>")
        .attr("class", "form-control")
        .attr("name", name)
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