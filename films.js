//Declaration de tous les elements de document necessaire
//
//champ texte du film selectionner par l'utilisateur (input)
var film = document.getElementById("texte_recherche");
//clée client de l'API the database movie API (ne pas laisser ça dans un vrai projet)
var apikey = "2e9c3e18e97a2b46a2104dfd5700cebf";
//URL pratique pour affichage d'image d'un film
var url_image = "https://image.tmdb.org/t/p/";
//section resultat
var divResultat = document.getElementById("bloc-resultats");
//bouton favoris
var favoris = document.getElementById("btn-favoris");
//image bouton fav
var imgFav = document.getElementById("imageEtoile");
// liste des favoris
var listeFav = document.getElementById("liste-favoris");
//div pour l'affichage des favoris
var sectionFavoris = document.getElementById("liste-favoris");
//gif svg pour l'annivamtion de chargement
var gifLoading = document.getElementById("bloc-gif-attente");
//tableau des favoris
var favorisHistorique = [];
//boolean permettant d'eviter un bug lié au spam de recherche
var rechercheEnCours = false;

// rechercher dans un objet(tableau) si un élément existe
function contains(a, obj) {
  if(a != null){
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
  }
    return false;
}

//rechercher l'index d'un élément, on suppose qu'il existe
function indexOF(a, obj) {
    for (var i = 0; i < a.length; i++) {

        if (a[i].toString()==obj) {
            return i;
        }
    }
    return 0;
}
//enlever un favoris de la liste des favoris
function removeFav(item){
  //trouver l'index de ce favoris
  var numeroIndex = indexOF(favorisHistorique,item);
  //enlever un element d'une liste à un index donné, donc ici notre favoris
  favorisHistorique.splice(numeroIndex,1);
  //enlever l'ancienne liste
  window.localStorage.removeItem('favorisHistorique');
  //placer la nouvelle liste en localStorage
  window.localStorage.setItem('favorisHistorique', JSON.stringify(favorisHistorique));
  //Load l'affichage de la liste des favoris
  loadFavoris();
  //changer l'affichage de l'étoile pour put fav et la fonction onclick
  favoris.className = 'btn_clicable';
  favoris.removeAttribute("disabled");
  imgFav.src = "images/etoile-vide.svg";
  favoris.setAttribute('onclick','putfav()');
}
//fonction permettant de faire une recherche via un favoris
//va simplement mettre le nom de la recherche dans l'input, changer l'étoile pour la remplir et faire appel à la fonction recherche qui va faire un appel ajax asynchrone
function rechercheAvance(item){
  film.value = item.textContent;
  imgFav.src = "images/etoile-pleine.svg";
  favoris.setAttribute('onclick','removeFav("'+item.textContent.toString()+'")');
  favoris.removeAttribute("disabled");
  favoris.className = 'btn_clicable';
  recherche();
}

//fonction permettant d'afficher les favoris
function loadFavoris(){
  favorisHistorique = JSON.parse(window.localStorage.getItem('favorisHistorique'));
  //enlever l'affichage des favoris deja present
  while (listeFav.firstChild) {
    listeFav.removeChild(listeFav.lastChild);
  }
  //si on a des favoris
  if(favorisHistorique != null){
    //alors parcourir la liste et créer les elements permettant de les afficher sur la page mais aussi les attribut permettant les interractions(onclick)
    for(var a = 0; a<favorisHistorique.length; a++){
      var divSpan = document.createElement('li');
      var span = document.createElement('span');
      span.title = "Cliquer pour relancer la recherche";
      span.textContent = favorisHistorique[a];
      span.setAttribute("onclick","rechercheAvance(this)");
      var imageSpan = document.createElement('img');
      imageSpan.src = "images/croix.svg";
      imageSpan.alt = "Icone pour supprimer le favori";
      imageSpan.width = 15;
      imageSpan.title = "Cliquer pour supprimer le favori";
      imageSpan.setAttribute("onclick","removeFav('"+favorisHistorique[a].toString()+"')");

      divSpan.appendChild(span);
      divSpan.appendChild(imageSpan);
      listeFav.appendChild(divSpan);
  }

}else{
  //sinon afficher qu'il n'y a pas de favoris
  var span = document.createElement('p');
  span.className = "info-vide";
  span.textContent = ("Aucune recherche enregistrée") ;
  sectionFavoris.appendChild(span);
}
}

//ajouter un favoris, fonction appelé avec l'etoile vide
function putfav(){
  //recup la valeur de l'input, qui sera le nom de notre favoris
  var itemFav = film.value;
  //on charge les favoris deja existant
  loadFavoris();
  //si on a des favoris
  if(favorisHistorique != null){
    // alors ajouter le nouveau favoris à la fin de cette liste, changer l'étoile et les attributs lié
    favorisHistorique[favorisHistorique.length] = itemFav;
    imgFav.src = "images/etoile-pleine.svg";
    favoris.setAttribute('onclick','removeFav("'+itemFav.toString()+'")');
    favoris.removeAttribute("disabled");
  }else{
    //sinon créer un tableau vide pour y insérer notre premier favoris
    favorisHistorique = [];
    favorisHistorique[0] = itemFav;
    imgFav.src = "images/etoile-pleine.svg";
    favoris.setAttribute('onclick','removeFav("'+itemFav.toString()+'")');
    favoris.removeAttribute("disabled");
  }
  // enlever l'ancienne liste pour y mettre la nouvelle
  window.localStorage.removeItem('favorisHistorique');
  window.localStorage.setItem('favorisHistorique', JSON.stringify(favorisHistorique));
  // actualiser l'affichage des favoris
  loadFavoris();
}

//input setting
film.addEventListener('input', evt => {
  //si l'input film contient des char, bouton fav est clicable, l'espace ne compte pas
  if(film.value.trim()){
    if(contains(favorisHistorique,film.value)){
      imgFav.src = "images/etoile-pleine.svg";
      favoris.removeAttribute("disabled");
      favoris.setAttribute('onclick','removeFav("'+film.value.toString()+'")');
    }else{
      favoris.className = 'btn_clicable';
      favoris.removeAttribute("disabled");
      imgFav.src = "images/etoile-vide.svg";
      favoris.setAttribute('onclick','putfav()');
    }
  }else{
    favoris.removeAttribute("class");
    favoris.setAttribute("disabled",'');
    imgFav.src = "images/etoile-vide.svg";

  }
});


// fonction appel asynchrone ajax
function ajax_get_request(callback, url) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
                if (callback && xhr.readyState == XMLHttpRequest.DONE
                                && (xhr.status == 200 || xhr.status == 0))
                {
                        callback(xhr.responseText);
                }
        };
        xhr.open("GET", url, true);
        xhr.send();
}


//fonction pour la creation de la division contenant tous les resultats
function afficherResult(elem){
  rechercheEnCours = false;
  //enlever l'affichage du svg de chargement
  gifLoading.removeAttribute("style");
  //elem retourner de l'appel ajax, transformation en objet JSON pour pouvoir l'exploiter
  var obj = JSON.parse(elem);
  // si l'element retourner de l'appel ajax ne retourne pas de resultat, le marquer, sinon tout afficher
  if(obj.results.length == 0){
    var titre = document.createElement('h2');
    titre.textContent = "Aucun resultat";
    divResultat.appendChild(titre);
  }
  else{
    //pour tous les éléments de l'ojet retourner, creation des division/elements permettant de les afficher
    for(let a = 0; a<obj.results.length; a++){
      var objetFilm = obj.results[a];
      if(objetFilm.overview != ""){
        var overview = document.createElement('p');
        overview.textContent = "Overview : "+objetFilm.overview.toString();
        var releaseDate = document.createElement('p');
        if (objetFilm.release_date == null){
          releaseDate.textContent = "Release date : date not specified";

        }else{
          releaseDate.textContent = "Release date : "+objetFilm.release_date.toString();

        }
        var starsRating = objetFilm.vote_average;
        var titleMovie = document.createElement('h2');
        titleMovie.textContent = objetFilm.original_title;
        var urlImage = (objetFilm.poster_path != null)?(url_image+'w154'+objetFilm.poster_path.toString()):'images/imageNot.jpg';
        var imageComplete = document.createElement('img');
        imageComplete.src = urlImage;

        var informationsDiv = document.createElement('div');
        informationsDiv.appendChild(titleMovie);

        var complementaireInfo = document.createElement('div');
        complementaireInfo.appendChild(releaseDate);
        var divStars = document.createElement('div');
        var starsRateP = document.createElement('p');
        starsRateP.textContent = "Rate : ";

        //Calcul du nombre d'étoile à afficher; les créer et les ajouter à une division, qu'on ajoutera à nos resultats
        divStars.appendChild(starsRateP);
        if(objetFilm.vote_count == 0){
          starsRateP.textContent = "Rate : Not Rated";
        }else{
          var nbEtoile = Math.round(starsRating/2);
          var nbEtoileVide = 5-nbEtoile;
          for(var i = 0; i<nbEtoile;i++){
            var imageEtoile = document.createElement('img');
            imageEtoile.src = "images/etoile-pleine.svg";
            divStars.appendChild(imageEtoile);
          }
          for(var i = 0; i<nbEtoileVide;i++){
            var imageEtoile = document.createElement('img');
            imageEtoile.src = "images/etoile-vide.svg";
            divStars.appendChild(imageEtoile);
          }
          divStars.title = starsRating+'/10';
        }


        complementaireInfo.appendChild(divStars);
        informationsDiv.appendChild(complementaireInfo);
        informationsDiv.appendChild(overview);
        var classFilm = document.createElement('div');
        classFilm.className = "film";
        classFilm.appendChild(imageComplete);
        classFilm.appendChild(informationsDiv);
        divResultat.appendChild(classFilm);
      }
    }
  }
}

function recherche(){
  //url de l'api pour l'appel ajax
  var url = "https://api.themoviedb.org/3/search/movie?api_key="+apikey+"&query=" + film.value;
  //eviter le spam de l'api
  if(rechercheEnCours == false){
    rechercheEnCours = true;
    gifLoading.setAttribute("style","display:block");
    while (divResultat.firstChild) {
      divResultat.removeChild(divResultat.lastChild);
    }
    //appel ajax asynchrone
    //delay pour voir le gif d'attente (API trop reactive et connexion trop bonne pour le voir sinon)
    setTimeout(() => { ajax_get_request(afficherResult,url); }, 2000);
    //faire l'appel ajax ci dessous pour une vraie utilisation
    //ajax_get_request(afficherResult,url);
  }

}

//ajout du listener permettant de faire une recherche directement avec la touche entrer
film.addEventListener("keyup", function(event) {
  //le numéro 13 est le code de la touche entrer
  if (event.keyCode === 13) {
    //enlever l'action initiale de cette touche
    event.preventDefault();
    // lancer une recherche
    recherche();
  }
});
