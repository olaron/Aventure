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

function creerFormSupression()
{
    return newFormulaire("form-suppression","pageSuppression","toHide",
        [
            newHiddenInput("id",page.name),
            newButton("","submit","Supprimer","btn-danger","remove")
        ],
        requestSuppression
    )
}

function requestSuppression()
{
    ajaxRequest(onSuppression,$(this).serialize());
    return false;
}

function onSuppression(data)
{
    displayPage();
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
}

function creerFormLien(text,destination,id,auteur)
{
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

function deleteLink(id)
{
    console.log(id);
    ajaxRequest(onNewLink,{action: "deletelink", id_link: id});
    return false;
}

function backFormLien()
{
    $("#form-lien").slideUp();
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

function onInscription(data)
{
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
    hideNavForms(function(){
        $("#pas-connecte").fadeIn();
    });
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
    $(".toHide").hide();

    getId();

    requestSession();

    $("#btn-deconnexion").click(requestDeconnexion);
    $("#form-connexion").submit(requestConnexion);
    $("#form-edition").submit(requestNewPage);
    $("#form-lien").submit(requestNewLink);
});

$( window ).on( "navigate", function( event, data )
{
    event.preventDefault();
    console.log( data );
    console.log( event );
    getId();
});


/////////////////////

function prependIn(id,form){
    $(id).prepend(form);
    form.slideDown();
}

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
    if(page.erreurNotFound){
        $("#content").html("Cette partie de l'histoire n'a pas été encore écrite.");
        if(!!pseudo){
            $("#bouton-ecrire").fadeIn();
        }
    }
    else{
        $("#content").html(page.content.replace(/\n/g, "<br>"));
        $("#textarea").val(page.content);
        $("#pageName")
            .fadeIn()
            .html("Page: "+page.name);
        $("#author")
            .fadeIn()
            .html("Auteur: "+page.author);
    }

    $(".hidden-pageid").val(page.name);

    if(page.author === pseudo){
        $("#bouton-ecrire").fadeIn();
    }

    if(!!pseudo){
        $("#btn-options").fadeIn();
        $("#pseudo").html("Connecté en tant que " + pseudo);
        $("#btn-connection")
            .attr("href","#")
            .on("click",requestDeconnexion);
    }
    else{
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
                        displayFormLien(link.text,link.destination,link.id,link.author);
                    }
                )
        )
    }

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

function goToPage(page)
{
    var url = location.href.split("?")[0];
    history.pushState(null,null,url+"?id="+page);
    requestPage(page);
}


function hideNavForms(callback)
{
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

function hideAll(callback)
{
    $(".toHide")
        .fadeOut()
        .promise()
        .done(callback);
}

////////////////////


// Fonctions utilitaires //

function getURLVariable(variable)
{
    var vars = location.search.substring(1).split("&");
    for (var i=0; i<vars.length; i++){
        var pair = vars[i].split("=");
        if(pair[0] == variable){
            return pair[1];
        }
    }
    return false;
}

function getId()
{
    var id = getURLVariable("id");
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
    console.log(resultat);
    console.log(statut);
    console.log(erreur.message);
    console.log(erreur.stack);
}

//////////////////////


// Générateurs de formulaires //

function newButton(id, type, text,classe, icon, clickCallback)
{
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
        .attr("class", "ui-btn "+classe)
        .attr("type", type)
        .attr("id", id)
        .click(clickCallback)
        .append(glyph , " "+text);
}

function newInput(name, type, placeholder)
{
    return $("<input>")
        .attr("class", "form-control")
        .attr("type", type)
        .attr("name",name)
        .attr("placeholder", placeholder);
}

function newHiddenInput(name,value)
{
    return $("<input>")
        .attr("type","hidden")
        .attr("name",name)
        .attr("value",value);
}

function newButtonGroup(buttons)
{
    return $("<span>")
        .attr("class","btn-group")
        .append(buttons);
}

function newFormulaire(id,action,classe ,inputs,submitCallback)
{
    $("#"+id).remove();
    return $("<form>")
        .attr("id",id)
        .attr("class",classe)
        .submit(submitCallback)
        .append(inputs,newHiddenInput("action",action));
}

////////////////////