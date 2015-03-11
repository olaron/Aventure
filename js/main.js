//qcm .css() .html() .empty() . attr() .text()
// bind() blur() change() click() hover() keydown() keypress() keyup()
// off() on() one()

// TODO
// Suppression des pages
// Modification / suppression des liens
// Bouton retour pour les liens
//
// griser les formulaires sur les submits
// Corriger le double fadeIn/fadeOut
// ->new $.Deffered(); .resolve(); $.when(...).done(function(){});
//
// refactoring: node->page / id->pageName / action,choice->link
// corriger les profils des fonctions de génération de formulaire
// Trouver un nom de projet

////////// Edition //////////

function creerFormEdition(content){
    return newFormulaire("form-ecrire","edition","toHide",
        [
            newTextarea("content","Écrivez ici",content),
            newButton("bouton-valider-ecrire","submit","Valider","btn-success","ok"),
            newButton("bouton-annuler","button","Annuler","btn-danger", "remove",displayNode),
            newHiddenInput("id",node.name)
        ],
        requestNewNode
    );
}

function requestNewNode(){
    var data = $(this).serialize().replace(/\'/g,'\\\'');
    //console.log(data);
    $(this).find(":input").prop("disabled", true);
    hideAll(function(){
        $(this).find(":input").removeAttr("disabled");
    });
    ajaxRequest(onNewNodeSuccess,data);
    return false;
}

function onNewNodeSuccess(data){
    //console.log(data);
    if(data.erreurLogin){
        alert("Vous devez être connecté pour effectuer cette action.");
    }
    else if(data.erreurAuteur){
        alert("Vous n'avez pas le droit d'effectuer cette action.");
        //requestNode();
    }
    else{
        //alert("Erreur lors de la requette d'ajout.");
        //displayNode();
        requestNode(node.name);
    }
}

function creerFormSupression(){
    return newFormulaire("form-suppression","pageSuppression","toHide",
        [
            newHiddenInput("id",node.name),
            newButton("","submit","Supprimer","btn-danger","remove")
        ],
        requestSuppression
    )
}

function requestSuppression(){
    ajaxRequest(onSuppression,$(this).serialize());
    return false;
}

function onSuppression(data){
    displayNode();
}

////////////////////


////////// Lien //////////

function creerFormLien(){
    return newFormulaire("form-choice","newlink","toHide",
        [
            newInput("choix","text","Choix"),
            newInput("destination", "text", "ID de destination"),
            newButton("bouton-valider-choix","submit","Valider","", "ok"),
            newButton("bouton-annuler-choix","button","Annuler","","remove"),
            newHiddenInput("id",node.name)
        ],
        requestNewLink
    );
}

function requestNewLink(){
    ajaxRequest(onNewLink,$(this).serialize().replace(/\'/g,'\\\''));
    return false;
}

function onNewLink(data){
    if(data.erreurLogin){
        alert("Vous devez être connecté pour effectuer cette action.");
    }
    else{
        displayNode();
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
    window.pseudo = "";
    window.node = {};
    $(".toHide").hide();

    getId();

    requestSession();

    $("#btn-inscription").click(function(){
        hideNavForms(function(){
            //$("#form-inscription").fadeIn();
            var form = creerFormInscription();
            $("#navbar").prepend(form);
            form.fadeIn();
            prependIn("#navbar",creerFormEdition(node.content));
        })
    });

    $("#btn-connexion").click(function(){
        hideNavForms(function(){
            var form = creerFormConnexion();
            $("#navbar").prepend(form);
            form.fadeIn();
            prependIn("#main",creerFormEdition(node.content));
        })
    });

    $("#btn-deconnexion").click(function(){
        requestDeconnexion();
    });

    $(".btn-retour").click(function(){
        retourNavbar();
    });

    $("#bouton-ecrire,#bouton-modifier").click(function(){
        hideAll(function(){
            /*
            var form = creerFormEdition(node.content);
            $("#main").prepend(form);
            form.fadeIn();
            */
            prependIn("#main",creerFormEdition(node.content));
        })
    });

    $("#bouton-ajouter-choix").click(function(){
        prependIn("#choices",creerFormLien());
        /*
        var form = creerFormLien();
        $("#choices").prepend(form);
        form.fadeIn();
        */
    });

});


$(window).on('popstate', function() {
    getId();
});

/////////////////////

function prependIn(id,form){
    $(id).prepend(form);
    form.fadeIn();
}

// Requêtes de démarrage //

function requestSession(){
    ajaxRequest(onSessionSuccess,{action: "session"});
}

function onSessionSuccess(data){
    if(data.connecte){
        window.pseudo = data.pseudo;
        $("#pseudo").html(data.pseudo);
        $("#connecte").fadeIn();
        displayNode();
    }
    else{
        $("#pas-connecte").fadeIn();
    }
}

function requestNode(page){
    ajaxRequest(onRequestNodeSuccess,{action:"getpage",id: page});
}

function onRequestNodeSuccess(node){
    if(node.success){
        window.node = node;
        displayNode();
    }
    else{
        alert("Erreur lors de la requette d'acquisition.");
    }

}

////////////////////


// Affichage //

function displayNode(){
    hideAll(function(){
        if(node.erreurNotFound){
            $("#content").html("Cette partie de l'histoire n'a pas été encore écrite.");
            if(!!pseudo){
                $("#bouton-ecrire").fadeIn();
            }
        }
        else{
            $("#content").html(node.content.replace(/\n/g, "<br>"));
            $("#pageName")
                .fadeIn()
                .html("Page: "+node.name);
            $("#author")
                .fadeIn()
                .html("Auteur: "+node.author);
        }

        if(node.author === pseudo){
            $("#bouton-modifier").fadeIn();
            prependIn("#options",creerFormSupression());
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
    //console.log(url);
    history.pushState(null,null,url+"?id="+page);
    requestNode(page);
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

function hideAll(callback){
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
    var id = getURLVariable("id");
    if (!id) {
        id = "start";
        history.replaceState(null,null,location.href+"?id="+id);
    }
    requestNode(id);
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
    alert("Une erreur AJAX est survenue.");
    console.log(resultat);
    console.log(statut);
    console.log(erreur.message);
    console.log(erreur.stack);
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