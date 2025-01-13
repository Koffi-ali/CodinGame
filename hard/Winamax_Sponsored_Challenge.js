/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
/*
1-Faire une fonction qui retourne le nombre de balles présentes sur la Map (leurs coordonnées).
2- Faire une fonction qui rétounrne les coodonnées des trous présentes sur la Map.
3-fonction qui pour chaque point calcule la distance pour le trou le plus proche.
4- 
*/
function deepCopy(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      // Si l'objet est un tableau, effectuez une copie profonde pour chaque élément du tableau
      return obj.map((element) => deepCopy(element));
    }
  
    // Si l'objet est un objet ordinaire, effectuez une copie profonde pour chaque propriété de l'objet
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepCopy(obj[key]);
      }
    }
  
    return clonedObj;
  }
  function comparerJSON(objet1, objet2) {
    // Vérifier si les deux objets sont du même type
    if (typeof objet1 !== typeof objet2) {
        return false;
    }

    // Vérifier si les deux objets sont des objets JSON
    if (typeof objet1 === 'object' && objet1 !== null && typeof objet2 === 'object' && objet2 !== null) {
        // Récupérer les clés des deux objets
        const clesObjet1 = Object.keys(objet1);
        const clesObjet2 = Object.keys(objet2);

        // Vérifier si le nombre de clés est le même
        if (clesObjet1.length !== clesObjet2.length) {
            return false;
        }

        // Vérifier récursivement chaque propriété
        for (let cle of clesObjet1) {
            if (!clesObjet2.includes(cle) || !comparerJSON(objet1[cle], objet2[cle])) {
                return false;
            }
        }

        // Si toutes les propriétés correspondent, les objets sont égaux
        return true;
    }

    // Comparaison directe pour les types primitifs (nombre, chaîne, booléen, etc.)
    return objet1 === objet2;
}

let list_path=[];
let Matrices=[];  // la liste des map possibles;
const direction={
    "top":"^",
    "bottom" :"v",
    "left":"<",
    "right" : ">"
}


function isInteger(str) {
    let num = parseInt(str);
    return Number.isFinite(num) && str.trim() === num.toString();
}
let matrice=[];
let matrice_copy=[];
 function load_matrice(H){
    for (let k=0;k<H;k++){
        console.log(matrice[k].join(''))

    }
}


function balles(H,W){
    let points=[];
    for(let i=0;i<H;i++){
        for (let j=0; j<W;j++){
            if(isInteger(matrice[i][j])){
                let point={"x":0,"y":0,"val":0,"trou":false};
                point["y"]=i
                point["x"]=j
                point["val"]=parseInt(matrice[i][j])
                points.push(point);
            }
        }
    }
    return points
}

function trous(H,W){
    let points=[];
    for(let i=0;i<H;i++){
        for (let j=0; j<W;j++){
            if(matrice[i][j]=="H"){
                let point={"x":0,"y":0,"visited":0};
                point["y"]=i
                point["x"]=j
                points.push(point);
            }
        }
    }
    return points
}

function initiate1_path(noeud,H,W){
    let list_top= move1_top(noeud, H,W);
    let list_bottom= move1_bottom(noeud, H,W);
    let list_left=move1_left(noeud, H,W);
    let list_right=move1_right(noeud, H,W);


    if(list_top !=false){
        list_path.push(list_top);
    }
    if(list_left !=false){
        list_path.push(list_left);
    }
    if(list_right !=false){
        list_path.push(list_right);
    }
    if(list_bottom !=false){
        list_path.push(list_bottom);
    }
    

}
function move1_left(noeud, H,W){
    let noeud_left=deepCopy(noeud);
    if(noeud_left["trou"]){
        return noeud_left;
    }
    if(noeud_left["x"]-noeud_left["val"]>=0 && !isInteger(matrice_copy[noeud_left["y"]][noeud_left["x"]-noeud_left["val"]]) && matrice_copy[noeud_left["y"]][noeud_left["x"]-noeud_left["val"]]!="X"){
        for(let i=0;i<noeud_left["val"];i++){
            noeud_left["list"].push("left");
        }
        if(matrice_copy[noeud_left["y"]][noeud_left["x"]-noeud_left["val"]]=="H"){
            noeud_left["trou"]=true;
            noeud_left["x"]=noeud_left["x"]-noeud_left["val"];
            noeud_left["val"]--;
            return noeud_left;
        }
        noeud_left["x"]=noeud_left["x"]-noeud_left["val"];
        noeud_left["val"]--;
        return noeud_left;
       
    } 
    return false;

}
function move1_right(noeud,H,W){
    let noeud_right=deepCopy(noeud);
    if(noeud_right["trou"]){
        return noeud_right;
    }
    if(noeud_right["x"]+noeud_right["val"]<W && !isInteger(matrice_copy[noeud_right["y"]][noeud_right["x"]+noeud_right["val"]]) && matrice_copy[noeud_right["y"]][noeud_right["x"]+noeud_right["val"]]!="X"){
        for(let i=0;i<noeud_right["val"];i++){
            noeud_right["list"].push("right");
        }
        if(matrice_copy[noeud_right["y"]][noeud_right["x"]+noeud_right["val"]]=="H"){
            noeud_right["trou"]=true;
            noeud_right["x"]=noeud_right["x"]+noeud_right["val"];
            noeud_right["val"]--;
            return noeud_right;

        }
        noeud_right["x"]=noeud_right["x"]+noeud_right["val"];
        noeud_right["val"]--;
        return noeud_right;
    } 
    return false;
}
function move1_top(noeud,H,W){
    let noeud_top=deepCopy(noeud);
    if(noeud_top["trou"]){
        return noeud_top;
    }
    if(noeud_top["y"]-noeud_top["val"]>=0 && !isInteger(matrice_copy[noeud_top["y"]-noeud_top["val"]][noeud_top["x"]]) && matrice_copy[noeud_top["y"]-noeud_top["val"]][noeud_top["x"]]!="X"){
        for(let i=0;i<noeud_top["val"];i++){
            noeud_top["list"].push("top");
        }
        if(matrice_copy[noeud_top["y"]-noeud_top["val"]][noeud_top["x"]]=="H"){
            noeud_top["trou"]=true;
            noeud_top["y"]=noeud_top["y"]-noeud_top["val"];
            noeud_top["val"]--;
            return noeud_top;
        }
        noeud_top["y"]=noeud_top["y"]-noeud_top["val"];
        noeud_top["val"]--;
        return noeud_top  
    } 
    return false;
}

function move1_bottom(noeud,H,W){
    let noeud_bottom=deepCopy(noeud);
    if(noeud_bottom["trou"]){
        return noeud_bottom;
    }
    if(noeud_bottom["y"]+noeud_bottom["val"]<H && !isInteger(matrice_copy[noeud_bottom["y"]+noeud_bottom["val"]][noeud_bottom["x"]]) && matrice_copy[noeud_bottom["y"]+noeud_bottom["val"]][noeud_bottom["x"]]!="X"){
        for(let i=0;i<noeud_bottom["val"];i++){
            noeud_bottom["list"].push("bottom");
        }
        if(matrice_copy[noeud_bottom["y"]+noeud_bottom["val"]][noeud_bottom["x"]]=="H"){
            noeud_bottom["trou"]=true;
            noeud_bottom["y"]=noeud_bottom["y"]+noeud_bottom["val"];
            noeud_bottom["val"]--;
            return noeud_bottom;

        }

        noeud_bottom["y"]=noeud_bottom["y"]+noeud_bottom["val"];
        noeud_bottom["val"]--;
        return noeud_bottom;   
    } 
    return false;
}


function path_1(list_game,H,W){
    /** initialisation  en dehors de la fonction*/
    let list_path1=[];

    if(list_game.length>0) {
        //console.log("taille de liste",list_path.length);
        let count=0;
        let n=list_game.length;
        ///console.log(`taille de liste ${list_game.length}`);
        for (let ind=0;ind<list_game.length;ind++){
            ///console.log(`val: ${list_game[ind]["val"]},list: ${list_game[ind]["list"]}, count:${count}}, point:`,list_game[ind]);
            if (list_game[ind]["val"]==0){
                if(matrice[list_game[ind]["y"]][list_game[ind]["x"]]=="H"){
                    let result=list_path1.find(objet=>comparerJSON(list_game[ind],objet));
                    if(!result){
                        list_path1.push(list_game[ind]);
                    }
                    count++;
                    //console.log("count:", count);
                }
                else{
                    list_path1.splice(ind,0);
                }
            }
            else if(list_game[ind]["trou"]){
                let result=list_path1.find(objet=>comparerJSON(list_game[ind],objet));
                if(!result){
                    list_path1.push(list_game[ind]);
                }
                count++;
            }
            else if((list_game[ind]["val"]>0)&& (!list_game[ind]["trou"])){
                let list_direction=list_game[ind]["list"];

                let list_left=move1_left(list_game[ind],H,W);
                let list_top=move1_top(list_game[ind],H,W);
                let list_right=move1_right(list_game[ind],H,W);
                let list_bottom=move1_bottom(list_game[ind],H,W);
                switch(list_direction[list_direction.length-1]){
                    case "top":
                        if(list_top !=false){
                            list_path1.push(list_top);
                        }
                        if(list_left !=false){
                            list_path1.push(list_left);
                        }
                        if(list_right !=false){
                            list_path1.push(list_right);
                        }
                        break;
                    case "bottom":
                        if(list_bottom !=false){
                            list_path1.push(list_bottom);
                        }
                        if(list_left !=false){
                            list_path1.push(list_left);
                        }
                        if(list_right !=false){
                            list_path1.push(list_right);
                        }

                        break;
                    case "left":
                        if(list_bottom !=false){
                            list_path1.push(list_bottom);
                        }
                        if(list_top !=false){
                            list_path1.push(list_top);
                        }
                        if(list_left !=false){
                            list_path1.push(list_left);
                        }

                        break;
                    case "right":
                        if(list_bottom !=false){
                            list_path1.push(list_bottom);
                        }
                        if(list_top !=false){
                            list_path1.push(list_top);
                        }
                        if(list_right !=false){
                            list_path1.push(list_right);
                        }
                        break;

                }
                
            }

        }
        ///console.log("taille list_game:",n)
        ///console.log("counter sortie:",count)
        if(n==count){
            ///console.log("je passe ici");
            return {"bool":true,"list_final":list_path1};
        }
    }
    ///console.log(`taille de liste sortie ${list_path1.length},`);
    ///console.log("point sortie :",list_path1);
    return path_1(list_path1,H,W);
}
// 6-

// function pour vérifier si le trous a été visité

function isVisited(point){
    // il faut bien passé pas le point de départ, mais le point final menant au trou
    let x=point["x"];
    let y=point["y"];
    
    let result=Trous.filter((trou)=>trou["x"] ==x && trou["y"] ==y);
     // récupère le trou visité
     ///console.log("trou visité",result);
    ///console.log("valeur trou visité",result[0]["visited"]);
    if(result[0]["visited"]==0){
        let ind=Trous.indexOf(result[0]);
       /// console.log("indice trou visité",ind)
        Trous[ind]["visited"]++;
        return false;
    }

    return true;
}

// vérifier si c'est possible de de se déplacer sans collision

function isPossible(matriciel,x,y,tab){
    
    let directions=[...tab];
    //directions=direction["list"];
    //console.log("direction fill_map",directions)
    for (let i=0;i<directions.length;i++){
        switch(directions[i]){
            case "top":
                //matriciel[y][x]=direction["top"];
                if((matriciel[y][x] !="X") &&(matriciel[y][x] !=".") && !isInteger(matriciel[y][x])){
                    return false;
                }
                y--;
                break;
            case "bottom":
                if((matriciel[y][x] !="X") &&(matriciel[y][x] !=".") && !isInteger(matriciel[y][x]) ){
                    return false;
                }
                y++;
                break;
            case "left":
                if((matriciel[y][x] !="X") &&(matriciel[y][x] !=".") && !isInteger(matriciel[y][x])){
                    return false;
                }
                x--;
                break;  
            case "right":
                if((matriciel[y][x] !="X") &&(matriciel[y][x] !=".") && !isInteger(matriciel[y][x])){
                    return false;
                }
                x++;
                break;
        }
    }

    return true;

}


function fill_map(matriciel,x,y,tab){
   
    let directions=[...tab];
    //directions=direction["list"];
    //console.log("direction fill_map",directions)
    for (let i=0;i<directions.length;i++){
        switch(directions[i]){
            case "top":
                matriciel[y][x]=direction["top"];
                y--;
                break;
            case "bottom":
                matriciel[y][x]=direction["bottom"];
                y++;
                break;
            case "left":
                matriciel[y][x]=direction["left"];
                x--;
                break;  
            case "right":
                matriciel[y][x]=direction["right"]
                x++;
                break;
        }
    }
    matriciel[y][x]=".";
}

function remove_water(mat,H,W){
    for(let i=0;i<H;i++){
        for (let j=0; j<W;j++){
            if(mat[i][j]=="X"){
                mat[i][j]=".";
            }
        }
    }
}

function check_path2(ballons,Matrice,H,W){
    let Matrice1=[...Matrice];
    // supprimer les cas où un trous accueille au moins 2 balles
    Matrice1=Matrice1.filter((mat)=> isHolePossible(mat,H,W))
    ///console.log("taille de matrice",Matrice1.length);
    if(ballons.length==0){
        return {"list_matrice":Matrice1};
    }
    // ballons est la liste de points et Matrice une liste de matrice qui contient la matrice originelle ai début
    let L1=[...ballons];
    let M1=[];
    // trier la liste ballons par ordre croissant de path possible
    L1=L1.sort((a,b)=>a["list"].length-b["list"].length);
    let first_point=L1[0];
    L1.splice(0,1);
    if(first_point["list"].length==1){
        L1=L1.map( (json)=> ({ "x":json["x"],"y":json["y"],"val":json["val"],"trou":json["trou"],"list":json["list"].filter((path)=>path["x"]!=first_point["list"][0]["x"] || path["y"]!=first_point["list"][0]["y"]) }) );
    }
    
    for(let k=0;k<Matrice1.length;k++){
        //let matrice2=Matrice[k];
        for(let j=0;j<first_point["list"].length;j++){
             let matrice2=Matrice1[k].map((list)=>list.slice()); // utiliser une nouvelle pour ne pas écraser le potentiel bon chemin du même point
            if( isPossible(Matrice1[k],first_point["x"],first_point["y"],first_point["list"][j]["list"])){
                // rempli la liste M1
                fill_map(matrice2,first_point["x"],first_point["y"],first_point["list"][j]["list"]);
                M1.push(matrice2);

            }
        }

    }
    ///console.log("taille L1 avant ",L1.length);
    ///console.log("taille de matrice dans path2 ",M1.length);
    //L1.splice(0,1);
   /// console.log("L1 après",L1);
    return check_path2(L1,M1,H,W)

}

function isHolePossible(map,H,W){ // map est une matrice
    for(let i=0;i<Trous.length;i++){
        let nb_points_trous=0;
        let x=Trous[i]["x"];
        let y=Trous[i]["y"];

        // vérifier en haut
        if((y-1>=0) && map[y-1][x]=="v"){
            nb_points_trous++;
        }
         // vérifier en bas 
        if((y+1<H) && map[y+1][x]=="^"){
                nb_points_trous++;
        }
        
        // vérifier à gauche 
        if((x-1>=0) && map[y][x-1]==">"){
            nb_points_trous++;
        }

        // vérifier à droite
        if((x+1<W) && map[y][x+1]=="<"){
            nb_points_trous++;
        }

        if((nb_points_trous>1)){
            return false;
        }


    }



    return true;
}

var inputs = readline().split(' ');
const width = parseInt(inputs[0]);
const height = parseInt(inputs[1]);
for (let i = 0; i < height; i++) {
    const row = readline();
    matrice.push(row.split(''));
}
matrice_copy=matrice.map(tab=>tab.slice());

///load_matrice(height);
///console.log("new matrice")
function load_new_matrice(H){
    for (let k=0;k<H;k++){
        console.log(matrice_copy[k].join(''))

    }
}

let points=balles(height,width);
let Trous=trous(height,width);
///console.log("trous",Trous);

let itéra=0;
let points2=deepCopy(points);
for(let k=0;k<points2.length;k++){
    points2[k]["list"]=[];
}
///console.log("point 2",points2)
let bool=false;
let nb=0;  // nb est le nombre de points
let points_finaux=[];
function main1(){
    for (let k=0;k<points2.length;k++){
        ///console.log("itération :",k);
        initiate1_path(points2[k],height,width);
        //console.log("list_path ",list_path)
        let result=path_1(list_path,height,width);
        ///console.log("result",result["list_final"][0]["list"].length);
        points2[k]["list"]=result["list_final"];
        list_path=[];
    }

    let possible =isPossible(matrice_copy,points2[0]["x"],points2[0]["y"],points2[0]["list"][0]["list"]);
    // ajouter la matrice initiale
    Matrices.push(matrice);
   /// console.log("Matrice P:",Matrices.length);
    let found=check_path2(points2,Matrices,height,width);
   // function to load matrice
   function load_Matrice(mat,H){
    for (let k=0;k<H;k++){
        console.log(mat[k].join(''))

    }
}
    
        // vérifier si la matrice est possible sachant qu'un seule est possible
            remove_water(found["list_matrice"][0],height,width);
            load_Matrice(found["list_matrice"][0],height);        
}
  
main1();
