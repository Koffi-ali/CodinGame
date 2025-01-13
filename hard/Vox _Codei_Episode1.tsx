/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

type place  = {
    x: number;
    y: number;
    nbKilled: number[][]
}
type newPlace = {
    place: place;
    exploded : number
}
const map : string[][] = [] // est la liste des positions des bombes sur la map
let noeuds : number[][] = [] 
var inputs: string[] = readline().split(' ');
let width: number = parseInt(inputs[0]); // width of the firewall grid
let height: number = parseInt(inputs[1]); // height of the firewall grid

for (let i = 0; i < height; i++) {
    let mapRow: string[] = readline().split(''); // one line of the firewall grid
    // mapRow=map1[i].split('')
    let index = -1
    while((index = mapRow.indexOf('@',index+1)) !== -1) noeuds.push([index, i])
    map.push(mapRow)
    console.error(mapRow.join(''))
}
console.error('noeuds :', noeuds)


const getNodesDestroyed = (bombeX : number, bombeY: number, map :string[][]) : number[][] => {
    const nodesDestroyed : number[][]= []
    // haut
    for (let j=1;j<=3;j++) {
        if(bombeY-j<0 ) break
        else if(map[bombeY-j][bombeX] ==='#') break
        else if(map[bombeY-j][bombeX] ==='@') nodesDestroyed.push([bombeX,bombeY-j])
            
    }
    // bas
    for (let j=1;j<=3;j++) {
        // console.error('bomby :', bombeY+j)
        // console.error('bombx :', typeof bombeY+j)
        if(bombeY+j>=height) break
        else if( map[bombeY+j][bombeX] ==='#') break
        else if(map[bombeY+j][bombeX] ==='@') nodesDestroyed.push([bombeX,bombeY+j])   
    }
    // droite 
    for (let i=1;i<=3;i++) {
        //   console.error('bombx :', typeof bombeX+i)
        if(bombeX+i>=width) break
        else if(map[bombeY][bombeX+i] ==='#') break
        else if(map[bombeY][bombeX+i] ==='@') nodesDestroyed.push([bombeX+i,bombeY])   
    }
    // gauche
    for (let i=1;i<=3;i++) {
        if(bombeX-i<0) break
        else if(map[bombeY][bombeX-i] ==='#') break
        else if(map[bombeY][bombeX-i]==='@') nodesDestroyed.push([bombeX-i,bombeY])   
    }
    return nodesDestroyed 
}
const simulation = (noeuds : number[][], map : string[][]) : place[] => {
    const set : Set<string> = new Set<string>()
    const places :  place[] = []
    noeuds.forEach((noeud : number[]) => {
        const [x,y] = noeud
        // en haut
        for (let j=1; j<=3;j++) {
            if(y-j>=0 && map[y-j][x] === '.' && !set.has(`${x}${y-j}`)) {
                set.add(`${x}${y-j}`)
                let nodes : number[][] = getNodesDestroyed(x,y-j,map)
                places.push({x:x,y:y-j,nbKilled: nodes})
            } else if(y-j<0) break
        }
        // en bas 
        for (let j=1; j<=3;j++) {
            if(y+j<height && map[y+j][x] === '.' && !set.has(`${x}${y+j}`)) {
                set.add(`${x}${y+j}`)
                let nodes : number[][] = getNodesDestroyed(x,y+j,map)
                places.push({x:x,y:y+j,nbKilled: nodes})
            } else if(y+j>=height) break
        }
        // à gauche
        for (let i=1; i<=3;i++) {
            if(x-i>=0 && map[y][x-i] === '.' && !set.has(`${x-i}${y}`)) {
                set.add( `${x-i}${y}`)
                let nodes : number[][] = getNodesDestroyed(x-i,y,map)
                places.push({x:x-i,y:y,nbKilled: nodes})
            } else if(x-i<0) break
        }
        // à droite
        for (let i=1; i<=3;i++) {
            if(x+i<width && map[y][x+i] === '.' && !set.has(`${x+i}${y}`)) {
                set.add(`${x+i}${y}`)
                let nodes : number[][] = getNodesDestroyed(x+i,y,map)
                places.push({x:x+i,y:y,nbKilled: nodes})
            } else if(x+i>=width) break
        }
    })
    // places.sort((a: place , b :place) => b.nbKilled.length - a.nbKilled.length)
    const uniquePlaces = places.filter((currentPlace, index, self) => {
        // Créer une copie du tableau nbKilled avant de trier
        const sortedNbKilled = [...currentPlace.nbKilled]
            .map(arr => [...arr]) // Créer des copies profondes des sous-tableaux
            .sort((a, b) => a[0] - b[0]); // Tri basé sur les premiers éléments
    
        // Générer une clé en joignant les valeurs
        const currentKey = sortedNbKilled.map(row => row.join(',')).join(';');
        
        // Vérifier si cette clé existe déjà pour un autre élément dans le tableau
        return index === self.findIndex(place => {
            // Faire une copie de nbKilled du place en cours avant le tri
            const sortedPlaceNbKilled = [...place.nbKilled]
                .map(arr => [...arr]) // Copies profondes des sous-tableaux
                .sort((a, b) => a[0] - b[0]);
    
            const placeKey = sortedPlaceNbKilled.map(row => row.join(',')).join(';');
            return placeKey === currentKey;
        });
    });
    uniquePlaces.sort((a:place, b:place) => {
        if(a.nbKilled.length>b.nbKilled.length) return -1
        else if(a.nbKilled.length<b.nbKilled.length) return 1
        else {
            return -Math.max(a.nbKilled.filter((coord :number[]) => coord[0] === a.x).length, a.nbKilled.filter((coord :number[]) => coord[1] === a.y).length) + Math.max(b.nbKilled.filter((coord :number[]) => coord[0] === b.x).length, b.nbKilled.filter((coord :number[]) => coord[1] === b.y).length)
        }
    })
    
    return uniquePlaces
    // return places
}
const upgradeMap = (map : string[][], killedNodes: number[][], noeuds : number[][] ) : number[][] => {
    if(!killedNodes.length) return noeuds
    else {
        const killedNodesString : string[] = killedNodes.map((a: number[])=>a.join(','))
        return noeuds.filter((node1 : number[]) => {
            if(killedNodesString.includes(node1.join(','))) {
                map[node1[1]][node1[0]] = '.'
                return false
            } else {
                return true
            }
        })
    }
    // on supprime les noeuds explosé après trois tours et on les remplace par '.'
}
const updateMap = (map : string[][],  killedNodes: number[][]) => {
        killedNodes.forEach((node :number[]) => map[node[1]][node[0]] = '.' )
}

const backTracking = (bombes: number, places : place [], res : place [], map : string[][], noeuds : number[][]) => {
    // faudra également créer unn set pour gérer le cas deux bombes exposeraient les mêmes nodes
    // res sera la liste des coordonnées des bombes
    const pplaces : place[] = JSON.parse(JSON.stringify(places));
    if(noeuds.length===0) return res
    // console.error("places :", places)
    for (const Place of pplaces) {
        const newMap : string[][] =JSON.parse(JSON.stringify(map));
        const newNodes : number[][] = upgradeMap(newMap,Place.nbKilled,noeuds)
        const newPlaces : place[] = simulation(newNodes, newMap)
        let result : place[] | null = null
        const newRes: place[] = res.concat([Place])
        if(newRes.length<=bombes) {
            // res.push(Place)
            console.error(`res : ${newRes.length} - ${JSON.stringify(newRes)}`)
            result = backTracking(bombes, newPlaces, newRes, newMap, newNodes)
        }
        if(result) return result
    }
    return null

}
const checkIfVoisin =(point1 : number[], listIndex : number[], newPPlace : newPlace[], map : string[][]) : number[] => {
    // cette focntion renvoie une liste des index des bombes qui ont un exploded à 1
    const coords : number [] = listIndex.filter((a : number) => {
        const [x,y] = [newPPlace[a].place.x,newPPlace[a].place.y]
        if(x !== point1[0] && y !== point1[1]) return false
        else if(x===point1[0]) {
            if(y - point1[1]>0) {
                // point1 -> (x,y) e direection du bas
                for (let j=1;j<y - point1[1];j++) {
                    if(map[j+point1[1]][x] === '#') return false
                }
                return true
            } else {
                   //  (x,y) -> point1 en direction direction du haut
                   for (let j=1;j<Math.abs(y - point1[1]);j++) {
                    if(map[-j+point1[1]][x] === '#') return false
                }
                return true             
            }
        } else if(y=== point1[1]) {
            // point1 -> (x,y) e direction de la droite
                if(x - point1[0]>0) {
                    for (let i=1;i<x - point1[0];i++) {
                        if(map[y][i+point1[0]] === '#') return false
                    } 
                    return true
                } else {
                //  (x,y) -> point1 en direction direction de la gauche
                    for (let i=1;i<Math.abs(x - point1[0]);i++) {
                        if(map[y][-i+point1[0]] === '#') return false
                    }  
                    return true  
                }      
        }
})
    return [... new Set(coords)]
}

const decision = (newPPlace: newPlace[], map: string[][]) : string => {
    // Cette fonction  renvoie la décison à prendre

    /** 1
     * Commencer par check les PPlaces qui ont un exploded de 3 pour faire exploser les noeuds en question puis
     * mettre à jour la map en réponse. Egalement check les bombes qui sont à proxmité lors de l'explosion puis faire également exploser les noeuds correspondant
    **/
   console.error('newPlaces : ',JSON.stringify(newPPlace))
   const PPlacesWillNoExplodedIndex : number [] = []
   const PPlacesWillExplodedIndex : number[] = []
   const PPlacesNotSetIndex : number[] = []
   const PPlacesExploded : number[] = []
   for (let i = 0; i<newPPlace.length; i++) {
    if(newPPlace[i].exploded===2) PPlacesWillExplodedIndex.push(i)
    else if (newPPlace[i].exploded===1) PPlacesWillNoExplodedIndex.push(i)
    else if(newPPlace[i].exploded===0) PPlacesNotSetIndex.push(i)
    else if(newPPlace[i].exploded===3) PPlacesExploded.push(i)
   }
   PPlacesExploded.forEach((index : number) => updateMap(map,newPPlace[index].place.nbKilled))
   let indexVoisinsBombesGlob :  number [] = []
   if(PPlacesWillExplodedIndex.length) {
        PPlacesWillExplodedIndex.forEach((index : number) => {
            newPPlace[index].exploded++
            // updateMap(map,newPPlace[index].place.nbKilled)
            const indexVoisinsBombesLoc : number []=checkIfVoisin([newPPlace[index].place.x,newPPlace[index].place.y],PPlacesWillExplodedIndex,newPPlace,map)
            indexVoisinsBombesGlob = indexVoisinsBombesGlob.concat( indexVoisinsBombesLoc)
        })
   }
   indexVoisinsBombesGlob = [... new Set(indexVoisinsBombesGlob)]
   PPlacesWillNoExplodedIndex.forEach((index : number) => {
    if(indexVoisinsBombesGlob.includes(index)) {
            // updateMap(map,newPPlace[index].place.nbKilled)
            newPPlace[index].exploded = 3 // on supposera que le round 3 est atteint car ces bombes ont eexplosé avant leurs heures   
    } else {
        newPPlace[index].exploded++ 
    }
   })


   /** 2
    * Dans le cas où il n'y aurait pas encore d'explosion (exploded = 3), essayer de check les bombres qui n'ont pas encore été posées et voir en fonction des noeuds qui seront potentiellement explosés
    * par les noeuds déja  posés si s'il y aura collison, si oui WAIT, sinon poser la next bombe
    */
   const nextBombPlacedIndex : number = PPlacesNotSetIndex.find((i: number) => map[newPPlace[i].place.y][newPPlace[i].place.x] === '.')
   if(nextBombPlacedIndex) {
        console.error('nexIndex : ', nextBombPlacedIndex)
       newPPlace[nextBombPlacedIndex].exploded++
       // supprimer de la liste les bombes qui ont déjà explosées
       const res : string = newPPlace[nextBombPlacedIndex].place.x+ ' '+ newPPlace[nextBombPlacedIndex].place.y
       PPlacesExploded.forEach((index : number) => newPPlace.splice(index,1))
        return res
   } else {
    // supprimer de la liste les bombes qui ont déjà explosées
     PPlacesExploded.forEach((index : number) => newPPlace.splice(index,1))
    return 'WAIT'
   }
}
// game loop
// const PPlace : place = simulation(noeuds,map)[0]
// console.error('Place :',PPlace)
let Places : place[] = []
let R: number = 1
const newPPlaces : newPlace[] = []
while (true) {
    var inputs: string[] = readline().split(' ');
    const rounds: number = parseInt(inputs[0]); // number of rounds left before the end of the game
    const bombs: number = parseInt(inputs[1]); // number of bombs left
    console.error('R: ', R)
    if(!Places.length) {
        Places = backTracking(bombs,simulation(noeuds,map),[],map,noeuds)
        Places.forEach((pl : place) =>newPPlaces.push({place : pl, exploded:0}))
        console.error('Places :', Places)
        // if (Places && Places.length > 0) {
        //     const Place: place = Places.shift()!;
        //     noeuds = upgradeMap(map, Place.nbKilled, noeuds);
        //     R++;
        //     console.log(Place.x + ' ' + Place.y);
        // } else {
        //     console.log('WAIT');
        // }
        const Place: place = Places[0]
        // noeuds = upgradeMap(map, Place.nbKilled, noeuds);
        newPPlaces[0].exploded++
        console.log(Place.x + ' ' + Place.y);
    } else {
    //     const Place : place = Places.shift()!
    //     if(Place) {
    //         noeuds = upgradeMap(map,Place.nbKilled,noeuds)
    //         R++
    //         console.log(Place.x + ' ' + Place.y)  
    //     }
    //      else{
    //         console.log('WAIT')
    //      }
    // }
    // else {
    //     R++
    //     console.log('WAIT')
    // }

    // ici commencer à prendre décisions
    const res : string = decision(newPPlaces,map)
     console.log(res)
    }
}
