
// TODO
//
// faire apparaitre un gif de chargement pendant les requetes ajax
// afficher l'auteur des liens et colorrer en fonction
//
// Corriger le double fadeIn/fadeOut
// ->new $.Deffered(); .resolve(); $.when(...).done(function(){});
//
// refactoring: node->page / id->pageName / action,choice->link / choix->texte
// corriger les profils des fonctions de génération de formulaire
// Trouver un nom de projet

/*
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
*/

////////// Edition //////////

function creerFormEdition(content){
    return newFormulaire("form-ecrire","edition","toHide",
        [
            newTextarea("content","Écrivez ici",content),
            newButton("bouton-valider-ecrire","submit","Valider","btn-success","ok"),
            newButton("bouton-annuler","button","Annuler","btn-danger", "remove",displayPage),
            newHiddenInput("id",page.name)
        ],
        requestNewPage
    );
}

function requestNewPage(){
    var data = $(this).serialize().replace(/\'/g,'\\\'');
    $(this).find(":input").prop("disabled", true);
    hideAll(function(){
        $(this).find(":input").removeAttr("disabled");
    });
    ajaxRequest(onNewPageSuccess,data);
    return false;
}

function onNewPageSuccess(data){
    if(data.erreurLogin){
        alert("Vous devez être connecté pour effectuer cette action.");
    }
    else if(data.erreurAuteur){
        alert("Vous n'avez pas le droit d'effectuer cette action.");
    }
    else{
        if(!!data.name){
            requestPage(data.name);
        }
        else{
            getId();
        }
    }
}

function creerFormSupression(){
    return newFormulaire("form-suppression","pageSuppression","toHide",
        [
            newHiddenInput("id",page.name),
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
    displayPage();
}

////////////////////


////////// Lien //////////

function creerFormLien(text,destination,id,auteur){

    var inputs = [
        newInput("choix","text","Texte affiché").val(text),
        newInput("destination", "text", "Page de destination").val(destination),
        newButton("bouton-valider-choix","submit","Valider","", "ok"),
        newButton("bouton-annuler-choix","button","Annuler","","remove",backFormLien),
        newHiddenInput("id",page.name),
        newHiddenInput("id_link",id)
    ];

    if(auteur == pseudo){
        inputs.push(newButton("","button","Supprimer","btn-danger","remove")
                    .click(id,function(e){deleteLink(e.data)})
        )
    }

    return newFormulaire("form-lien","link","toHide",inputs, requestNewLink);
}

function deleteLink(id){
    console.log(id);
    ajaxRequest(onNewLink,{action: "deletelink", id_link: id});
    return false;
}

function backFormLien(){
    $("#form-lien").slideUp();
}

function requestNewLink(){
    var data = $(this).serialize().replace(/\'/g,'\\\'');
    $(this).find(":input").prop("disabled", true);
    $(this).slideUp(function(){
        $(this).find(":input").removeAttr("disabled");
    });
    ajaxRequest(onNewLink,data);
    return false;
}

function onNewLink(data){
    if(!(data.erreurLinkID || data.erreurLinkText || data.erreurLinkLength)){
        requestPage(page.name);
    }
    else{
        $("#form-lien").slideDown();
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

function requestInscription()
{
    ajaxRequest(onInscription,$(this).serialize());
    return false;
}

function onInscription(data){

    if(data.connecte){
        hideNavForms(function(){
            $("#pseudo").html(data.pseudo);
            $("#connecte").fadeIn();
        });
        displayPage();
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
        window.pseudo = data.pseudo;
        displayPage();
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
    });
    window.pseudo = "";
    displayPage();
}

////////////////////


//// Document ready ////

$(document).ready(function(){
    window.pseudo = "";
    window.page = {};
    $(".toHide").hide();

    getId();

    requestSession();

    $("#btn-inscription").click(function(){
        hideNavForms(function(){
            prependIn("#navbar",creerFormInscription());
        })
    });

    $("#btn-connexion").click(function(){
        hideNavForms(function(){
            prependIn("#navbar",creerFormConnexion());
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
            prependIn("#main",creerFormEdition(page.content));
        })
    });

    $("#bouton-ajouter-choix").click(function(){
        prependIn("#choices",creerFormLien());
    });

});


$(window).on('popstate', function() {
    getId();
});

/////////////////////

function prependIn(id,form){
    $(id).prepend(form);
    form.slideDown();
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
        displayPage();
    }
    else{
        $("#pas-connecte").fadeIn();
    }
}

function requestPage(page){
    $(".btn-lien").prop("disabled", true);
    ajaxRequest(onRequestPageSuccess,{action:"getpage",id: page});
}

function onRequestPageSuccess(page){
    window.page = page;
    displayPage();
}

////////////////////


// Affichage //

function displayPage(){
    hideAll(function(){
        if(page.erreurNotFound){
            $("#content").html("Cette partie de l'histoire n'a pas été encore écrite.");
            if(!!pseudo){
                $("#bouton-ecrire").fadeIn();
            }
        }
        else{
            $("#content").html(page.content.replace(/\n/g, "<br>"));
            $("#pageName")
                .fadeIn()
                .html("Page: "+page.name);
            $("#author")
                .fadeIn()
                .html("Auteur: "+page.author);
        }

        if(page.author === pseudo){
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
        for(var i in page.links){
            var link = page.links[i];
            $("#choices")
                .append(
                    newLink(link)
                );
        }

    });
}

function newLink(link){

    var bouton = [
        newButton("","button",link.text,"btn-lien btn-default")
            .click(link.destination,function(e){goToPage(e.data)})
    ];

    if(link.author == pseudo){
        bouton.push(
            newButton("","button","","btn-lien btn-default","pencil",function(){
                prependIn("#choices",creerFormLien(link.text,link.destination,link.id,link.author));
            })
        )
    }

    return newButtonGroup(bouton)
}

function goToPage(page){
    var url = location.href.split("?")[0];
    history.pushState(null,null,url+"?id="+page);
    requestPage(page);
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
    requestPage(id);
}

function ajaxRequest(successCallback,data){
    $("#errors")
        .slideUp()
        .html();
    $.ajax({
        type: "POST",
        url: "ajax.php",
        data: data,
        success: function(data) {
            ajaxProblems(data);
            successCallback(data);
        },
        error: ajaxError
    });
}

function ajaxProblems(data){
    if(data.erreurLogin){
        alert("Vous devez être connecté pour effectuer cette action.");
    }
    if(data.erreurAuteur){
        alert("Vous n'avez pas le droit d'effectuer cette action.");
    }

    var errors = "";
    if(data.erreurLinkID){
        errors += "La page de destination ne doit pas faire plus de 32 caractères et doit contenir seulement des caractères alphanumériques. ";
    }
    if(data.erreurLinkText){
        errors += "Le texte du lien ne doit pas faire plus de 64 caractères. ";
    }
    if(data.erreurLinkLength){
        errors += "Tous les champs doivent être remplis. ";
    }
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
    $("#errors")
        .html(errors)
        .slideDown();
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
        .attr("class","btn-group")
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