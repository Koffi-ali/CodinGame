/**
 * Grow and multiply your organisms to end up larger than your opponent.
 **/
type Organ = {
    id: number,
    position: [number,number],
    type: string,
    owner: number,
    direction: string,
    parentId: number,
    rootId:  number
}
type GridElement = {
    position: [number,number],
    isWall: boolean,
    organ: Organ | null,
    protein: string | null
}
type Game = {
    grid: GridElement[][],
    myProteins: { A: number , B: number, C: number, D: number },
    oppProteins: { A: number , B: number, C: number, D: number },
    myOrgans: Organ[],
    oppOrgans: Organ[],
    organMap: Map<number,Organ>
}
var inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]); // columns in the game grid
const height: number = parseInt(inputs[1]); // rows in the game grid

// intialization
const initialize =  () => {
    const game : Game= {
        grid: [],
        myProteins: { A: 0 , B: 0, C: 0, D: 0 },
        oppProteins: { A: 0 , B: 0, C: 0, D: 0 },
        myOrgans: [],
        oppOrgans: [],
        organMap: new Map<number,Organ>()
    }
    for (let y = 0; y < height; ++y) {
        game.grid.push(new Array(width))
        for (let x = 0; x < width; ++x) {
            game.grid[y][x] = {
                position: [x, y],
                isWall: false,
                organ: null,
                protein: null
            }
        }   
    }
    return game
}
type Protein = 'A' | 'B' | 'C' | 'D'
const isThereEnemy = (x2:number, y2:number, game :Game) => {
    // faudra gérer le cas où mon ennemi est directement racollé à moi ou que je suis juste à un pas d'une tentacle ennemi qui pointe vers moi
    const isThereEnemyDepth0 = (x:number, y:number, game :Game) => {
        const isCoordEqual = [x2,y2].join(',')===[x,y].join(',')
        // left
        if( x-1>=0 && game.grid[y][x-1].organ?.owner===0 && ( (!isCoordEqual && !(game.grid[y][x-1].organ.type==='TENTACLE' && game.grid[y][x-1].organ.direction==='E') )|| (isCoordEqual && game.grid[y][x].protein)) && !( game.grid[y][x].organ?.owner===1 && game.grid[y][x].organ.type=== 'TENTACLE' && game.grid[y][x].organ.direction==='W') ) return true
        // right
        else if(x+1<width && game.grid[y][x+1].organ?.owner===0 && ( (!isCoordEqual && !(game.grid[y][x+1].organ.type==='TENTACLE' && game.grid[y][x+1].organ.direction==='W') ) || (isCoordEqual && game.grid[y][x].protein) ) && !( game.grid[y][x].organ?.owner===1 && game.grid[y][x].organ.type=== 'TENTACLE' && game.grid[y][x].organ.direction==='E')) return true
        else if(y-1>=0 && game.grid[y-1][x].organ?.owner===0 && ( (!isCoordEqual && !(game.grid[y-1][x].organ.type==='TENTACLE' && game.grid[y-1][x].organ.direction==='S')) || (isCoordEqual && game.grid[y][x].protein) ) && !( game.grid[y][x].organ?.owner===1 && game.grid[y][x].organ.type=== 'TENTACLE' && game.grid[y][x].organ.direction==='N')) return true
        else if(y+1<height && game.grid[y+1][x].organ?.owner===0 && ( (!isCoordEqual && !(game.grid[y+1][x].organ.type==='TENTACLE' && game.grid[y+1][x].organ.direction==='N') ) || (isCoordEqual && game.grid[y][x].protein)) && !( game.grid[y][x].organ?.owner===1 && game.grid[y][x].organ.type=== 'TENTACLE' && game.grid[y][x].organ.direction==='S')) return true
        //
        else if(x-2>=0 && game.grid[y][x-2].organ?.owner===0 && (!game.grid[y][x-1].organ?.id && !game.grid[y][x-1].isWall) && !( game.grid[y][x].organ?.owner===1 && game.grid[y][x].organ.type=== 'TENTACLE' && game.grid[y][x].organ.direction==='W')) return true
        // right
        else if(x+2<width && game.grid[y][x+2].organ?.owner===0 && (!game.grid[y][x+1].organ?.id && !game.grid[y][x+1].isWall) && !( game.grid[y][x].organ?.owner===1 && game.grid[y][x].organ.type=== 'TENTACLE' && game.grid[y][x].organ.direction==='E')) return true
        else if(y-2>=0 && game.grid[y-2][x].organ?.owner===0 && (!game.grid[y-1][x].organ?.id && !game.grid[y-1][x].isWall ) && !( game.grid[y][x].organ?.owner===1 && game.grid[y][x].organ.type=== 'TENTACLE' && game.grid[y][x].organ.direction==='N')) return true
        else if(y+2<height && game.grid[y+2][x].organ?.owner===0 && (!game.grid[y+1][x].organ?.id && !game.grid[y+1][x].isWall ) && !( game.grid[y][x].organ?.owner===1 && game.grid[y][x].organ.type=== 'TENTACLE' && game.grid[y][x].organ.direction==='S')) return true
        // gérer les cas latéraux par récurrence
        else return  false
    }
    const checkIsPossible = (x: number, y: number, game: Game) => {
        const res = []
        if(x-2>=0  && (!game.grid[y][x-1].organ?.id && !game.grid[y][x-1].isWall) && (!game.grid[y][x-2].organ?.id && !game.grid[y][x-2].isWall)) res.push([x-2,y])
        // right
         if(x+2<width  && (!game.grid[y][x+1].organ?.id && !game.grid[y][x+1].isWall) && (!game.grid[y][x+2].organ?.id && !game.grid[y][x+2].isWall)) res.push([x+2,y])
         if(y-2>=0 &&  (!game.grid[y-1][x].organ?.id && !game.grid[y-1][x].isWall ) && (!game.grid[y-2][x].organ?.id && !game.grid[y-2][x].isWall )) res.push([x,y-2])
         if(y+2<height && (!game.grid[y+1][x].organ?.id && !game.grid[y+1][x].isWall ) && (!game.grid[y+2][x].organ?.id && !game.grid[y+2][x].isWall )) res.push([x,y+2])
         // test avec les -1
         if(x-1>=0  && (!game.grid[y][x-1].organ?.id && !game.grid[y][x-1].isWall)) res.push([x-1,y])
            // right
        if(x+1<width  && (!game.grid[y][x+1].organ?.id && !game.grid[y][x+1].isWall)) res.push([x+1,y])
        if(y-1>=0 &&  (!game.grid[y-1][x].organ?.id && !game.grid[y-1][x].isWall )) res.push([x,y-1])
        if(y+1<height && (!game.grid[y+1][x].organ?.id && !game.grid[y+1][x].isWall )) res.push([x,y+1])
        return res
    }
    const dir = [[x2,y2]].concat(checkIsPossible(x2,y2,game))
    return dir.some(([x1,y1]) => isThereEnemyDepth0(x1,y1,game) )

}
const ennemyBeforeProtein = ([x,y] : number[], game : Game) => {
    let val = 0
    const isEnnemy = isThereEnemy(x,y,game)
    if(isEnnemy && game.myProteins.B>=1 && game.myProteins.C>=1) val=-3
    else if(isEnnemy && (game.myProteins.B===0 || game.myProteins.C===0)) return 1
    else if(isEnnemy && game.grid[y][x].protein) val=-4
    else if(game.grid[y][x].protein) return -1
    return val
}
const isThereProteinAhead = (x:number, y:number, game :Game) => {
    if(game.myProteins.C>=1 && game.myProteins.D>=1){
        // left
        if(x-1>=0 && game.grid[y][x-1].protein) return true
        // right
        else if(x+1<width && game.grid[y][x+1].protein) return true
       else if(y-1>=0 && game.grid[y-1][x].protein) return true
       if(y+1<height && game.grid[y+1][x].protein) return true
       else return  false
    } else return false
}
const isMyProtein = (x: number, y:number, game:Game, myOrgansId:number[],proteinsListCoord:number[][], ennemyBefore : boolean,isAllBlocked ) =>  {
    /***
     * Gérer le cas où on va vers une protéine et le premier est un protéine lié à un HARVESTER (également gérer la direection du HARVESTER)
     * Dans ce cas ne pas prendre ce chemin
     * 
     * Gérer le cas où on ne peut passer car on a trop de HARVESTER
     */
    const isEnnemy = isThereEnemy(x,y,game)
    if(game.grid[y][x].protein && (!isAllBlocked /*|| !isEnnemy*/)){
        // console.error('isMyProtein :',[x,y])
        // console.error('proteinsListCoordIsMyProtBB :',proteinsListCoord)
        if(x-1>=0 && myOrgansId.includes(game.grid[y][x-1].organ?.id) /*&& myOrgansId.includes(game.grid[initPath[1]][initPath[0]].organ?.id)*/&& game.grid[y][x-1].organ.type==='HARVESTER' && game.grid[y][x-1].organ.direction==='E' && !isEnnemy/*&& !isThereProteinAhead(x,y,game)*/) {
            const index=proteinsListCoord.findIndex(val=> val.join(',')===[x,y].join(','))
            // console.error('index :',index)
            if(index!==-1) proteinsListCoord.splice(index,1)
            // console.error('proteinsListCoordIsMyProtAAL :',proteinsListCoord)
            return false
        }
        else if(x+1<width && myOrgansId.includes(game.grid[y][x+1].organ?.id)/*&& myOrgansId.includes(game.grid[initPath[1]][initPath[0]].organ?.id)*/ && game.grid[y][x+1].organ.type==='HARVESTER' && game.grid[y][x+1].organ.direction==='W' && !isEnnemy /*&& !isThereProteinAhead(x,y,game)*/) {
            const index=proteinsListCoord.findIndex(val=> val.join(',')===[x,y].join(','))
            if(index!==-1) proteinsListCoord.splice(index,1)
            // console.error('proteinsListCoordIsMyProtAAR :',proteinsListCoord)
            return false
        }
        else if(y-1>=0 && myOrgansId.includes(game.grid[y-1][x].organ?.id) /*&& myOrgansId.includes(game.grid[initPath[1]][initPath[0]].organ?.id)*/ && game.grid[y-1][x].organ.type==='HARVESTER' && game.grid[y-1][x].organ.direction==='S' && !isEnnemy/*&& !isThereProteinAhead(x,y,game)*/) {
            const index=proteinsListCoord.findIndex(val=> val.join(',')===[x,y].join(','))
            if(index!==-1) proteinsListCoord.splice(index,1)
            // console.error('proteinsListCoordIsMyProtAAU :',proteinsListCoord)
            return false
        }
        else if(y+1<height && myOrgansId.includes(game.grid[y+1][x].organ?.id) /*&& myOrgansId.includes(game.grid[initPath[1]][initPath[0]].organ?.id)*/ && game.grid[y+1][x].organ.type==='HARVESTER' && game.grid[y+1][x].organ.direction==='N' && !isEnnemy/*&& !isThereProteinAhead(x,y,game)*/){
            const index=proteinsListCoord.findIndex(val=> val.join(',')===[x,y].join(','))
            if(index!==-1) proteinsListCoord.splice(index,1)
            // console.error('proteinsListCoordIsMyProtAAD :',proteinsListCoord)
            return false
        } else if(ennemyBefore && !isEnnemy) return false
        // else if(!restreindreHarveester(game.grid[y][x].protein,game)) return false
        else return true
    }   
    else {
        // if(x-1>=0 && game.grid[y][x-1].organ?.owner===0) return false
        return true
    }
}
const hasTentacle = (game : Game, x:number ,y:number, ownTrigger : boolean, attackOpponent: boolean ) => {

    // attackOpponent m'est utilise (à true que pour un fonction que j'ai créée pour l'attaque de l' ennemi)
    /****
     * Il faut choisir le cas où on tue le plus d'oragnisme et supprimer les potentiels élements supprimé pour ne 
     * pas les retureer
     * 
     * Egalement gérer le cas lorsqu'on essaie d'esquiver les tentacles adverses ou lorsqu'on pose nos propres tentacles(#)
     * 
     */
    // console.error('enter hier Tentacle')
    // console.error('final Result : ')
    const finalResult : [string, [number,number],number][]= [] // step est la distance entre la pos actuelle etle prochain ennemi
    const type = !ownTrigger?['TENTACLE']:['BASIC','HARVESTER','ROOT','SPORER','TENTACLE']
    // left
    if( (x-1>=0 &&(game.grid[y][x-1].organ?.owner===0 && type.includes(game.grid[y][x-1].organ?.type) && (game.grid[y][x-1].organ?.direction==='E' || ownTrigger ))) /*|| (ownTrigger && x-2>=0 &&(game.grid[y][x-2].organ?.owner===0 && !game.grid[y][x-1].organ?.id  && type.includes(game.grid[y][x-2].organ?.type)) )*/ )/*return {bool:true,dir:'W'}*/ finalResult.push(['W',[x-1,y],1])
    else if((ownTrigger && x-2>=0 &&(game.grid[y][x-2].organ?.owner===0 && (!game.grid[y][x-1].organ?.id && !game.grid[y][x-1].isWall)  && type.includes(game.grid[y][x-2].organ?.type)) ))  finalResult.push(['W',[x-1,y],2])
    // surface latérale
    else if((ownTrigger && x-1>=0 &&( y-1>=0 && game.grid[y-1][x-1].organ?.owner===0 && (!game.grid[y][x-1].organ?.id && !game.grid[y][x-1].isWall)  && type.includes(game.grid[y-1][x-1].organ?.type)) ))  finalResult.push(['W',[x-1,y],2])
    else if((ownTrigger && x-1>=0 &&( y+1<height && game.grid[y+1][x-1].organ?.owner===0 && (!game.grid[y][x-1].organ?.id && !game.grid[y][x-1].isWall)  && type.includes(game.grid[y+1][x-1].organ?.type)) ))  finalResult.push(['W',[x-1,y],2])

    if( (x+1<width &&(game.grid[y][x+1].organ?.owner===0 && type.includes(game.grid[y][x+1].organ?.type) && (game.grid[y][x+1].organ?.direction==='W' || ownTrigger))) /*|| (ownTrigger && x+2<width &&(game.grid[y][x+2].organ?.owner===0 && !game.grid[y][x+1].organ?.id && type.includes(game.grid[y][x+2].organ?.type)))*/ )/* return {bool:true,dir:'E'}*/ finalResult.push(['E',[x+1,y],1])
    else if((ownTrigger && x+2<width &&(game.grid[y][x+2].organ?.owner===0 && (!game.grid[y][x+1].organ?.id && !game.grid[y][x+1].isWall) && type.includes(game.grid[y][x+2].organ?.type))))  finalResult.push(['E',[x+1,y],2])
    // surface latérale
    else if((ownTrigger && x+1<width &&( y-1>=0 && game.grid[y-1][x+1].organ?.owner===0 && (!game.grid[y][x+1].organ?.id && !game.grid[y][x+1].isWall)  && type.includes(game.grid[y-1][x+1].organ?.type)) ))  finalResult.push(['E',[x+1,y],2])
    else if((ownTrigger && x+1<width &&( y+1<height && game.grid[y+1][x+1].organ?.owner===0 && (!game.grid[y][x+1].organ?.id && !game.grid[y][x+1].isWall)  && type.includes(game.grid[y+1][x+1].organ?.type)) ))  finalResult.push(['E',[x+1,y],2])


    if( (y-1>=0 &&(game.grid[y-1][x].organ?.owner===0 && type.includes(game.grid[y-1][x].organ?.type) && (game.grid[y-1][x].organ?.direction==='S' || ownTrigger))) /*|| (ownTrigger && y-2>=0 && game.grid[y-2][x].organ?.owner===0 && !game.grid[y-1][x].organ?.id  && type.includes(game.grid[y-2][x].organ?.type))*/ )/* return {bool:true,dir:'N'}*/ finalResult.push(['N',[x,y-1],1])
    else if( (ownTrigger && y-2>=0 && game.grid[y-2][x].organ?.owner===0 && (!game.grid[y-1][x].organ?.id && !game.grid[y-1][x].isWall)  && type.includes(game.grid[y-2][x].organ?.type))) finalResult.push(['N',[x,y-1],2])
    // surface latérale
    else if( (ownTrigger && y-1>=0 && x-1>=0 && game.grid[y-1][x-1].organ?.owner===0 && (!game.grid[y-1][x].organ?.id && !game.grid[y-1][x].isWall)  && type.includes(game.grid[y-1][x-1].organ?.type))) finalResult.push(['N',[x,y-1],2])
    else if( (ownTrigger && y-1>=0 && x+1<width && game.grid[y-1][x+1].organ?.owner===0 && (!game.grid[y-1][x].organ?.id && !game.grid[y-1][x].isWall)  && type.includes(game.grid[y-1][x+1].organ?.type))) finalResult.push(['N',[x,y-1],2])

    if( (y+1<height &&(game.grid[y+1][x].organ?.owner===0 && type.includes(game.grid[y+1][x].organ?.type) && (game.grid[y+1][x].organ?.direction==='N' || ownTrigger))) /*|| (ownTrigger && y+2<height && game.grid[y+2][x].organ?.owner===0 && !game.grid[y+1][x].organ?.id && type.includes(game.grid[y+2][x].organ?.type) )*/ ) /*return {bool:true,dir:'S'}*/ finalResult.push(['S',[x,y+1],1])
    else if((ownTrigger && y+2<height && game.grid[y+2][x].organ?.owner===0 && (!game.grid[y+1][x].organ?.id && !game.grid[y+1][x].isWall) && type.includes(game.grid[y+2][x].organ?.type) ) ) finalResult.push(['S',[x,y+1],2])
    // surface latérale
    else if( (ownTrigger && y+1<height && x-1>=0 && game.grid[y+1][x-1].organ?.owner===0 && (!game.grid[y+1][x].organ?.id && !game.grid[y+1][x].isWall)  && type.includes(game.grid[y+1][x-1].organ?.type))) finalResult.push(['S',[x,y+1],2])
    else if( (ownTrigger && y+1<height && x+1<width && game.grid[y+1][x+1].organ?.owner===0 && (!game.grid[y+1][x].organ?.id && !game.grid[y+1][x].isWall)  && type.includes(game.grid[y+1][x+1].organ?.type))) finalResult.push(['S',[x,y+1],2])
    // else return {bool:false,dir:''}
    if(attackOpponent){
        const finalResultWithOpponentsCoords = finalResult.filter(([dir,[x1, y1], step]) => step ===2 )
        return  finalResultWithOpponentsCoords.length?{bool:true,dir:finalResultWithOpponentsCoords[0][0], coordOpps: finalResultWithOpponentsCoords[0][1] } : {bool:false,dir:'',coordOpps: [-1,-1]}       
    }
    if(ownTrigger) {
        const finalResultWithOpponentsCoords : [string,[number, number][],[number,number], number ][] = finalResult.map(([dir,[x1, y1], step]) => [dir,game.oppOrgans.filter((organ :Organ) => organ.parentId ===game.grid[y1][x1].organ?.id).map(organ => organ.position),[x1,y1], step])
        finalResultWithOpponentsCoords.sort((a,b)=> {
            if(a[3]<b[3]) return -1
            else if(a[3]>b[3]) return 1
            else return  b[1].length-a[1].length
        })
        if(game.myProteins.B>=1 && game.myProteins.C>=1 && finalResultWithOpponentsCoords.length) {
            finalResultWithOpponentsCoords[0][1].forEach(([x2,y2]) => game.grid[y2][x2].isWall=true)
            const [xI, yI]= finalResultWithOpponentsCoords[0][2]
            game.grid[yI][xI].isWall=true
        }
        // console.error('final Result : ',finalResult)
        // console.error('final ResulEleme : ',finalResult.length?game.grid[finalResult[0][1][1]][finalResult[0][1][0]]:'None')
        return  finalResultWithOpponentsCoords.length?{bool:true,dir:finalResultWithOpponentsCoords[0][0], coordOpps: finalResultWithOpponentsCoords[0][2] } : {bool:false,dir:'',coordOpps: [-1,-1]}
    }
    else return finalResult.length?{bool:true,dir:finalResult[0][0], coordOpps:finalResult[0][1] } : {bool:false,dir:'', coordOpps:[-1,-1]}

}

const poursuivre = (game : Game, x:number ,y:number) => {
    if(x-1>=0 &&(game.grid[y][x-1].organ?.owner===0)) return true
    else if(x+1<width &&(game.grid[y][x+1].organ?.owner===0)) return true
    else if(y-1>=0 &&(game.grid[y-1][x].organ?.owner===0) ) return true
    else if(y+1<height &&(game.grid[y+1][x].organ?.owner===0)) return true
    else return false
}
const sporer  = (game : Game, path: number[][],test : boolean, isAllBlocked : boolean, myOrgansId: number[]) => {
    let Eindex=-1
    let prevEindex=path[0][0]
    let Sindex=-1
    let prevSindex=path[0][1]
    let Windex=-1
    let prevWindex=-1
    let Nindex=-1
    let prevNindex=-1
    let res : {bool: boolean,type:string, dir: string,coord:number[],val:number,protein:string, coordSpore:number[]} = {bool: false,type:'', dir: '',coord: [-1,-1],val:0,protein:'',coordSpore: [-1,-1]}
    const Res : {bool: boolean,type:string, dir: string,coord:number[],val:number,protein:string, coordSpore:number[]}[] = [] // Res va recenser toutes les combinaisons possibles puis après , on prendra celui qui va plus loin
        // EAST
        while((Eindex=game.grid[path[0][1]].slice(prevEindex+1).findIndex((val :GridElement)=> ( val.protein && isMyProtein(val.position[0], val.position[1],game,myOrgansId,[],false,isAllBlocked) ) || (val.organ?.owner===0 && /*!hasTentacle(game, val.position[0], val.position[1], false).bool*/!(val.organ?.type ==='TENTACLE' && val.organ?.direction==='W') || (!val.isWall /*&& isAllBlocked*/ && !val.organ?.id && !val.protein)  )))!==-1) {
            const indexWeCan = game.grid[path[0][1]].slice(path[0][0]+1,prevEindex+1+Eindex).findIndex((val : GridElement)=> val.isWall || val.organ)
            if(indexWeCan===-1 /*&& (prevEindex+1+Eindex)-2>path[0][0]*/){
 
                res.bool=true
                res.type='SPORER'
                res.dir='E'
                res.val=-1
                // res.coordSpore= [path[0][1],prevEindex+1+Eindex].reverse()
                // return res
                // on regarde si c'est possible plus tard de placer un sporer en haut ou en bas
                if(game.grid[path[0][1]][prevEindex+1+Eindex].protein && (prevEindex+1+Eindex)-2>path[0][0]){
                    // c'est un protéine
                    res.coordSpore= [path[0][1],(prevEindex+1+Eindex)-2].reverse() // coordonnées du spore
                    res.coord = [path[0][1],prevEindex+1+Eindex].reverse() // coordonnées de la protéine
                    res.protein = game.grid[path[0][1]][prevEindex+1+Eindex].protein
                    Res.push({...res})
                } else if(!game.grid[path[0][1]][prevEindex+1+Eindex].protein && !game.grid[path[0][1]][prevEindex+1+Eindex].organ?.id) {
                    // c'est un espace vide
                    res.coordSpore = [path[0][1],prevEindex+1+Eindex].reverse()
                    const [x,y] = [path[0][1],prevEindex+1+Eindex].reverse()
                    // on gère le cas on essaie en haut
                    if(y-1>=0 && (!game.grid[y-1][x].isWall && !game.grid[y-1][x].protein && !game.grid[y-1][x].organ?.id)){
                         // haut
                         if(y-2>=0 && game.grid[y-2][x].protein) res.protein = game.grid[y-2][x].protein, res.coord=[y-2,x].reverse(), Res.push({... res})
                        // gauche
                         if(x-1>=0 && game.grid[y-1][x-1].protein) res.protein = game.grid[y-1][x-1].protein, res.coord=[y-1,x-1].reverse(), Res.push({... res})
                        // droite 
                        if(x+1< width && game.grid[y-1][x+1].protein) res.protein = game.grid[y-1][x+1].protein, res.coord=[y-1,x+1].reverse(), Res.push({... res})
                    }
                    
                    // gérer le cas du bas
                    if(y+1<height && (!game.grid[y+1][x].isWall && !game.grid[y+1][x].protein) && !game.grid[y+1][x].organ?.id){
                        // bas
                        if(y+2<height && game.grid[y+2][x].protein) res.protein = game.grid[y+2][x].protein, res.coord=[y+2,x].reverse(), Res.push({... res})
                       // gauche
                        if(x-1>=0 && game.grid[y+1][x-1].protein) res.protein = game.grid[y+1][x-1].protein, res.coord=[y+1,x-1].reverse(), Res.push({... res})
                       // droite 
                       if(x+1< width && game.grid[y+1][x+1].protein) res.protein = game.grid[y+1][x+1].protein, res.coord=[y+1,x+1].reverse(), Res.push({... res})
                    }

                    // gérer le cas de l'ouest (W)
                    if(x-1>=0 && ( !game.grid[y][x-1].protein) && x-2>=0 && game.grid[y][x-2].protein ) {
                        res.coord = [x-2,y] // coordonnées du spore
                        res.protein = game.grid[y][x-2].protein
                        Res.push({... res})
                    }

                } else if(game.grid[path[0][1]][prevEindex+1+Eindex].organ?.owner===0) {
                    // c'est un ennemi
                    console.error('COORD :',[path[0][1],prevEindex+1+Eindex].reverse())
                    res.coordSpore = [path[0][1],prevEindex+1+Eindex-1].reverse() // se mettre à -1 de l'ennemi (east)
                    res.coord = [prevEindex+1+Eindex, path[0][1]]
                    res.protein = ''
                    if(!hasTentacle(game, prevEindex+1+Eindex-1, path[0][1], false,false).bool) Res.push({...res})
                    else res.bool = false
                } else res.bool = false
                prevEindex+=(1+Eindex)
            } else if(indexWeCan !==-1) break
            else prevEindex+=(1+Eindex)
        }
    // WEST
    while((Windex=game.grid[path[0][1]].slice(prevWindex+1,path[0][0]).findIndex((val :GridElement)=> ( val.protein && isMyProtein(val.position[0], val.position[1],game,myOrgansId,[],false,isAllBlocked) ) || (val.organ?.owner===0 && /*!hasTentacle(game, val.position[0], val.position[1], false).bool*/ !(val.organ?.type ==='TENTACLE' && val.organ?.direction==='E'))    || (!val.isWall /*&& isAllBlocked*/ && !val.organ?.id && !val.protein) ))!==-1) {
        const indexWeCan = game.grid[path[0][1]].slice(prevWindex+1+Windex+1,path[0][0]).findIndex((val : GridElement)=> val.isWall || val.organ)
        if(indexWeCan ===-1 /*&& (Windex+prevWindex+1)+2<path[0][0]*/){
            res.bool=true
            res.type='SPORER'
            res.dir='W'
            res.val=-1
            // res.coord = [path[0][1],Windex+prevWindex+1].reverse()
            if(game.grid[path[0][1]][Windex+prevWindex+1].protein && (Windex+prevWindex+1)+2<path[0][0]){
                console.error('Nice Enter')
                console.error('iSmYproteine :', isMyProtein(Windex+prevWindex+1, path[0][1],game,myOrgansId,[],false,isAllBlocked) )
                // c'est un protéine
                res.coordSpore= [path[0][1],(Windex+prevWindex+1)+2].reverse() // coordonnées du spore
                res.coord = [path[0][1],Windex+prevWindex+1].reverse() // coordonnées de la protéine
                res.protein = game.grid[path[0][1]][Windex+prevWindex+1].protein
                Res.push({...res})
            } else if(!game.grid[path[0][1]][Windex+prevWindex+1].protein && !game.grid[path[0][1]][Windex+prevWindex+1].organ?.id) {
                // c'est un espace vide
                res.coordSpore = [path[0][1],Windex+prevWindex+1].reverse()
                const [x,y] = [path[0][1],Windex+prevWindex+1].reverse()
                // on gère le cas on essaie en haut
                if(y-1>=0 && (!game.grid[y-1][x].isWall && !game.grid[y-1][x].protein) && !game.grid[y-1][x].organ?.id){
                     // haut
                     if(y-2>=0 && game.grid[y-2][x].protein) res.protein = game.grid[y-2][x].protein, res.coord=[y-2,x].reverse(), Res.push({... res})
                    // gauche
                     if(x-1>=0 && game.grid[y-1][x-1].protein) res.protein = game.grid[y-1][x-1].protein, res.coord=[y-1,x-1].reverse(), Res.push({... res})
                    // droite 
                    if(x+1< width && game.grid[y-1][x+1].protein) res.protein = game.grid[y-1][x+1].protein, res.coord=[y-1,x+1].reverse(), Res.push({... res})
                }
                
                // gérer le cas du bas
                if(y+1<height && (!game.grid[y+1][x].isWall && !game.grid[y+1][x].protein) && !game.grid[y+1][x].organ?.id){
                    // bas
                    if(y+2<height && game.grid[y+2][x].protein) res.protein = game.grid[y+2][x].protein, res.coord=[y+2,x].reverse(), Res.push({... res})
                   // gauche
                    if(x-1>=0 && game.grid[y+1][x-1].protein) res.protein = game.grid[y+1][x-1].protein, res.coord=[y+1,x-1].reverse(), Res.push({... res})
                   // droite 
                   if(x+1< width && game.grid[y+1][x+1].protein) res.protein = game.grid[y+1][x+1].protein, res.coord=[y+1,x+1].reverse(), Res.push({... res})
                }

                // gérer le cas de l'est (E)
                if(x+1<width && ( !game.grid[y][x+1].protein) && x+2<width && game.grid[y][x+2].protein ) {
                    res.coord = [x+2,y] // coordonnées de la protéine
                    res.protein = game.grid[y][x+2].protein
                    Res.push({... res})
                }

            } else if(game.grid[path[0][1]][Windex+prevWindex+1].organ?.owner===0) {
                // c'est un ennemi
                res.coordSpore = [path[0][1],Windex+prevWindex+1+1].reverse() // se mettre à +1 de l'ennemi (ouest)
                res.coord= [Windex+prevWindex+1, path[0][1]]
                res.protein = ''
                if(!hasTentacle(game, Windex+prevWindex+1+1, path[0][1], false,false).bool) Res.push({...res})
                else res.bool = false
            } else res.bool = false
            // return res
            prevWindex+=(Windex+1)
        }
        else prevWindex+=(Windex+1)
    }
    // NORTH
    while((Nindex= [... Array(height).keys()].map(j=>game.grid[j][path[0][0]]).slice(prevNindex+1,path[0][1]).findIndex((val :GridElement)=> ( val.protein && isMyProtein(val.position[0], val.position[1],game,myOrgansId,[],false,isAllBlocked) ) || (val.organ?.owner===0 && /*!hasTentacle(game, val.position[0], val.position[1], false).bool*/ !(val.organ?.type ==='TENTACLE' && val.organ?.direction==='S')) || (!val.isWall /*&& isAllBlocked*/ && !val.organ?.id && !val.protein)))!==-1) {
        const indexWeCan = [... Array(height).keys()].map(j=>game.grid[j][path[0][0]]).slice(prevNindex+1+Nindex+1,path[0][1]).findIndex((val : GridElement)=> val.isWall || val.organ)
        if(indexWeCan ===-1 /*&& (prevNindex+1+Nindex)+2<path[0][1]*/){
            // enter=true
            res.bool=true
            res.type='SPORER'
            res.dir='N'
            res.val=-1
            // res.coord = [prevNindex+1+Nindex,path[0][0]].reverse()
            if(game.grid[prevNindex+1+Nindex][path[0][0]].protein && (prevNindex+1+Nindex)+2<path[0][1]){
                // c'est un protéine
                res.coordSpore= [(prevNindex+1+Nindex)+2,path[0][0]].reverse() // coordonnées du spore
                res.coord = [prevNindex+1+Nindex,path[0][0]].reverse() // coordonnées de la protéine
                res.protein = game.grid[prevNindex+1+Nindex][path[0][0]].protein
                Res.push({...res})
            } else if(!game.grid[prevNindex+1+Nindex][path[0][0]].protein && !game.grid[prevNindex+1+Nindex][path[0][0]].organ?.id) {
                // c'est un espace vide
                res.coordSpore = [prevNindex+1+Nindex,path[0][0]].reverse()
                const [x,y] = [prevNindex+1+Nindex,path[0][0]].reverse()
                // on gère le cas on essaie à gauche
                if(x-1>=0 && (!game.grid[y][x-1].isWall && !game.grid[y][x-1].protein) && !game.grid[y][x-1].organ?.id){
                     // gauche
                     if(x-2>=0 && game.grid[y][x-2].protein) res.protein = game.grid[y][x-2].protein, res.coord=[y,x-2].reverse(), Res.push({... res})
                    // haut
                     if(y-1>=0 && game.grid[y-1][x-1].protein) res.protein = game.grid[y-1][x-1].protein, res.coord=[y-1,x-1].reverse(), Res.push({... res})
                    // bas
                    if(y+1< height && game.grid[y+1][x-1].protein) res.protein = game.grid[y+1][x-1].protein, res.coord=[y+1,x-1].reverse(), Res.push({... res})
                }
                
                // gérer le cas de droite
                if(x+1<width && (!game.grid[y][x+1].isWall && !game.grid[y][x+1].protein) && !game.grid[y][x+1].organ?.id){
                    // droite
                    if(x+2<width && game.grid[y][x+2].protein) res.protein = game.grid[y][x+2].protein, res.coord=[y,x+2].reverse(), Res.push({... res})
                   // haut
                    if(y-1>=0 && game.grid[y-1][x+1].protein) res.protein = game.grid[y-1][x+1].protein, res.coord=[y-1,x+1].reverse(), Res.push({... res})
                   // bas
                   if(y+1< height && game.grid[y+1][x+1].protein) res.protein = game.grid[y+1][x+1].protein, res.coord=[y+1,x+1].reverse(), Res.push({... res})
               }

                // gérer le cas du sud (S)
                if(y+1<height && ( !game.grid[y+1][x].protein) && y+2<height && game.grid[y+2][x].protein ) {
                    res.coord = [x,y+2] // coordonnées de la protéine
                    res.protein = game.grid[y+2][x].protein
                    Res.push({... res})
                }

            } else if(game.grid[prevNindex+1+Nindex][path[0][0]].organ?.owner===0){
                // c'est un ennemi
                res.coordSpore = [prevNindex+1+Nindex+1,path[0][0]].reverse() // se mettre à +1 de l'ennemi (sud)
                res.coord = [path[0][0], prevNindex+1+Nindex]
                res.protein=''
                if(!hasTentacle(game, path[0][0],prevNindex+1+Nindex+1, false,false).bool) Res.push({...res})
                else res.bool = false
            } else res.bool = false
            // return res
            prevNindex+=(1+Nindex)
        }
        else prevNindex+=(1+Nindex)
    }
    // SOUTH
    while((Sindex= [... Array(height).keys()].map(j=>game.grid[j][path[0][0]]).slice(prevSindex+1).findIndex((val :GridElement)=> ( val.protein && isMyProtein(val.position[0], val.position[1],game,myOrgansId,[],false, isAllBlocked) ) || (val.organ?.owner===0 && /*!hasTentacle(game, val.position[0], val.position[1], false).bool*/!(val.organ?.type ==='TENTACLE' && val.organ?.direction==='N')) || (!val.isWall /*&& isAllBlocked*/ && !val.organ?.id && !val.protein)))!==-1) {
        const indexWeCan =  [... Array(height).keys()].map(j=>game.grid[j][path[0][0]]).slice(path[0][1]+1,prevSindex+1+Sindex).findIndex((val : GridElement)=> val.isWall || val.organ)
        if(indexWeCan ===-1 /*&& (prevSindex+1+Sindex) -2>path[0][1]*/){
            // enter=true
            res.bool=true
            res.type='SPORER'
            res.dir='S'
            res.val=-1
            // res.coord = [prevSindex+1+Sindex,path[0][0]].reverse()
            if(game.grid[prevSindex+1+Sindex][path[0][0]].protein && (prevSindex+1+Sindex) -2>path[0][1]){
                // c'est un protéine
                res.coordSpore= [(prevSindex+1+Sindex) -2,path[0][0]].reverse() // coordonnées du spore
                res.coord = [prevSindex+1+Sindex,path[0][0]].reverse() // coordonnées de la protéine
                res.protein = game.grid[prevSindex+1+Sindex][path[0][0]].protein
                Res.push({...res})
            } else if(!game.grid[prevSindex+1+Sindex][path[0][0]].protein && !game.grid[prevSindex+1+Sindex][path[0][0]].organ?.id) {
                // c'est un espace vide
                res.coordSpore = [prevSindex+1+Sindex,path[0][0]].reverse()
                const [x,y] = [prevSindex+1+Sindex,path[0][0]].reverse()
                // on gère le cas on essaie à gauche
                if(x-1>=0 && (!game.grid[y][x-1].isWall && !game.grid[y][x-1].protein) && !game.grid[y][x-1].organ?.id){
                     // gauche
                     if(x-2>=0 && game.grid[y][x-2].protein) res.protein = game.grid[y][x-2].protein, res.coord=[y,x-2].reverse(), Res.push({... res})
                    // haut
                     if(y-1>=0 && game.grid[y-1][x-1].protein) res.protein = game.grid[y-1][x-1].protein, res.coord=[y-1,x-1].reverse(), Res.push({... res})
                    // bas
                    if(y+1< height && game.grid[y+1][x-1].protein) res.protein = game.grid[y+1][x-1].protein, res.coord=[y+1,x-1].reverse(), Res.push({... res})
                }
                
                // gérer le cas de droite
                if(x+1<width && (!game.grid[y][x+1].isWall && !game.grid[y][x+1].protein) && !game.grid[y][x+1].organ?.id){
                    // droite
                    if(x+2<width && game.grid[y][x+2].protein) res.protein = game.grid[y][x+2].protein, res.coord=[y,x+2].reverse(), Res.push({... res})
                   // haut
                    if(y-1>=0 && game.grid[y-1][x+1].protein) res.protein = game.grid[y-1][x+1].protein, res.coord=[y-1,x+1].reverse(), Res.push({... res})
                   // bas
                   if(y+1< height && game.grid[y+1][x+1].protein) res.protein = game.grid[y+1][x+1].protein, res.coord=[y+1,x+1].reverse(), Res.push({... res})
               }

                // gérer le cas du sud (N)
                if(y-1>=0 && ( !game.grid[y-1][x].protein) && y-2>=0 && game.grid[y-2][x].protein ) {
                    res.coord = [x,y-2] // coordonnées de la protéine
                    res.protein = game.grid[y-2][x].protein
                    Res.push({... res})
                }

            } else if(game.grid[prevSindex+1+Sindex][path[0][0]].organ?.owner===0){
                console.error('enter hier ennnnnnne')
                // c'est un ennemi
                res.coordSpore = [prevSindex+1+Sindex-1,path[0][0]].reverse() // se mettre à -1 de l'ennemi (nord)
                res.coord  = [path[0][0], prevSindex+1+Sindex]
                res.protein=''
                console.error('res :', res)
                if(!hasTentacle(game, path[0][0],prevSindex+1+Sindex-1, false,false).bool) Res.push({...res})
                else res.bool = false
            } else res.bool = false
            // return res
            prevSindex+=(1+Sindex)
        } else if(indexWeCan !==-1) break
        else prevSindex+=(1+Sindex)
    }
    const [x1,y1] = path[0]

    /***
     * Ici on essayer de priorer les protéines
     */
    let val  = {B:-3,C:-2,A:-1,D:0}
    const mini = Math.min(game.myProteins.B,game.myProteins.C)
    if(mini === game.myProteins.B) val.B=-3, val.C=-2
    else val.C=-3, val.B=-2
    const keys = Object.keys(proteinsRepartition).sort((k1: string, k2:string )=> {
        if(proteinsRepartition[k2].length -  proteinsRepartition[k1].length>0) return -1
        else if(proteinsRepartition[k2].length -  proteinsRepartition[k1].length<0) return 1
        else return val[k1]- val[k2]

    })
    for(let i=1; i<=4;i++) val[keys[i-1]]=i  // on met les valeurs pour le sort en fonction des priorités
    console.error('val : ',val)
    // console.error('List sporer Before :', Res) 
    // console.error('value :', val[Res[0].protein])
    Res.sort((a,b) => {
        // console.error('a :', a)
        // console.error('b :', b)
        // if ( (val[a.protein] || +Infinity) - (val[b.protein] || +Infinity) <0 ) return -1
        // else if((val[a.protein] || +Infinity) - (val[b.protein] || +Infinity) >0 ) return 1
        // else return distance([x1,y1],[b.coord[0],b.coord[1]]) - distance([x1,y1],[a.coord[0],a.coord[1]])
        if(distance([x1,y1],[b.coord[0],b.coord[1]]) - distance([x1,y1],[a.coord[0],a.coord[1]])>0) return 1
        else if(distance([x1,y1],[b.coord[0],b.coord[1]]) - distance([x1,y1],[a.coord[0],a.coord[1]])<0) return -1
        else return (val[a.protein] || +Infinity) - (val[b.protein] || +Infinity)
    })
    if(!test && Res.length){
        const [x2,y2] = Res[0].coord
        game.myProteins.B--
        game.myProteins.D--
        if(x2<width && x2>=0 && y2<height && y2>=0)  game.grid[y2][x2].isWall=true
    }
    console.error('List sporer :', Res) 
    // console.error('Coord Path :', [x1,y1])
    return Res.length?Res[0]:{bool: false,type:'', dir: '',coord: [-1,-1],val:0,protein:'',coordSpore: [-1,-1]}
}

const canSpore = (game : Game, sporeOrgans : Organ[], allOrProteins: boolean, myOrgansId : number[]) => {
    for(const sporeOrgan of sporeOrgans) {
        const res = sporer(game,[sporeOrgan.position],true,/*rootsId.length>1?isAllBlocked : true*//*isAllBlocked*/allOrProteins, myOrgansId)
        if(res.bool && res.dir === sporeOrgan.direction) return [res,sporeOrgan.id] as [{bool: boolean,type:string, dir: string,coord:number[],val:number,protein:string, coordSpore:number[]} ,number]
    }
    return false
}

const sporeImmediately =  (game : Game, sporerOrgans : Organ[], allOrProteins  : boolean, myOrgansId : number[]) => {
    const nb = allOrProteins ?1:2
    if(game.myProteins.A>=1 && game.myProteins.B>=1 && game.myProteins.C>=nb && game.myProteins.D>=nb ){
        const canISpore = canSpore(game,sporerOrgans, allOrProteins, myOrgansId)
        if(canISpore){
                        // pas très propre mais on supposera que lorsqu'on spore pour le tour l'élement devient un mur pour ne pas induire
            // en erreur les autres organes
            const [res,organId] = canISpore
            // const [x,y]= res.coord
           /* if(res.dir==='E' && res.coord[0]-2>=0){
                res.coord[0]=res.coord[0]-2
                if(!hasTentacle(game,res.coord[0],res.coord[1],false).bool){
                    game.grid[y][x].isWall=true
                    return `SPORE ${organId} ${res.coord.join(' ')}`
                }
            }
            else if(res.dir==='W' && res.coord[0]+2<width){
                res.coord[0]=res.coord[0]+2
                if(!hasTentacle(game,res.coord[0],res.coord[1],false).bool){
                    game.grid[y][x].isWall=true
                    return `SPORE ${organId} ${res.coord.join(' ')}`
                }
            }
            else if(res.dir==='N' && res.coord[1]+2<height){
                res.coord[1]=res.coord[1]+2
                if(!hasTentacle(game,res.coord[0],res.coord[1],false).bool){
                    game.grid[y][x].isWall=true
                    return `SPORE ${organId} ${res.coord.join(' ')}`
                }
            } 
            else if(res.dir==='S' && res.coord[1]-2>=0){
                res.coord[1]=res.coord[1]-2
                if(!hasTentacle(game,res.coord[0],res.coord[1],false).bool){
                    game.grid[y][x].isWall=true
                    return `SPORE ${organId} ${res.coord.join(' ')}`
                }
            }*/
            return `SPORE ${organId} ${res.coordSpore.join(' ')}`
        }

        // si je ne peux pas spore et que c'était la fin pour cet organisme là on essaie d'elargir au maximum notre organisme en sporant dans
        // une direction libre et on oublie par de  EndGame[organismeId]=false
    }

}
const checkIfHARVESTEROnAandB = (game : Game, havesterOrgans: Organ[]) => {
    let havesterOnB = false
    let havesterOnC = false
    havesterOrgans.forEach((havesterOrgan :Organ) => {
        const [x,y] = havesterOrgan.position
        if(havesterOrgan.direction==='E') {
            if( x+1<width && game.grid[y][x+1].protein==='B') havesterOnB =true
            else if(x+1<width && game.grid[y][x+1].protein==='C') havesterOnC=true
        } 
        else if(havesterOrgan.direction==='W') {
            if(x-1>=0 && game.grid[y][x-1].protein==='B') havesterOnB =true
            else if(x-1>=0 &&game.grid[y][x-1].protein==='C') havesterOnC=true
        } 
        else if(havesterOrgan.direction==='N') {
            if(y-1>=0 && game.grid[y-1][x].protein==='B') havesterOnB =true
            else if(y-1>=0 && game.grid[y-1][x].protein==='C') havesterOnC=true
        } 
        if(havesterOrgan.direction==='S') {
            if(y+1<height && game.grid[y+1][x].protein==='B') havesterOnB =true
            else if(y+1<height && game.grid[y+1][x].protein==='C') havesterOnC=true
        } 
    })
    // console.error('havesterOnB :',havesterOnB)
    // console.error('havesterOnC :',havesterOnC)
    return havesterOnB &&  havesterOnC

}
const compareProteins = ([xi1, yi1] :[number, number], [xi2, yi2] :[number, number], nbProteins : number[][], game: Game) => {
    let val  = {B:-3,C:-2,A:-1,D:0}
    const mini = Math.min(game.myProteins.B,game.myProteins.C)
    
    if(mini === game.myProteins.B) val.B=-3, val.C=-2
    else val.C=-3, val.B=-2
    const keys = Object.keys(proteinsRepartition).sort((k1: string, k2:string )=> {
        if(proteinsRepartition[k2].length -  proteinsRepartition[k1].length>0) return -1
        else if(proteinsRepartition[k2].length -  proteinsRepartition[k1].length<0) return 1
        else return val[k1]- val[k2]

    })
    for(let i=1; i<=4;i++) val[keys[i-1]]=i  // on met les valeurs pour le sort en fonction des priorités
    // console.error('nbProteins :',nbProteins.slice(0,10))
    nbProteins.sort(([x1,y1], [x2,y2]) => {
       if( (val[game.grid[y1][x1].protein]||+Infinity) - (val[game.grid[y2][x2].protein]||+Infinity) <0) return -1
       else if((val[game.grid[y1][x1].protein]||+Infinity) - (val[game.grid[y2][x2].protein]||+Infinity) >0) return 1
       else return Math.min(distance([xi1, yi1],[x1,y1]) ,distance([xi2, yi2],[x1,y1]) ) - Math.min(distance([xi1, yi1],[x2,y2]) ,distance([xi2, yi2],[x2,y2]) )
    })
    // console.error('nbProteinsSorted :',nbProteins.slice(0,10))
    // console.error('Last val :', val)
    return nbProteins.length? distance([xi1, yi1],[nbProteins[0][0],nbProteins[0][1]]) - distance([xi2, yi2],[nbProteins[0][0],nbProteins[0][1]]) : 0
}

const restreindreHarveester = (protein : string, game : Game) => {

        // prioriser les les proténies et B et C
        if(!'BC'.includes(protein)){
            if(game.myProteins.B<=1 || game.myProteins.C<=1){
                if(proteinsRepartition[protein].length) return false
                // return false
            } /*else if((!proteinsRepartition.B.length || !proteinsRepartition.C.length) && game.myProteins[protein]>=1) return false*/
            return true
        }
        return true
}
const opponentStrike = (myOrgan : Organ, game: Game, myOrgansForOrganismId : Organ[]) => {
    const tentacleOnOrgan = hasTentacle(game,myOrgan.position[0],myOrgan.position[1],true,true) // attackOpponent à true uniquement ici
    const [x1,y1] = myOrgan.position // myOrgan position
    const childrenIds : number[] = myOrgansForOrganismId.filter((organ :Organ) => organ.parentId ===game.grid[y1][x1].organ?.id && !['TENTACLE','SPORER'].includes(organ.type)).map(organ => organ.id)
    const res = {coordOpps: tentacleOnOrgan.coordOpps, childrenIds: []}
    if(game.oppProteins.B>=1 && game.oppProteins.C>=1) {
        // Dans le cas où l'ennemi peut nous tentacle
        if(tentacleOnOrgan.bool) {
            const [xOpp, yOpp] = tentacleOnOrgan.coordOpps
            // vérifier d'abord si l'ennemi est un tentacle
            if(game.grid[yOpp][xOpp].organ.type==='TENTACLE') {
                // si l'organime en question est une tentacle qui est en direction opposée de celle de l'ennemi ne pas le prendre en compte
                if((myOrgan.type!=='TENTACLE' || myOrgan.direction!==tentacleOnOrgan.dir)) {
                    /****
                     * Dans ce cas, on nne fait rien car notre tentacle fait face à celui de l'ennemi
                     */
                    res.childrenIds = childrenIds
                }

            }

        }
    }
    return res
}

const collisionTentacleLoop = (myOrgan: Organ, game: Game, step : number, tentacle : {bool:boolean,dir:string, coordOpps:number[] }) => {
    if(step ===2){
        const [xOpp,yOpp] = tentacle.coordOpps
        if(myOrgan.type=== 'TENTACLE' && tentacle.bool && (myOrgan.position[0]===xOpp || myOrgan.position[1]===yOpp)){
            if(game.oppProteins.B>=1 && game.oppProteins.C>=1){
                    // je me dirge vers l'est
                   if(tentacle.dir=== 'E' && myOrgan.direction=== 'E' && (xOpp+1<width && game.grid[yOpp][xOpp+1].organ?.direction==='W' && game.grid[yOpp][xOpp+1].organ?.type==='TENTACLE') ) return true
                    // direction west
                    else if(tentacle.dir=== 'W' && myOrgan.direction=== 'W' && (xOpp-1>=0 && game.grid[yOpp][xOpp-1].organ?.direction==='E' && game.grid[yOpp][xOpp-1].organ?.type==='TENTACLE')) return true
                    // direction north
                    else if(tentacle.dir=== 'N' && myOrgan.direction=== 'N' && (yOpp-1>=0 && game.grid[yOpp-1][xOpp].organ?.direction==='S' && game.grid[yOpp-1][xOpp].organ?.type==='TENTACLE')) return true
                    // direction south
                    else if(tentacle.dir=== 'S'  && myOrgan.direction=== 'S' && (yOpp+1<height && game.grid[yOpp+1][xOpp].organ?.direction==='N' && game.grid[yOpp+1][xOpp].organ?.type==='TENTACLE')) return true
                    
            }
        }

    }
    return false
}

const checkIfHarvesterOnProtein = (organ: Organ, game: Game) => {
    const [x,y] = organ.position
    if(organ.direction=== 'E' && x+1<width && game.grid[y][x+1].protein) return -1
        else if(organ.direction=== 'W' && x-1>=0 && game.grid[y][x-1].protein) return -1
        else if(organ.direction=== 'N' && y-1>=0 && game.grid[y-1][x].protein) return -1
         else if(organ.direction=== 'S' && y+1<height && game.grid[y+1][x].protein) return -1
    else return 0
}
const distance = ([x1,y1],[x2,y2]) => Math.abs(x1-x2)+Math.abs(y1-y2)
const bfs = (game : Game, proteinsListCoord : number[][], ownOrgans : Organ[], organismeId :number) => {
    console.error('#'.repeat(10)+` organismId : ${organismeId}` + '#'.repeat(10))
    let myOrgans : Organ[] = ownOrgans
    const sporerOrgans : Organ[] = myOrgans.filter(organ=> organ.type==='SPORER' && organ.rootId === organismeId)
    const havesterOrgans : Organ[] = game.myOrgans.filter(organ => organ.type==='HARVESTER')
    const myOrgansId : number[] = game.myOrgans.map(org=>org.id)
    const sporeQuickly = sporeImmediately(game,sporerOrgans, EndGame[organismeId] || rootsId.length<=1,  myOrgansId)
    console.error('Can I spore quickly : ',sporeQuickly)
    const oppOrgansId : number[] = game.oppOrgans.map(org=>org.id)
    const initialize = {}
    const idsDeadOrgans : number [] = []
    for( const myOrgan of myOrgans) {
        const traces = {}
        traces[myOrgan.position.join(',')] = +Infinity
        const q = [[myOrgan.position,0,[]]]
        initialize[myOrgan.id] = [traces,q/*,JSON.parse(JSON.stringify(proteinsListCoord))*/]
        initialize[myOrgan.id].firstStep = []
        initialize[myOrgan.id].ennemy = isThereEnemy(myOrgan.position[0],myOrgan.position[1],game) 
        // const tentacleOnOrgan = hasTentacle(game,myOrgan.position[0],myOrgan.position[1],false)
    }
    // Si orgainsme bloqué sort par organe harvester
    if(EndGame[organismeId]){
        myOrgans.sort((organe1,organe2)=> {
            const v1= checkIfHarvesterOnProtein(organe1, game)
            const v2= checkIfHarvesterOnProtein(organe2, game)
            const min1 = Math.min(... oppOrgansId.map(id=>distance(organe1.position,game.organMap.get(id).position)) )
            const min2 = Math.min(... oppOrgansId.map(id=>distance(organe2.position,game.organMap.get(id).position)) )
            if(v1<v2) return -1
            else if(v1>v2) return 1
            else return min1-min2
        })
    }
    let isEnnemyNearOrganism = Object.values(initialize).some((val :any) => val.ennemy)
    while(Object.values(initialize).some(value => value[1].length)) {
        myOrgans = myOrgans.filter(organ=> initialize[organ.id][1].length)
        // Si orgainsme bloqué sort par organe harvester
        if(!EndGame[organismeId]){
            myOrgans.sort((organe1,organe2)=> {
                const min1 = Math.min(... oppOrgansId.map(id=>distance(organe1.position,game.organMap.get(id).position)) )
                const min2 = Math.min(... oppOrgansId.map(id=>distance(organe2.position,game.organMap.get(id).position)) )
                return min1-min2
            })
        }
        console.error('myOrgans.lenght :',myOrgans.length)
        for( const myOrgan of myOrgans) {
            const [traces, q] = initialize[myOrgan.id]
            // console.error('ISENNEMY', initialize[myOrgan.id].ennemy)
            // console.error('organId :', myOrgan.id)
            //  console.error('ISENNEMY', initialize[myOrgan.id].ennemy)
            q.sort((a,b)=>{
                // on revoit tout, maintenant on sort par priorité de proteins plutôt que que d'étape
                if(a[1]-b[1]<0) return -1
                else if(a[1]-b[1]>0) return 1
                // const proteinsPriority = compareProteins(a[0],b[0],proteinsListCoord, game)
                // if(proteinsPriority<0) return -1
                // else if(proteinsPriority >0) return 1
                else {
                    const ennemyBeforeProteinA = ennemyBeforeProtein(a[2][0],game)
                    const ennemyBeforeProteinB = ennemyBeforeProtein(b[2][0],game)
                    if(ennemyBeforeProteinA < ennemyBeforeProteinB) return -1
                    else if(ennemyBeforeProteinA > ennemyBeforeProteinB) return 1
                    else  return /*sporer(game, a[2],true,isAllBlocked).val -sporer(game, b[2],true,isAllBlocked).val*/ compareProteins(a[0],b[0],proteinsListCoord, game)//*a[1]-b[1]*/
                }
            })
            // console.error('q sorted :', JSON.stringify(q.slice(0,2)))
            // console.error(' ISENNEYORGANISM :', isEnnemyNearOrganism)
            // console.error('proteinsListCoord Inside: ',proteinsListCoord )
            const limit = q[0][1]
            // console.error('q :',q.map(l=>l[2]))


            // start while loop
            while(q.some(val=>val[1]===limit)){
                const [[x,y], step,path] = q.shift()
                if(step===1) {
                    // console.error('[x,y] before final :', [x,y])
                    initialize[myOrgan.id].firstStep.push([x,y])
                }
                // console.error('path :', path)
                const Ifennemy =isThereEnemy(x,y,game) 
                console.error(`IsEnnemey${[x,y]}:  ${Ifennemy}`)
                const ennemyBefore = game.grid[y][x].protein && Ifennemy // si c'est une protéine et qu'il y a des ennemy dans les barrages commencer à orienrter nos recherches vers les protéines

                if(ennemyBefore || (step===1 &&  Ifennemy))  isEnnemyNearOrganism = true

                // essayer de sporer au maximum lorsqu'on n'est pas attaqué

                // if(!isEnnemyNearOrganism && !sporeQuickly){
                //     if( game.myProteins.D>=3 && game.myProteins.B>=2 && game.myProteins.C>=2 && step>=4 ){
                //         console.error('enter Hier sporer')
                //         const sporerRes = sporer(game,path,false,true/*isAllBlocked*/,  myOrgansId)
                //         console.error(' sporer To Expand :',sporerRes)
                //         if(sporerRes.bool){
                //             // enter=true
                //             const type=sporerRes.type
                //             const dir=sporerRes.dir
                //             const coord = path[0].join(' ')
                //             return `GROW ${myOrgan.id} ${coord} ${type} ${dir}`
                //         }
                //     }
                // }
                if(/*(proteinsListCoord.length===0 && step>=1 && !game.grid[y][x].protein)*/(poursuivre(game,x,y) && step>=1) || /*(isMyProtein(x,y,game,myOrgansId,proteinsList))*/(game.grid[y][x].protein && !Ifennemy) || (/*isAllBlocked*/ EndGame[organismeId] && step>=1 /*&& ([x,y].join(',')!==myOrgan.position.join(','))*//*&& !Ifennemy*/) || step>=8){
                    // console.error('myOrgan :', myOrgan)
                    // console.error('myOrgansId :', myOrgansId)
                    console.error('path : ',path)
                    console.error('[x,y] :', [x,y])
                    let type = ''
                    let dir = 'N'
                    const coord = path[0].join(' ')
                   /* if('CD'.includes(game.grid[y][x].protein)){
                        coord = path[0].join(' ')
                    }*/ if(game.grid[y][x].protein && !Ifennemy) {
                        let enter = false
                        if(sporeQuickly ) {
                            EndGame[organismeId]=false 
                            return sporeQuickly // spore quickly
                        }

                        // avant m^me de chercher des HARVESTER essayer dès le premier step de créer de nouveaux organismes lorqu'on en a pas
                        if(!enter && game.myProteins.D>=3 && game.myProteins.B>=2 && game.myProteins.C>=2 && ((rootsId.length<=1 || EndGame[organismeId] ) || step>=4)){
                            console.error('enter Hier sporer')
                            const sporerRes = sporer(game,path,false,true/*isAllBlocked*/,  myOrgansId)
                            console.error(' sporer :',sporerRes)
                            if(sporerRes.bool){
                                enter=true
                                type=sporerRes.type
                                dir=sporerRes.dir
                            }
                        }
                            /***
                             * Si je jeux est bloqué et qu'on a de quoi créer des sporer, le faire
                             */
                            // HARVESTER
                            if( !enter && game.myProteins.C>=1 && game.myProteins.D>=1 /*&& !( proteinsRepartition[game.grid[y][x].protein].length && ( !proteinsRepartition.B.length || !proteinsRepartition.C.length))*/  && (restreindreHarveester(game.grid[y][x].protein, game) || isAllBlocked)) {
                                console.error('enter HARVESTER [x,y] :',[x,y])

                
                                if(!game.grid[path[0][1]][path[0][0]].protein) {
                                    console.error('ENTER HIER FOR HARVESTER')
                                    if(path[0][1]-y===1 && path[0][0]===x) dir='N',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                    else if(path[0][1]-y===-1 && path[0][0]===x) dir='S',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                    else if(path[0][0]-x===1 && path[0][1]===y) dir ='W',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                    else if(path[0][0]-x===-1 && path[0][1]===y) dir ='E',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                    if(enter) {
                                        const index=proteinsListCoord.findIndex(val=> val.join(',')===[x,y].join(','))
                                        // console.error('index :',index)
                                        if(index!==-1) proteinsListCoord.splice(index,1)
                                        proteinsRepartition[game.grid[y][x].protein].push([x,y])
                                    }
                                    console.error('Enter :', enter)
                                     /***
                                        * Juste le HARVESTER check si on a déjà des HAVERSTER SUR les protéines B et C pour pouvoir utiliser les TENTACLES EN MASSES
                                     */
                                //    else if(game.myProteins.C>=1 && game.myProteins.B>=1 && (checkIfHARVESTEROnAandB(game,havesterOrgans) || isAllBlocked)){
                                //         console.error('enterHier ForSure')
                                //         if(path[0][1]-myOrgan.position[1]===1 && path[0][0]===myOrgan.position[0]) dir='S',type='TENTACLE',game.myProteins.C--,game.myProteins.B--,enter=true
                                //         else if(path[0][1]-myOrgan.position[1]===-1 && path[0][0]===myOrgan.position[0]) dir='N',type='TENTACLE',game.myProteins.C--,game.myProteins.B--,enter=true
                                //         else if(path[0][0]-myOrgan.position[0]===1 && path[0][1]===myOrgan.position[1]) dir ='E',type='TENTACLE',game.myProteins.C--,game.myProteins.B--,enter=true
                                //         else if(path[0][0]-myOrgan.position[0]===-1 && path[0][1]===myOrgan.position[1]) dir ='W',type='TENTACLE',game.myProteins.C--,game.myProteins.B--,enter=true
                                //    }
                                    // else if(game.myProteins.A===0 /* && game.myProteins.B===0*/ /*&& !proteinsListCoord.length*/) {
                                    //     // essayer de voir par inadvertance s'il n'ya pas de protéines proches de soi avant de mettre une direction random vers le nord
                                    //     dir='N',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                    // }
                                } else {
            
                                    if(path[0][1]-1>=0 && game.grid[path[0][1]-1][path[0][0]].protein) dir='N',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                    else if(path[0][1]+1<height && game.grid[path[0][1]+1][path[0][0]].protein) dir='S',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                    else if(path[0][0]-1>=0 && game.grid[path[0][1]][path[0][0]-1].protein) dir ='W',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                    else if(path[0][0]+1<width && game.grid[path[0][1]][path[0][0]+1].protein) dir ='E',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true  
                                    if(enter) {
                                        let index=proteinsListCoord.findIndex(val=> val.join(',')===[x,y].join(','))
                                        // console.error('index :',index)
                                        if(index!==-1) proteinsListCoord.splice(index,1)
                                        index=proteinsListCoord.findIndex(val=> val.join(',')===[path[0][0],path[0][1]].join(','))
                                        if(index!==-1) proteinsListCoord.splice(index,1)
                                        index=proteinsRepartition[game.grid[path[0][1]][path[0][0]].protein].findIndex(val=> val.join(',')===[path[0][0],path[0][1]].join(','))
                                        if(index!==-1) proteinsRepartition[game.grid[path[0][1]][path[0][0]].protein].splice(index,1)
                                        proteinsRepartition[game.grid[y][x].protein].push([x,y])
                                    }
                                    else if(game.myProteins.A===0 /*&& game.myProteins.B===0*/ /*&& !proteinsListCoord.length*/) {
                                        const [x1,y1] = path.length>1?path[1]:myOrgan.position 
                                        if(path[0][1]-1>=0 && game.grid[path[0][1]-1][path[0][0]].protein) dir='N',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                        else if(path[0][1]+1<height && game.grid[path[0][1]+1][path[0][0]].protein) dir='S',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                        else if(path[0][0]-1>=0 && game.grid[path[0][1]][path[0][0]-1].protein) dir ='W',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true
                                        else if(path[0][0]+1<width && game.grid[path[0][1]][path[0][0]+1].protein) dir ='E',type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true  
                                        //  after
                                          
                                        else if(path[0][1]-y1===1 && path[0][0]===x1) dir=path.length===1?'S':'N',  type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true  
                                        else if(path[0][1]-y1===-1 && path[0][0]===x1) dir=path.length===1?'N':'S',  type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true  
                                        else if(path[0][0]-x1===1 && path[0][1]===y1) dir =path.length===1?'E':'W', type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true  
                                        else if(path[0][0]-x1===-1 && path[0][1]===y1) dir =path.length===1?'W':'E',  type='HARVESTER',game.myProteins.C--,game.myProteins.D--,enter=true  
                                    }
                                }
                            }
                           
                            //SPORER
                            if(!enter && game.myProteins.D>=3 && game.myProteins.B>=2 &&  game.myProteins.C>=2 && ( step>=4 || (game.myProteins.A===0))){
                                console.error('enter hier sporer')
                                const sporerRes = sporer(game,path,false,/*rootsId.length>1?isAllBlocked : true*/isAllBlocked,  myOrgansId)
                                console.error('spore :', sporerRes )
                                if(sporerRes.bool){
                                    enter=true
                                    type=sporerRes.type
                                    dir=sporerRes.dir
                                }
                                else if(game.myProteins.A===0 /*&& game.myProteins.C===0*/) game.myProteins.D--,game.myProteins.B--,type='SPORER',enter=true
                            }
                            if( !enter && game.myProteins.C>=1 && game.myProteins.B>=1 && /*(checkIfHARVESTEROnAandB(game,havesterOrgans) */ (/*isAllBlocked &&*/ game.myProteins.A===0 )){
                                console.error('enterHier ForSure')
                                const [x1,y1] = path.length>1?path[1]:myOrgan.position    
                                if(path[0][1]-y1===1 && path[0][0]===x1) dir=path.length===1?'S':'N',type='TENTACLE',game.myProteins.C--,game.myProteins.B--, enter = true
                                else if(path[0][1]-y1===-1 && path[0][0]===x1) dir=path.length===1?'N':'S',type='TENTACLE',game.myProteins.C--,game.myProteins.B--, enter = true
                                else if(path[0][0]-x1===1 && path[0][1]===y1) dir =path.length===1?'E':'W',type='TENTACLE',game.myProteins.C--,game.myProteins.B--, enter = true
                                else if(path[0][0]-x1===-1 && path[0][1]===y1) dir =path.length===1?'W':'E',type='TENTACLE',game.myProteins.C--,game.myProteins.B--, enter = true
                           }
                            // if(!enter && game.myProteins.A===0 && game.myProteins.C>=1 && game.myProteins.B>=1) dir='N',type='TENTACLE',game.myProteins.C--,game.myProteins.B--
                            if(!enter && game.myProteins.A>=1) game.myProteins.A--,enter=true, type='BASIC'
                             if(!enter && game.myProteins.B>=1 && game.myProteins.D>=1){
                                type='SPORER'
                                const [x1,y1] = path.length>1?path[1]:myOrgan.position 
                                if(path[0][1]-y1===1 && path[0][0]===x1) dir=path.length===1?'S':'N', game.myProteins.B--,game.myProteins.D--,enter=true  
                                else if(path[0][1]-y1===-1 && path[0][0]===x1) dir=path.length===1?'N':'S',game.myProteins.B--,game.myProteins.D--,enter=true  
                                else if(path[0][0]-x1===1 && path[0][1]===y1) dir =path.length===1?'E':'W', game.myProteins.B--,game.myProteins.D--,enter=true  
                                else if(path[0][0]-x1===-1 && path[0][1]===y1) dir =path.length===1?'W':'E', game.myProteins.B--,game.myProteins.D--,enter=true
                            }
                             // on bloque cette protéine à la fin
                             game.grid[y][x].isWall = true
                            
                        }   else {
                            // TENTACLE
                            console.error('hier Tentacle')
                            console.error('mB :',game.myProteins.B)
                            console.error('mC :',game.myProteins.C)
                            console.error('mD :',game.myProteins.D)
                            const nb = game.grid[y][x].protein?2:1 // si on se irigeait vers une protéine et qu'il malheureusement un ennemi devant, dans le cass où l'on doit spore (b et d >=2)
                            if(game.myProteins.C>=1 && game.myProteins.B>=1) {
                                // console.error('enterHier tentacle')
                                // console.error('coord [x,y] :', path[0])
                                // console.error('mA :',game.myProteins.A)
                                console.error('step :', step)
                                const tentacle = hasTentacle(game,path[0][0],path[0][1],true,false)
                                console.error('tentacle :', tentacle)
                                const collisionStep2 = collisionTentacleLoop(myOrgan, game, step,tentacle)
                                console.error('collisionStep2 :', collisionStep2)

                                // dans le cas où on Loop dans le combat mettre fin
                                if(collisionStep2 && !isAllBlocked){
                                    EndGame[organismeId]=true
                                    return 'WAIT'
                                }
                                if(tentacle.bool) dir=tentacle.dir,type='TENTACLE',game.myProteins.C--,game.myProteins.B--
                                // Dans le cas où il n'ya aps d'ennemies essayer de spore
                                else if(sporeQuickly && step>=4 ){
                                    EndGame[organismeId]=false
                                    return sporeQuickly 
                                }
                                // Qaund il n'y pas d'ennemy et qu'on peut sporer le faire

                                // si on peut créer un sporer,, on le fait
                                // else if(game.myProteins.D>=nb && game.myProteins.B>=nb /*&& game.myProteins.A===0*/ /*&& game.myProteins.C===0*/ && step>=4 ){
                                //     const sporerRes = sporer(game,path,false,isAllBlocked || true,  myOrgansId)
                                //     if(sporerRes.bool){
                                //         // enter=true
                                //         type=sporerRes.type
                                //         dir=sporerRes.dir
                                //     }
                                //     // game.myProteins.D--,game.myProteins.B--,type='SPORER'
                                // }
                                // si on ne rentre pas directement c'est que l'ennemi n'est pas à un pas de nous donc on peut essayer de baricader quand même
                                else if((!tentacle.bool && ((step>1 && step<=4) || game.grid[y][x].protein)) /*&&*/ /*(checkIfHARVESTEROnAandB(game,havesterOrgans) || isAllBlocked)*/ /*isAllBlocked*/|| (game.myProteins.A===0 && isAllBlocked)) {
                                    // dans le cas où l'on a plus d'un path
                                    const [x1,y1] = path.length>1?path[1]:myOrgan.position
                                    
                                    if(path[0][1]-y1===1 && path[0][0]===x1) dir=path.length===1?'S':'N',type='TENTACLE',game.myProteins.C--,game.myProteins.B--
                                    else if(path[0][1]-y1===-1 && path[0][0]===x1) dir=path.length===1?'N':'S',type='TENTACLE',game.myProteins.C--,game.myProteins.B--
                                    else if(path[0][0]-x1===1 && path[0][1]===y1) dir =path.length===1?'E':'W',type='TENTACLE',game.myProteins.C--,game.myProteins.B--
                                    else if(path[0][0]-x1===-1 && path[0][1]===y1) dir =path.length===1?'W':'E',type='TENTACLE',game.myProteins.C--,game.myProteins.B--
                                    
                                }
                                else  if(game.myProteins.D>=1 && game.myProteins.B>=1 /*&& game.myProteins.A===0*/ /*&& game.myProteins.C===0*/ ){
                                     const sporerRes = sporer(game,path,false,isAllBlocked || true,  myOrgansId)
                                     if(sporerRes.bool){
                                         // enter=true
                                         type=sporerRes.type
                                         dir=sporerRes.dir
                                     } else if(game.myProteins.A>=1) game.myProteins.A--, type='BASIC'
                         
                                 }
                                // else if(game.myProteins.A===0 /*&& game.myProteins.D===0*/) dir='N',type='TENTACLE',game.myProteins.C--,game.myProteins.B--   déjà pris en compte dans la condition du dessus
                                 else if(game.myProteins.A>=1) game.myProteins.A--, type='BASIC'
                            }
                            else {
                                if(game.myProteins.A>=1) game.myProteins.A--, type='BASIC'
                               else  if(game.myProteins.D>=1 && game.myProteins.B>=1 /*&& game.myProteins.A===0*/ /*&& game.myProteins.C===0*/ ){
                                    const sporerRes = sporer(game,path,false,isAllBlocked || true,  myOrgansId)
                                    if(sporerRes.bool){
                                        // enter=true
                                        type=sporerRes.type
                                        dir=sporerRes.dir
                                    } else {
                                        type='SPORER'
                                        const [x1,y1] = path.length>1?path[1]:myOrgan.position 
                                        if(path[0][1]-y1===1 && path[0][0]===x1) dir=path.length===1?'S':'N', game.myProteins.B--,game.myProteins.D--
                                        else if(path[0][1]-y1===-1 && path[0][0]===x1) dir=path.length===1?'N':'S',game.myProteins.B--,game.myProteins.D-- 
                                        else if(path[0][0]-x1===1 && path[0][1]===y1) dir =path.length===1?'E':'W', game.myProteins.B--,game.myProteins.D--
                                        else if(path[0][0]-x1===-1 && path[0][1]===y1) dir =path.length===1?'W':'E', game.myProteins.B--,game.myProteins.D--
                                    }
                        
                                }
                                else if(game.myProteins.A===0 /*&& game.myProteins.B===0*/ && game.myProteins.C>=1 && game.myProteins.D>=1) {
                                    // dir='N',type='HARVESTER',game.myProteins.C--,game.myProteins.D--
                                    const [x1,y1] = path.length>1?path[1]:myOrgan.position 
                                    if(path[0][1]-1>=0 && game.grid[path[0][1]-1][path[0][0]].protein) dir='N',type='HARVESTER',game.myProteins.C--,game.myProteins.D--
                                    else if(path[0][1]+1<height && game.grid[path[0][1]+1][path[0][0]].protein) dir='S',type='HARVESTER',game.myProteins.C--,game.myProteins.D--
                                    else if(path[0][0]-1>=0 && game.grid[path[0][1]][path[0][0]-1].protein) dir ='W',type='HARVESTER',game.myProteins.C--,game.myProteins.D--
                                    else if(path[0][0]+1<width && game.grid[path[0][1]][path[0][0]+1].protein) dir ='E',type='HARVESTER',game.myProteins.C--,game.myProteins.D-- 
                                    //  after
                                      
                                    else if(path[0][1]-y1===1 && path[0][0]===x1) dir=path.length===1?'S':'N',  type='HARVESTER',game.myProteins.C--,game.myProteins.D-- 
                                    else if(path[0][1]-y1===-1 && path[0][0]===x1) dir=path.length===1?'N':'S',  type='HARVESTER',game.myProteins.C--,game.myProteins.D--
                                    else if(path[0][0]-x1===1 && path[0][1]===y1) dir =path.length===1?'E':'W',type='TENTACLE',  type='HARVESTER',game.myProteins.C--
                                    else if(path[0][0]-x1===-1 && path[0][1]===y1) dir =path.length===1?'W':'E',type='TENTACLE',  type='HARVESTER',game.myProteins.C--
                                }
                            }
                            // mettre un mur sur cet ennemi pour ne pas induire en erruer les autres
                            game.grid[y][x].isWall = true
                            game.grid[y][x].organ = null
                            game.grid[y][x].protein=null

                        }
                    // console.error('finalPath :',game.grid[path[0][1]][path[0][0]].isWall)

                    // mettre à jour la map pour ne plus y passer
                    game.grid[path[0][1]][path[0][0]].isWall=true
                    game.grid[path[0][1]][path[0][0]].protein=null
                    console.error('mBFinal :',game.myProteins.B)
                    console.error('mCFinal :',game.myProteins.C)
                    console.error('mDFinal :',game.myProteins.D)
                    console.error('mAFinal :',game.myProteins.A)
                    // mettre à jour le fait que le jeu n'est plus bloqué
                    type?EndGame[organismeId]=false:EndGame[organismeId]=true
                    // isAllBlocked=false
                    return  type?`GROW ${myOrgan.id} ${coord} ${type} ${dir}`:'WAIT'
                }
                // left
                if(x-1>=0){
                    if(!game.grid[y][x-1].isWall && !oppOrgansId.includes(game.grid[y][x-1].organ?.id) && !myOrgansId.includes(game.grid[y][x-1].organ?.id) && ((traces[[x-1,y].join(',')] || +Infinity)>step+1) && (isMyProtein(x-1,y,game,myOrgansId,proteinsListCoord,isEnnemyNearOrganism, isAllBlocked))) {
                        const tentacle = hasTentacle(game,x-1,y,false,false)
                        if(!tentacle.bool || step){
                            traces[[x-1,y].join(',')] = step+1
                            q.push([[x-1,y],step+1,path.concat([[x-1,y]])])
                        }
                    }
                }
                // right
                if(x+1<width){
                    if(!game.grid[y][x+1].isWall && !oppOrgansId.includes(game.grid[y][x+1].organ?.id) && !myOrgansId.includes(game.grid[y][x+1].organ?.id) && ((traces[[x+1,y].join(',')] || +Infinity)>step+1) && (isMyProtein(x+1,y,game,myOrgansId,proteinsListCoord,isEnnemyNearOrganism,isAllBlocked ))) {
                        const tentacle = hasTentacle(game,x+1,y,false,false)
                        if(!tentacle.bool || step) {
                            traces[[x+1,y].join(',')] = step+1
                            q.push([[x+1,y],step+1,path.concat([[x+1,y]])])
                        }
                    }
                }
                // bottom
                if(y+1<height){
                    // console.error('bottom [x,y] :', [x,y+1])
                    if(!game.grid[y+1][x].isWall && !oppOrgansId.includes(game.grid[y+1][x].organ?.id) && !myOrgansId.includes(game.grid[y+1][x].organ?.id) && ((traces[[x,y+1].join(',')] || +Infinity)>step+1) && (isMyProtein(x,y+1,game,myOrgansId,proteinsListCoord,isEnnemyNearOrganism,isAllBlocked ))) {
                        const tentacle = hasTentacle(game,x,y+1,false,false)
                        // console.error('bottom [x,y] :', game.grid[y+1][x])
                        if(!tentacle.bool || step) {
                            traces[[x,y+1].join(',')] = step+1
                            q.push([[x,y+1],step+1,path.concat([[x,y+1]])])
                        }
                    }
                }
                // top
                if(y-1>=0){
                    if(!game.grid[y-1][x].isWall && !oppOrgansId.includes(game.grid[y-1][x].organ?.id) && !myOrgansId.includes(game.grid[y-1][x].organ?.id) && ((traces[[x,y-1].join(',')] || +Infinity)>step+1) && (isMyProtein(x,y-1,game,myOrgansId,proteinsListCoord,isEnnemyNearOrganism,isAllBlocked))) {
                        const tentacle = hasTentacle(game,x,y-1,false,false)
                        if(!tentacle.bool || step) {
                            traces[[x,y-1].join(',')] = step+1
                            q.push([[x,y-1],step+1,path.concat([[x,y-1]])])
                        }
                    }
                }
            }

            // end while loop
            
        }
    }
    // A la sortie il est impossible de se diriger vers une protéine ou vers un adversaire dans ce cas on essaie d'aggrandir notre organisme
    // const organId : string= Object.keys(initialize).find(key=> initialize[key].firstStep.length && !game.grid[initialize[key].firstStep[0][1]][initialize[key].firstStep[0][0]].isWall)[0]
    // console.error('NoEnter :', organId )
    // if(organId){
    //     if(game.myProteins.A>=1){
    //         const [xf,yf] = initialize[organId].firstStep[0]
    //         game.grid[yf][xf].isWall=true
    //         return  `GROW ${organId} ${[xf,yf].join(' ')}`
    //     }
    // }
    EndGame[organismeId]=true
}
console.error('width :', width)
console.error('height :', height)
// const game : Game = initialize()
// game loop
const EndGame : {[organismeId : number]: boolean} = {}
let isAllBlocked = false
let rootsId : number[] = []
let proteinsRepartition : {[k : string] : [number , number][]} = { A : [], B : [], C: [], D : []}
while (true) {
    const game : Game = initialize()
    const entityCount: number = parseInt(readline());
    console.error('entityCount :',entityCount)
    let nbProteins : number[][] =[]
    rootsId = []
    let organByrootsId : Map<number,Organ[]> =new Map()
    proteinsRepartition = { A : [], B : [], C: [], D : []}
    const myHarvesterids : number[] = []
    for (let i = 0; i < entityCount; i++) {
        var inputs: string[] = readline().split(' ');
        const x: number = parseInt(inputs[0]);
        const y: number = parseInt(inputs[1]); // grid coordinate
        const type: string = inputs[2]; // WALL, ROOT, BASIC, TENTACLE, HARVESTER, SPORER, A, B, C, D
        const owner: number = parseInt(inputs[3]); // 1 if your organ, 0 if enemy organ, -1 if neither
        const organId: number = parseInt(inputs[4]); // id of this entity if it's an organ, 0 otherwise
        const organDir: string = inputs[5]; // N,E,S,W or X if not an organ
        const organParentId: number = parseInt(inputs[6]);
        const organRootId: number = parseInt(inputs[7]);
        //
        if (type === 'WALL') {
            game.grid[y][x].isWall = true
        } else if (type === 'A' || type === 'B' || type === 'C' || type === 'D') {
            game.grid[y][x].protein = type
            // game.grid[y][x].isWall = false
            nbProteins.push([x,y])

        } else {
            const organ : Organ = {
                id: organId,
                position: [x, y ],
                type: type,
                owner: owner,
                direction: organDir,
                parentId: organParentId,
                rootId: organRootId
            }
            game.grid[y][x].organ = organ
            // game.grid[y][x].isWall = false
            game.organMap.set(organId, organ)
            if (owner === 1) {
                game.myOrgans.push(organ)
                rootsId.push(organRootId)
                if(type === 'HARVESTER') myHarvesterids.push(organId)
            } else if(owner === 0) {
                game.oppOrgans.push(organ)
            }
        }
    }
    myHarvesterids.forEach((id) => {
        const organ: Organ =  game.organMap.get(id)
        const [x,y] = organ.position
        if(organ.direction=== 'E' && x+1<width && game.grid[y][x+1].protein) proteinsRepartition[game.grid[y][x+1].protein].push([x,y])
        else if(organ.direction=== 'W' && x-1>=0 && game.grid[y][x-1].protein) proteinsRepartition[game.grid[y][x-1].protein].push([x,y])
        else if(organ.direction=== 'N' && y-1>=0 && game.grid[y-1][x].protein) proteinsRepartition[game.grid[y-1][x].protein].push([x,y])
         else if(organ.direction=== 'S' && y+1<height && game.grid[y+1][x].protein) proteinsRepartition[game.grid[y+1][x].protein].push([x,y])

    })
    console.error('proteinsRepartition : ', proteinsRepartition)
    // La liste de toutes protéines occupées par les HARVESTER
    const ProteinListFromObject =  Object.values(proteinsRepartition).flatMap((val : [number,  number][]) => val).map((val) => val.join(','))
    console.error('nbProteinsList :',nbProteins)
    console.error('ProteinListFromObject :',ProteinListFromObject)
    nbProteins = nbProteins.filter((val: number[]) => !ProteinListFromObject.includes(val.join(',')))
    var inputs: string[] = readline().split(' ');
    const myA: number = parseInt(inputs[0]);
    const myB: number = parseInt(inputs[1]);
    const myC: number = parseInt(inputs[2]);
    const myD: number = parseInt(inputs[3]); // your protein stock
    console.error('mAi :',myA)
    console.error('mAB :',myB)
    console.error('mAC :',myC)
    console.error('mAD :',myD)
    game.myProteins = { A: myA, B: myB, C: myC, D: myD }
    var inputs: string[] = readline().split(' ');
    const oppA: number = parseInt(inputs[0]);
    const oppB: number = parseInt(inputs[1]);
    const oppC: number = parseInt(inputs[2]);
    const oppD: number = parseInt(inputs[3]); // opponent's protein stock
    game.oppProteins = { A: oppA, B: oppB, C: oppC, D: oppD }
    // console.error('game: ',game)
    rootsId = [... new Set(rootsId)]
    rootsId.sort((a,b)=> b-a)
    rootsId.forEach(id=> organByrootsId.set(id, game.myOrgans.filter((organ : Organ)=> organ.rootId===id)))
    const requiredActionsCount: number = parseInt(readline()); // your number of organisms, output an action for each one in any order
    for (let i = 0; i < requiredActionsCount; i++) {

        // Write an action using console.log()
        // To debug: console.error('Debug messages...');
        if( !(rootsId[i] in EndGame)) EndGame[rootsId[i]] = false
        console.log(bfs(game,nbProteins,organByrootsId.get(rootsId[i]),rootsId[i])||'WAIT');
    }
    Object.keys(EndGame).forEach(id=> {
        if(!rootsId.includes(Number(id))) delete EndGame[id]})
    isAllBlocked = Object.values(EndGame).every(val=> val)
    console.error('isAllBlocked :',isAllBlocked)
}
