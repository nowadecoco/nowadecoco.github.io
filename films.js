//Declaration de tous les elements de document necessaire
//
//champ texte du film selectionner par l'utilisateur
var film = document.getElementById("texte_recherche");
//clée client de l'API the database movie API
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
var sectionFavoris = document.getElementById("liste-favoris");

var gifLoading = document.getElementById("bloc-gif-attente");

var booleanGif = false;
//change page
//URL &page=1

//tableau des favoris
var favorisHistorique = [];

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
function indexOF(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return a;
        }
    }
    return 0;
}
function removeFav(item){
  var numeroIndex = indexOF(favorisHistorique,item);
  favorisHistorique.splice(numeroIndex,1);
  window.localStorage.removeItem('favorisHistorique');
  window.localStorage.setItem('favorisHistorique', JSON.stringify(favorisHistorique));
  loadFavoris();
  favoris.className = 'btn_clicable';
  favoris.removeAttribute("disabled");
  imgFav.src = "images/etoile-vide.svg";
  favoris.setAttribute('onclick','putfav()');
}
function rechercheAvance(item){
  film.value = item.textContent;
  imgFav.src = "images/etoile-pleine.svg";
  favoris.setAttribute('onclick','removeFav()');
  favoris.removeAttribute("disabled");
  favoris.className = 'btn_clicable';
  recherche();
}

function loadFavoris(){
  favorisHistorique = JSON.parse(window.localStorage.getItem('favorisHistorique'));

  while (listeFav.firstChild) {
    listeFav.removeChild(listeFav.lastChild);
  }
  if(favorisHistorique != null){
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
      imageSpan.setAttribute("onclick","removeFav(this)");

      divSpan.appendChild(span);
      divSpan.appendChild(imageSpan);
      listeFav.appendChild(divSpan);
  }

}else{
  var span = document.createElement('p');
  span.className = "info-vide";
  span.textContent = ("Aucune recherche enregistrée") ;
  sectionFavoris.appendChild(span);
}
}

//ajouter un favoris
function putfav(){
  var itemFav = film.value;
  loadFavoris();
  if(favorisHistorique != null){
    favorisHistorique[favorisHistorique.length] = itemFav;
    imgFav.src = "images/etoile-pleine.svg";
    favoris.setAttribute('onclick','removeFav()');
    favoris.removeAttribute("disabled");
  }else{
    favorisHistorique = [];
    favorisHistorique[0] = itemFav;
    imgFav.src = "images/etoile-pleine.svg";
    favoris.setAttribute('onclick','removeFav()');
    favoris.removeAttribute("disabled");
  }
  window.localStorage.removeItem('favorisHistorique');
  window.localStorage.setItem('favorisHistorique', JSON.stringify(favorisHistorique));
  loadFavoris();
}

//input setting
film.addEventListener('input', evt => {
  //si l'input film contient des char, bouton fav est clicable, espace ne compte pas
  if(film.value.trim()){
    if(contains(favorisHistorique,film.value)){
      imgFav.src = "images/etoile-pleine.svg";
      favoris.removeAttribute("disabled");
      favoris.setAttribute('onclick','removeFav()');
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

function anniverGif(){
  booleanGif = !booleanGif;
  while(booleanGif){

  }
}

//fonction pour la creation de la division contenant tous les resultats
function afficherResult(elem){
  gifLoading.removeAttribute("style");

  //elem retourner de l'appel ajax, transformation en objet JSON pour pouvoir l'exploiter
  var obj = JSON.parse(elem);
  //suppression de la dernière recherche si elle existe
//  while (divResultat.firstChild) {
  //  divResultat.removeChild(divResultat.lastChild);
  //}
  // si l'element retourner de l'appel ajax ne retourne pas de resultat, le marquer, sinon tout afficher
  if(obj.results.length == 0){
    var titre = document.createElement('h2');
    titre.textContent = "Aucun resultat";
    divResultat.appendChild(titre);
  }
  else{
    for(let a = 0; a<obj.results.length; a++){
      //boolean pour verifier de la pertinence de l'affichage d'un objet
      // exemple : un film sans description n'a que peu d'importance pour le projet ici
      var publicationOK = true;
      //recupération du film à l'indice A
      var objetFilm = obj.results[a];
      // creation des premiers elements description et image du film
      var description = document.createElement('p');
      var image = document.createElement('img');
      //verification qu'une image existe pour le film à afficher, sinon afficher une image default
      if(objetFilm.poster_path != null){
        image.src = 'https://image.tmdb.org/t/p/w154'+objetFilm.poster_path.toString();
      }else{
        image.src = 'images/imageNot.jpg';
      }
      // verification de la pertinence
      // ici comparaison avec une chaine vide et non null car l'API ne renvoie pas null pour une description vide
      if(objetFilm.overview != ""){
        description.textContent = objetFilm.overview.toString();
      }else{
        publicationOK = false;
      }
      //creation de la division contenant la description et l'image
      //plus simple pour la gestion du CSS associé
      var divDescrip = document.createElement('div');
      divDescrip.className = "decription_photo";
      //ajout des elements dans la division
      divDescrip.appendChild(image);
      divDescrip.appendChild(description);
      //creation de l'element contenant le titre du film
      var titre = document.createElement('h4');
      titre.textContent = objetFilm.title.toString();
      //creation d'une balise lien contenant l'intégralité des informations ci dessus
      //simple balise pour faire une eventuelle partie suplémentaire sur le site
      var lienFilm = document.createElement('a');
      lienFilm.appendChild(titre);
      lienFilm.appendChild(divDescrip);
      //**simple idée**
      //lienFilm.href = "film.html?id="+objetFilm.id.toString()+"&film="+film.value;
      lienFilm.className = "lienFilm";
      var classFilm = document.createElement('div');
      classFilm.className = "film";
      classFilm.appendChild(lienFilm);
      //verifier que le film peut etre ajouter, pertinence
      if(publicationOK){
        //ajouter le film en bas de la liste existente
        divResultat.appendChild(classFilm);
      }
    }
  }
}

function recherche(){
  //url de l'api pour l'appel ajax
    var url = "https://api.themoviedb.org/3/search/movie?api_key="+apikey+"&query=" + film.value;

    gifLoading.setAttribute("style","display:block");
    while (divResultat.firstChild) {
      divResultat.removeChild(divResultat.lastChild);
    }
    //appel ajax asynchrone
    //delay pour voir le gif d'attente (API trop reactive et connexion trop bonne pour le voir sinon)
    setTimeout(() => { ajax_get_request(afficherResult,url); }, 2000);
    //ajax_get_request(afficherResult,url);

}
