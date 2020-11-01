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
        if (a[i].toString()==obj.toString()) {
            return i;
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
  favoris.setAttribute('onclick','removeFav('+item.textContent+')');
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
      imageSpan.setAttribute("onclick","removeFav("+favorisHistorique[a].toString()+")");

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
    favoris.setAttribute('onclick','removeFav('+itemFav+')');
    favoris.removeAttribute("disabled");
  }else{
    favorisHistorique = [];
    favorisHistorique[0] = itemFav;
    imgFav.src = "images/etoile-pleine.svg";
    favoris.setAttribute('onclick','removeFav('+itemFav+')');
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
      favoris.setAttribute('onclick','removeFav('+film.value+')');
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
      var objetFilm = obj.results[a];
      if(objetFilm.overview != ""){
        var overview = document.createElement('p');
        overview.textContent = "Overview : "+objetFilm.overview.toString();
        var releaseDate = document.createElement('p');
        releaseDate.textContent = "Release date : "+objetFilm.release_date.toString();
        var starsRating = objetFilm.vote_average;
        var titleMovie = document.createElement('h2');
        titleMovie.textContent = objetFilm.original_title;
        var urlImage = (objetFilm.poster_path != null)?('https://image.tmdb.org/t/p/w154'+objetFilm.poster_path.toString()):'images/imageNot.jpg';
        var imageComplete = document.createElement('img');
        imageComplete.src = urlImage;

        var informationsDiv = document.createElement('div');
        informationsDiv.appendChild(titleMovie);

        var complementaireInfo = document.createElement('div');
        complementaireInfo.appendChild(releaseDate);
        var divStars = document.createElement('div');
        var starsRateP = document.createElement('p');
        starsRateP.textContent = "Rate : ";
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

    gifLoading.setAttribute("style","display:block");
    while (divResultat.firstChild) {
      divResultat.removeChild(divResultat.lastChild);
    }
    //appel ajax asynchrone
    //delay pour voir le gif d'attente (API trop reactive et connexion trop bonne pour le voir sinon)
    setTimeout(() => { ajax_get_request(afficherResult,url); }, 2000);
    //ajax_get_request(afficherResult,url);

}
