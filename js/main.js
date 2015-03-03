function newButton(id, type, text, icon,clickCallback){
    var icon = $("<span>")
        .attr("class", "glyphicon glyphicon-"+icon)
        .attr("aria-hidden", "true");
    var button = $('<button>')
        .attr("class", "btn btn-default")
        .attr("type", type)
        .attr("id", id)
        .click(clickCallback)
        .append(icon , " "+text);
    return button;
}

function newInput(id, type, name, placeholder){
    var input = $("<input>")
        .attr("class", "form-control")
        .attr("type", type)
        .attr("name",name)
        .attr("id", id)
        .attr("placeholder", placeholder);
    return input;
}

function newTextarea(id, placeholder, value){
    var input = $("<textarea>")
        .attr("class", "form-control")
        .attr("id", id)
        .attr("placeholder", placeholder)
        .val(value);
    return input;
}

function newHiddenInput(name,value){
    var input = $("<input>")
        .attr("type","hidden")
        .attr("name",name)
        .attr("value",value);
    return input;
}

function newInputGroup(inputs){
    var group = $("<div>")
        .attr("class","input-group")
        .append(inputs);
    return group;
}

function newButtonGroup(buttons){
    var group = $("<span>")
        .attr("class","input-group-btn")
        .append(buttons);
    return group;
}

function newFormulaire(id,inputs,submitCallback){
    $("#"+id).remove();
    var form = $("<form>")
        .attr("id",id)
        .attr("class","toHide")
        .submit(submitCallback)
        .append(inputs,newHiddenInput("id",id));
    return form;
}

function creerFormEdition(content){
    return newFormulaire("form-ecrire",
        [
            newTextarea("text-ecrire","Écrivez ici",content),
            newButton("bouton-valider-ecrire","submit","Valider","ok"),
            newButton("bouton-annuler","button","Annuler", "remove",DisplayNode)
        ],
        RequestNewNode
    );
}

function creerFormLien(){
    return newFormulaire("form-choice",
        [
            newInputGroup(
                [
                    newInput("","text","choix","Choix"),
                    $("<span>").attr("class","input-group-addon"),
                    newInput("","text","destination", "ID de destination"),
                    newButtonGroup(
                        [
                            newButton("bouton-valider-choix","submit","Valider", "ok"),
                            newButton("bouton-annuler-choix","button","Annuler","remove")
                        ]
                    )
                ]
            )
        ],
        RequestNewLink
    );
}

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
            /*
            $("#text-ecrire").val(node.content);
            $("#form-ecrire").fadeIn();
            */
            var form = creerFormEdition(node.content);
            $("#main").prepend(form);
            form.fadeIn();
        })
    });
    //$("#form-ecrire").submit(RequestNewNode);
    //$("#bouton-annuler").click(DisplayNode);

    $("#bouton-ajouter-choix").click(function(){
        //$("#form-choice").fadeIn();
        var form = creerFormLien();
        $("#main-choices").prepend(form);
        form.fadeIn();

    });
    //$("#form-ecrire").submit(RequestNewLink);

});

function RequestNewLink(){

    return false;
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