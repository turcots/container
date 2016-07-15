function Contacts(){
	this.contactArray = [];
	this.table = null;
}

Contacts.prototype.init = function () {
	this.bind();
	this.event();
	this.chargerFormulaire();
};

Contacts.prototype.bind = function () {
    this.body = $("body");

	this.monDatatable = $("#monDatatable");
	this.prenom = $("#prenom");
	this.nom = $("#nom");
	this.telephone = $("#telephone");
	this.courriel = $("#courriel");

    this.boiteModifiercontact = $("#boiteModifierContact");
	this.contactArrayIndex = $("#contactArrayIndex");
	this.modifierId = $("#modifierId");
	this.modifierPrenom = $("#modifierPrenom");
	this.modifierNom = $("#modifierNom");
	this.modifierTelephone = $("#modifierTelephone");
    this.modifierCourriel = $("#modifierCourriel");

    this.btnAjouter = $("#btnAjouter");
    this.btnReset = $("#btnReset");
};

Contacts.prototype.event = function () {
	var me = this;

	this.btnAjouter.click(function () {
		me.validerAjout(function () {
			me.ajouterContact();
		});
	});

	this.btnReset.click(function () {
		var ok = confirm("Les donn\351es seront supprim\351es...");
		if (ok) {
			localStorage.removeItem("contactArray");
			me.chargerFormulaire();
		}
	});

	$("#monDatatable tbody").on('click', 'a.remove', function (e) {
		var tr = $(this).closest("tr");
		var id = tr.children("td").first()[0].innerText;
		me.supprimerContact(id);
	});

	$("#monDatatable tbody").on('click', 'td', function (e) {
		var contact = me.obtenirInformationsDuContactParRangee($(this).closest("tr").children("td"));
		me.modifierContact(contact);
	});
};

/*Initialisations*/
Contacts.prototype.initialiserDatatable = function () {
	if (this.table !== null) this.table.destroy();

	this.table = this.monDatatable.DataTable({
		data: this.contactArray,
		columnDefs: [
			{ targets: [0], class: "textNumeric displayNone", sortable: false, width: 20 },
			{ targets: [1, 2], class: "textCursive", width: 240 },
			{ targets: [3], class: "textNumeric", sortable: false, width: 140 },
			{ targets: [4], class: "textCursive" },
			{ targets: [5], data: null, defaultContent: '<a href="#" class="remove textCursive texteRouge decorationNone">X</a>', sortable: false, width: 30 }
		]
	});
};

Contacts.prototype.initialiserBoiteModifiercontact = function () {
    var me = this;
    this.boiteModifiercontact.dialog(
        {
            title: "Modifier le contact",
            modal: true,
            autoOpen: false,
            resizable: false,
            hide: "slide",
            show : "slide",
            width: 400,
            buttons: {
                "Enregistrer": function () { me.validerModification(function () { me.enregistrerModification(); }); },
                "Annuler": function () { me.nettoyerFormulaire(); $(this).dialog("close"); }
            },
            open: function (event, ui) {
                $(".ui-widget-overlay").css({
                    opacity: 0.8,
                    filter: "Alpha(Opacity=100)",
                    backgroundColor: "#000000"
                });
            }
        }
    );    
};

Contacts.prototype.initialiserContactArray = function () {
	this.contactArray = (typeof (localStorage["contactArray"]) === "undefined" ? [] : JSON.parse(localStorage.getItem("contactArray")));
};

Contacts.prototype.initialiserMask = function () {
    this.telephone.mask("(000) 000-0000");
    this.modifierTelephone.mask("(000) 000-0000");
};

/*Actions*/
Contacts.prototype.sauvegarderContactArray = function () {
	localStorage.setItem("contactArray", JSON.stringify(this.contactArray));
};

Contacts.prototype.ajouterContact = function () {
	this.contactArray.push([
		this.id = Date.now(), //the number of milliseconds since midnight Jan 1, 1970
		this.nom.val(),
		this.prenom.val(),
		this.telephone.val(),
		this.courriel.val()
	]);
	this.nettoyerFormulaire();
	this.sauvegarderContactArray();
	this.initialiserDatatable();
    this.prenom.select();
};

Contacts.prototype.supprimerContact = function (id) {
	var index = this.obtenirSelectedIndexByContactId(id);
	if (index > -1) {
		this.contactArray.splice(index, 1);
		this.sauvegarderContactArray();
		this.chargerFormulaire();
	}
};

Contacts.prototype.modifierContact = function (contact) {
    var index = this.obtenirSelectedIndexByContactId(contact.id);
    contact.index = index;
	if (index > -1) {
	    this.initialiserBoiteModifiercontact();
	    this.chargerDialogModifierContact(contact);
	    this.boiteModifiercontact.dialog("open");
	    this.modifierPrenom.select();
	}
};

Contacts.prototype.modifierContactArray = function () {
    this.contactArray[this.contactArrayIndex.val()] = [
        this.modifierId.val(),
        this.modifierNom.val(),
        this.modifierPrenom.val(),
	    this.modifierTelephone.val(),
        this.modifierCourriel.val(),
    ];
};

Contacts.prototype.enregistrerModification = function () {
    this.modifierContactArray();
    this.sauvegarderContactArray();
    this.boiteModifiercontact.dialog("close");
	this.chargerFormulaire();
};

/*Validadtions*/
Contacts.prototype.validerAjout = function (callback) {
	if (this.prenom.val() !== "" && this.nom.val() !== "" && this.telephone.val() !== "") {
		if ($.isFunction(callback)) callback();
	} else {
		this.telephone.val() === "" ? this.champErreur(this.telephone, true) : this.champErreur(this.telephone, false);
		this.nom.val() === "" ? this.champErreur(this.nom, true) : this.champErreur(this.nom, false);
		this.prenom.val() === "" ? this.champErreur(this.prenom, true) : this.champErreur(this.prenom, false);
	}
};

Contacts.prototype.validerModification = function (callback) {
	if (this.modifierPrenom.val() !== "" && this.modifierNom.val() !== "" && this.modifierTelephone.val() !== "") {
		if ($.isFunction(callback)) callback();
	} else {
		this.modifierTelephone.val() === "" ? this.champErreur(this.modifierTelephone, true) : this.champErreur(this.modifierTelephone, false);
		this.modifierNom.val() === "" ? this.champErreur(this.modifierNom, true) : this.champErreur(this.modifierNom, false);
		this.modifierPrenom.val() === "" ? this.champErreur(this.modifierPrenom, true) : this.champErreur(this.modifierPrenom, false);
	}
};

Contacts.prototype.champErreur = function (champ, enErreur) {
	if (enErreur) {
		champ.select();
		champ.addClass("bgErreur");
	} else {
		champ.removeClass("bgErreur");
	}
};

/*Formulaires*/
Contacts.prototype.nettoyerFormulaire = function () {
	this.prenom.val("");
	this.nom.val("");
	this.telephone.val("");
	this.courriel.val("");

	this.prenom.removeClass("bgErreur");
	this.nom.removeClass("bgErreur");
	this.telephone.removeClass("bgErreur");

    this.modifierPrenom.removeClass("bgErreur");
	this.modifierNom.removeClass("bgErreur");
	this.modifierTelephone.removeClass("bgErreur");
};

Contacts.prototype.chargerFormulaire = function () {
    this.boiteModifiercontact.hide();
    this.nettoyerFormulaire();
	this.initialiserContactArray();
	this.initialiserDatatable();
	this.initialiserMask();
	this.prenom.select();
};

Contacts.prototype.chargerDialogModifierContact = function (contact) {
    this.contactArrayIndex.val(contact.index);
    this.modifierId.val(contact.id);
    this.modifierPrenom.val(contact.prenom);
    this.modifierNom.val(contact.nom);
    this.modifierTelephone.val(contact.telephone);
    this.modifierCourriel.val(contact.courriel);
};

/*Helpers*/
Contacts.prototype.obtenirSelectedIndexByContactId = function (id) {
	var index = -1;
	for (i = 0; i < this.contactArray.length; i++) {
		if (this.contactArray[i][0] == id) { index = i; break; }
	}
	return index;
};

Contacts.prototype.obtenirInformationsDuContactParRangee = function (contact) {
	var objContact = {};
	objContact.id = contact[0].innerText;
	objContact.nom = contact[1].innerText;
	objContact.prenom = contact[2].innerText;
	objContact.telephone = contact[3].innerText;
	objContact.courriel = contact[4].innerText;
	return objContact;
};