////////// Edition //////////

function requestNewPage()
{
    var data = $(this).serialize().replace(/\'/g,'\\\'');
    $(this)
        .find(":input")
        .prop("disabled", true)
        .fadeOut(function(){
            $("#form-edition").find(":input").removeAttr("disabled");
        });
    ajaxRequest(onNewPageSuccess,data);
    return false;
}

function onNewPageSuccess(data)
{
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

    $("#form-edition")
        .find(":input")
        .fadeIn();
}

function requestSuppression(pageName)
{
    ajaxRequest(onSuppression,{action: "pageSuppression", id: pageName});
    return false;
}

function onSuppression(data)
{
    requestPage(page.name);
}

////////////////////


////////// Lien //////////

function displayFormLien(text,destination,id)
{
    $.mobile.changePage("#lien");
    $("#form-lien-choix").val(text);
    $("#form-lien-destination").val(destination);
    $("#form-lien-id").val(id);
    $("#form-lien-page").val(page.name);
    $("#supprimer-lien").click(function()
    {
        deleteLink(id);
    });
}

function deleteLink(id)
{
    ajaxRequest(onNewLink,{action: "deletelink", id_link: id});
    return false;
}

function requestNewLink()
{
    var data = $(this).serialize().replace(/\'/g,'\\\'');
    $(this).find(":input").prop("disabled", true);
    $(this).fadeOut(function(){
        $(this).find(":input").removeAttr("disabled");
    });
    ajaxRequest(onNewLink,data);
    return false;
}

function onNewLink(data)
{
    if(!(data.erreurLinkID || data.erreurLinkText || data.erreurLinkLength)){
        requestPage(page.name);
    }
    $("#form-lien").fadeIn();
}

////////////////////


////////// Inscription //////////

function requestInscription()
{
    ajaxRequest(onInscription,$(this).serialize());
    return false;
}

function onInscription(data)
{
    if(data.connecte){
        displayConnecte(data.pseudo);
        displayPage();
    }
}

///////////////////


////////// Connexion //////////

function requestConnexion()
{
    ajaxRequest(onConnexion,$(this).serialize());
    return false;
}

function onConnexion(data)
{
    if(data.connecte){
        displayConnecte(data.pseudo);
    }
    else{
        alert("Pseudo ou mot de passe incorrect.");
    }
}

function displayConnecte(pseudo)
{
    window.pseudo = pseudo;
    displayPage();
}

/////////////////////


////////// Deconnexion //////////

function requestDeconnexion()
{
    ajaxRequest(onDeconnexion,{action: "deconnexion"});
}

function onDeconnexion()
{
    window.pseudo = "";
    displayPage();
}

////////////////////


//// Document ready ////

$(document).ready(function()
{
    $.mobile.defaultPageTransition = 'slide';
    $.mobile.hashListeningEnabled = false;
    window.pseudo = "";
    window.page = {};
    $("#bouton-ecrire, #bouton-supprimer, #btn-options").hide();

    getId();

    requestSession();

    $("#btn-deconnexion").click(requestDeconnexion);
    $("#form-connexion").submit(requestConnexion);
    $("#form-edition").submit(requestNewPage);
    $("#form-lien").submit(requestNewLink);
    $("#form-inscription").submit(requestInscription);

});

$( window ).on( "navigate", function( event, data )
{
    event.preventDefault();
    $("#main-content").fadeOut(function()
        {
            getId();
        }
    );

});


/////////////////////


// Requêtes de démarrage //

function requestSession()
{
    ajaxRequest(onSessionSuccess,{action: "session"});
}

function onSessionSuccess(data)
{
    if(data.connecte){
        displayConnecte(data.pseudo);
    }
}

function requestPage(page)
{
    $(".btn-lien").prop("disabled", true);
    ajaxRequest(onRequestPageSuccess,{action:"getpage",id: page});
}

function onRequestPageSuccess(page)
{
    window.page = page;
    displayPage();
}

////////////////////


// Affichage //

function displayPage()
{
    $.mobile.changePage("#main");
    $("#main-content").fadeIn();
    if(page.erreurNotFound){
        $("#content").html("Cette partie de l'histoire n'a pas été encore écrite.");
        $("#textarea").val("");
        $("#pageName").empty();
        $("#author").empty();
        if(!!pseudo){
            $("#bouton-ecrire").fadeIn();
        }
    }
    else{
        $("#content").html(page.content.replace(/\n/g, "<br>"));
        $("#textarea").val(page.content);
        $("#pageName").html("Page: "+page.name);
        $("#author").html("Auteur: "+page.author);
    }

    $(".hidden-pageid").val(page.name);

    if(!page.author || page.author === pseudo){
        $("#bouton-ecrire").fadeIn();
    }
    else{
        $("#bouton-ecrire").fadeOut();
    }

    if(page.author === pseudo){
        $("#bouton-supprimer")
            .fadeIn()
            .click(function(){
                requestSuppression(page.name);
            });
    }
    else{
        $("#bouton-supprimer").fadeOut();
    }

    if(!!pseudo){
        $("#btn-options").fadeIn();
        $("#pseudo").html("Connecté en tant que " + pseudo);
        $("#btn-connection")
            .attr("href","#")
            .on("click",requestDeconnexion);
    }
    else{
        $("#btn-options").fadeOut();
        $("#pseudo").empty();
        $("#btn-connection")
            .attr("href","#connection")
            .off("click");
    }

    $("#links").empty();

    for(var i in page.links){
        var link = page.links[i];
        $("#links")
            .append(
                newLink(link)
            );
    }
}

function newLink(link)
{
    var bouton = [
        $('<button>')
            .attr("class","ui-btn ui-corner-all ui-first-child")
            .text(link.text)
            .click(link.destination, function(e)
                {
                    goToPage(e.data);
                }
            )
    ];

    if(link.author == window.pseudo){
        bouton.push(
            $('<button>')
                .attr("class","ui-btn ui-corner-all ui-icon-edit ui-shadow ui-last-child ui-btn-icon-notext")
                .attr("data-iconpos","notext")
                .text("\"Modifier\"")
                .click(function()
                    {
                        displayFormLien(link.text,link.destination,link.id);
                    }
                )
        );

        var groupe = $("<div>")
            .attr("data-role","controlgroup")
            .attr("data-type","horizontal")
            .attr("class","ui-controlgroup ui-controlgroup-horizontal ui-corner-all ")
            .append(
            $("<div>")
                .attr("class","ui-controlgroup-controls")
                .append(bouton)
        );

        return newButtonGroup(groupe)
    }

    else{
        return bouton;
    }

}

function goToPage(page)
{
    var url = location.href.split("?")[0];
    history.pushState(null,null,url+"?id="+page);
    $("#main-content").fadeOut(function()
    {
        requestPage(page);
    });
}


////////////////////


// Fonctions utilitaires //

function getId()
{
    var id = location.href.split("?id=")[1];
    if (!id) {
        if(!!page.name){
            id = page.name;
        }
        else{
            id = "start";
            history.replaceState(null,null,location.href+"?id="+id);
        }

    }
    requestPage(id);
}

function ajaxRequest(successCallback,data)
{
    $("#errors")
        .slideUp()
        .html();
    $.ajax({
        type: "POST",
        url: "ajax.php",
        data: data,
        success: function(data)
        {
            ajaxProblems(data);
            successCallback(data);
        },
        error: ajaxError
    });
}

function ajaxProblems(data)
{
    var errors = "";
    if(data.erreurLogin){
        errors += "Vous devez être connecté pour effectuer cette action." ;
    }
    if(data.erreurAuteur){
        errors += "Vous n'avez pas le droit d'effectuer cette action. ";
    }
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
    if(!!errors)
        alert(errors);
}

function ajaxError(resultat, statut, erreur)
{
    alert("Une erreur AJAX est survenue.");
    /*
    console.log(resultat.responseText);
    console.log(resultat);
    console.log(statut);
    console.log(erreur.message);
    console.log(erreur.stack);
    */
}

//////////////////////


// Générateurs de formulaires //


function newButtonGroup(buttons)
{
    return $("<span>")
        .attr("class","btn-group")
        .append(buttons);
}


////////////////////