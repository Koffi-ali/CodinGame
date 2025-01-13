/**
 * Grab the pellets as fast as you can!
 **/
type Pac= {
    id : number,
    owner: boolean,
    x : number,
    y: number
    type: string,
    speed : number,
    ability: number
}
type Pellet = {
    x: number,
    y:number,
    value: number
}
type GridElement = {
    pac : Pac | null
    pellet : Pellet | null
    isWall: boolean
    position : [number, number]
}
type Game = {
    grid : GridElement[][]
    myPacs : Pac[],
    oppPacs : Pac[],
    pacMap : Map<number, Pac>
}
var inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]); // size of the grid
const height: number = parseInt(inputs[1]); // top left corner is (x=0, y=0)
const initGrid : string[]  =[] // grid Initiale
 
const cross = (myPac : Pac, xMove:  number, yMove: number, game: Game, dir : string) => {
    /**
     * Cette fonction permet juste de savoir si on peut se placer à la coordonnée [xMove, yMove] 
     *
     */
   // dir est la direction à partir de la quelle l'on arrive
   const crossOpponentSpecialPellet = (x: number, y: number, dir : string) => {
        switch(dir) {
            case 'L' :
                return [[x-1,y],[x,y+1],[x,y-1]].filter(([x1,y1]) => x1>=0 && x1<width && y1>=0 && y1<height).map(([x1,y1]) => crossOpponent(x1,y1))
            case 'R':
                return [[x+1,y],[x,y+1],[x,y-1]].filter(([x1,y1]) => x1>=0 && x1<width && y1>=0 && y1<height).map(([x1,y1]) => crossOpponent(x1,y1))
            case 'U' : 
                return [[x,y-1],[x+1,y],[x-1,y]].filter(([x1,y1]) => x1>=0 && x1<width && y1>=0 && y1<height).map(([x1,y1]) => crossOpponent(x1,y1))
            case 'D' :
                return [[x,y+1],[x+1,y],[x-1,y]].filter(([x1,y1]) => x1>=0 && x1<width && y1>=0 && y1<height).map(([x1,y1]) => crossOpponent(x1,y1))

        }
   }

    const crossOpponent = (x:number, y: number) => {
        if(game.grid[y][x].pac && (game.grid[y][x].pac.type !== myPac.type) && !game.grid[y][x].pac.owner && game.grid[y][x].pac.type !=='DEAD'){
            if(myPac.type==='SCISSORS' && game.grid[y][x].pac?.type ==='ROCK' ) return {bool:false, oppType:'ROCK'}
            else if(myPac.type==='PAPER' && game.grid[y][x].pac?.type ==='SCISSORS' ) return {bool:false, oppType:'SCISSORS'}
            else if(myPac.type==='ROCK' && game.grid[y][x].pac?.type ==='PAPER' ) return {bool:false, oppType:'PAPER'}
            else if(game.grid[y][x].pac.ability===0) return {bool:false,oppType:''}
            else return {bool:true,oppType:''}
        }
        else if(game.grid[y][x].pac && (myPac.type===game.grid[y][x].pac.type) && !game.grid[y][x].pac.owner && game.grid[y][x].pac.type !=='DEAD') return {bool:false, oppType:myPac.type} // dans ce cas si la compétence switch est possible pour l(adversiare essayer de switch vers un autre type qui bat celui qi bat notre type
        else return {bool:true,oppType:''}
    }
    // Il faut également vétrifier s'il ydes ennemi proche de cette position d'une case
    // c'est mon pac et il n'est pas mort
    if(game.grid[yMove][xMove].pac && (game.grid[yMove][xMove].pac.owner || (myPac.type===game.grid[yMove][xMove].pac.type) ) && game.grid[yMove][xMove].pac.type !=='DEAD' ) return {bool :false, oppType:(!game.grid[yMove][xMove].pac.owner)?myPac.type:''}
    // dans le cas des pacs différents établir priorité
    else if(game.grid[yMove][xMove].pac && (game.grid[yMove][xMove].pac.type !== myPac.type) && !game.grid[yMove][xMove].pac.owner && game.grid[yMove][xMove].pac.type !=='DEAD') {
        return  crossOpponent(xMove, yMove)
    }
   /* else if(game.grid[yMove][xMove].pellet){*/
        // Dans le cas où c'esst un pellet regarder autor de nous
        const res = crossOpponentSpecialPellet(xMove, yMove, dir).find(val => !val.bool)
        return res??{bool:true,oppType:''}
    /*}
    return {bool:true,oppType:''}*/
}

const switchType = (oppType: string) => {
    if(oppType==='SCISSORS') return 'ROCK'
    else if(oppType==='PAPER') return 'SCISSORS'
    else if(oppType==='ROCK') return 'PAPER'
    else return ''
}

const sectionGrid = (pacs :Pac[], game : Game) => {
    const midWidth : number = Math.floor(width/2) // part [0, midWith[ && part [midWith, width[
    const midHeight: number = Math.floor(height/2)
    const repart : {[key :number] : [[number, number], [number, number]]}= {}
    pacs.forEach(pac => repart[pac.id] = [[0,width-1],[0, height-1]])
    if(pacs.length>=2) {
        // gestion de l'axe des x
        let pacsIdOnLeftPart : number[] = pacs.filter(pac => pac.x<midWidth).sort((pac1,pac2)=> pac2.x - pac1.x ).map(pac=> pac.id)
        let pacsIdOnRightPart : number[] = pacs.filter(pac => pac.x>=midWidth).sort((pac1,pac2)=> pac1.x - pac2.x ).map(pac=> pac.id)
        console.error('pacsLeftInFUnction :',pacsIdOnLeftPart)
        console.error('pacsRightInFunction :',pacsIdOnRightPart)
        if(Math.abs(pacsIdOnLeftPart.length - pacsIdOnRightPart.length)>1) {
                // Dans le cass contraire, on a un excès, donc on choisi le nombre qui cause l'excès 
                if(pacsIdOnLeftPart.length>pacsIdOnRightPart.length) {
                   const pacsToRight =  pacsIdOnLeftPart.splice(0,Math.floor(Math.abs(pacsIdOnLeftPart.length - pacsIdOnRightPart.length)/2))
                   pacsToRight.forEach(id => repart[id][0]= [game.pacMap.get(id).x, width-1])
                } else {

                    const pacsToLeft =   pacsIdOnRightPart.splice(0,Math.floor(Math.abs(pacsIdOnLeftPart.length - pacsIdOnRightPart.length)/2))
                    pacsToLeft.forEach(id => repart[id][0] =  [0, game.pacMap.get(id).x])
                }
        }
            // repartiton presqu' égale chacun reste sur son terrain (axes des x)
            pacsIdOnLeftPart.forEach(id => repart[id][0] = [0, midWidth-1])
            pacsIdOnRightPart.forEach(id => repart[id][0] = [midWidth, width-1])

            // gestion de l'axe des y
            if(pacs.length>=4){
                let pacsIdOnTopPart : number[] = pacs.filter(pac => pac.y<midHeight).sort((pac1,pac2)=> pac2.y - pac1.y ).map(pac=> pac.id)
                let pacsIdOnBottomPart : number[] = pacs.filter(pac => pac.y>=midHeight).sort((pac1,pac2)=> pac1.y - pac2.y ).map(pac=> pac.id)
                if(Math.abs(pacsIdOnTopPart.length-pacsIdOnBottomPart.length)>1){
                    if(pacsIdOnTopPart.length > pacsIdOnBottomPart.length) {
                        const pacsToBottom = pacsIdOnTopPart.splice(0,Math.floor(Math.abs(pacsIdOnTopPart.length-pacsIdOnBottomPart.length)/2))
                        pacsToBottom.forEach(id => repart[id][1] = [game.pacMap.get(id).y, height-1])
                    }
                    else {
                        const pacsToTop = pacsIdOnBottomPart.splice(0,Math.floor(Math.abs(pacsIdOnTopPart.length-pacsIdOnBottomPart.length)/2))
                        pacsToTop.forEach(id => repart[id][1] = [0, game.pacMap.get(id).y])
                    }
                }
                // répartition presqu'égake sur l'axe des y
                pacsIdOnTopPart.forEach(id => repart[id][1] = [0, midHeight-1])
                pacsIdOnBottomPart.forEach(id => repart[id][1] = [midHeight, height-1])

            }

    } else {
        // ne rien faire
    }
    return repart
}
const mostPelletInDirection = (x: number, y: number, game: Game, withPac : boolean, dir: string) => {
    /**
     * Cette fonction rétourne le mmaximum de pellet qu'on peut rencontré dans toutes les directions
     * à partir de la position [x,y]
     */
    // withPac permet de savoir si l'on autorise ou pas à avoir des pac sur les chemins des pellets

    let right = 0
    let rightIndex = -1
    let rightPevIndex = x

    let left = 0
    let leftIndex = -1
    let leftPrevIndex = x

    let top = 0
    let topIndex = -1
    let topPrevIndex = y

    let bottom = 0
    let bottomIndex = -1
    let  bottomPrevIndex = y
    
    // left part
    if(dir.includes('L')) {
        while( (leftIndex = game.grid[y].slice(0,leftPrevIndex).reverse().findIndex(val => !val.isWall && !val.pac)) !==-1 ) {
                const indexObstacle = game.grid[y].slice(leftPrevIndex-1-leftIndex,x).findIndex(elem => elem.isWall || (elem.pac && !withPac))
                if(indexObstacle === -1) {
                    if(game.grid[y][leftPrevIndex-1-leftIndex].pellet) left+=game.grid[y][leftPrevIndex-1-leftIndex].pellet.value
                } else break
                leftPrevIndex-=(1+leftIndex)
        }
    }

    // right part
    if(dir.includes('R')){
        while( (rightIndex = game.grid[y].slice(rightPevIndex+1).findIndex(val => (!val.isWall && !val.pac))) !==-1 ){
            const indexObstacle = game.grid[y].slice(x,rightPevIndex+1+rightIndex).findIndex(elem => (elem.pac && !withPac) || elem.isWall )
            if(indexObstacle === -1){
                if(game.grid[y][rightPevIndex+1+rightIndex].pellet) right+=game.grid[y][rightPevIndex+1+rightIndex].pellet.value
            } else break
            rightPevIndex+=(1+rightIndex)
        }
    }

    // top part
    if(dir.includes('U')){
        while( (topIndex = [... Array(height).keys()].map(y=> game.grid[y][x]).slice(0,topPrevIndex).reverse().findIndex(val => !val.isWall && !val.pac)) !==-1){
            const indexObstacle = [... Array(height).keys()].map(y=> game.grid[y][x]).slice(topPrevIndex-topIndex-1, y).findIndex(elem => (elem.pac &&  !withPac) || elem.isWall)
            if(indexObstacle === -1) {
                if([... Array(height).keys()].map(y=> game.grid[y][x])[topPrevIndex-topIndex-1].pellet) top+=[... Array(height).keys()].map(y=> game.grid[y][x])[topPrevIndex-topIndex-1].pellet.value
            } else break
            topPrevIndex-= (1+topIndex)
        }
    }
    
    // bottom part
    if(dir.includes('D')){
        while( (bottomIndex = [... Array(height).keys()].map(y=> game.grid[y][x]).slice(bottomPrevIndex+1).findIndex(val => !val.isWall && !val.isWall)) !==-1){
            const indexObstacle = [... Array(height).keys()].map(y=> game.grid[y][x]).slice(y,bottomIndex+bottomPrevIndex+1).findIndex(elem => elem.isWall || (elem.pac && !withPac))
            if(indexObstacle === -1) {
                if([... Array(height).keys()].map(y=> game.grid[y][x])[bottomIndex+bottomPrevIndex+1].pellet) bottom+=[... Array(height).keys()].map(y=> game.grid[y][x])[bottomIndex+bottomPrevIndex+1].pellet.value
            } else break
            bottomPrevIndex+= (1+bottomIndex)
        }
    }
    return Math.max(left,right,top, bottom)
}

const distance  = ([x1 ,y1] : [number, number],[x2 ,y2] : [number, number] ) => Math.abs(x1-x2)+ Math.abs(y1-y2)
// fonction bfs de recher de chemin

const bfs = (game: Game, myPac : Pac, Brillant_Pellets : number[][]) => {
    const [xmin,xmax] = sectionnateGrid[myPac.id][0]
    const [ymin, ymax] =  sectionnateGrid[myPac.id][1]
    console.error('pac Id :', myPac.id)
    console.error('[xmin ,xmax ] :', [xmin,xmax] )
    console.error('[ymin ,ymax ] :', [ymin,ymax] )
    console.error('myPac Type : ', myPac.type)
    console.error('turnSpeed Left :',myPac.speed)
    console.error('ability turn Left :', myPac.ability)
    const nb_pelletInSight = mostPelletInDirection(myPac.x, myPac.y, game, true,'LRUD')
    console.error('nbPellets In Sight :' , nb_pelletInSight)
    console.error('brillantPellets :', Brillant_Pellets)

    // S'il ya brillant Pellet rechercher celui qui est le plus proche du pellet
    let isThereBrillantPellet = false
    let [xBrillant, yBrillant] = [-1,1]
    const Brillant_Pellet_Matched = Brillant_Pellets.filter(([x1,y1])=> (x1>=xmin && x1<=xmax) && (y1>=ymin && y1<=ymax))
    if(Brillant_Pellets.length){
        const List_dist = Brillant_Pellet_Matched.map(([x1,y1]) => distance([x1,y1], [myPac.x, myPac.y]))
        const min = Math.min(... List_dist)
        const index = List_dist.findIndex(val=> val===min)
       let val : number[] = [-1,-1]
        if(index !==-1) val = Brillant_Pellet_Matched[index]
        xBrillant= val[0]
        yBrillant = val[1]
        // remove this brillat pellet from the list
        const indexInAllBrillant = Brillant_Pellets.findIndex(([x1,y1]) => [x1,y1].join(',')===val.join(','))
        if(indexInAllBrillant  !==-1) Brillant_Pellets.splice(indexInAllBrillant ,1), isThereBrillantPellet =true

    }
    const firstPac = myPac
    const oppTypes : string[] = []
    // const myPacs : Pac[] = game.myPacs
    /***
     * 1- Si compéténce de speed, on speed
     * 2- Si chemin bloqué à cause d'un adversersaire et qu'on a assez de compétences on, switch,
     * 3 -Sinon on move
     */

    const q : [[number, number], number, number[][], string] []= [[[firstPac.x, firstPac.y], 0, [[firstPac.x, firstPac.y]],'']] // liste qe queue qui a pour element les coordonnées actuelles, l'étape, puis le path
    const qWhenNoSolution: [[number, number], number, number[][], string] [] = [[[firstPac.x, firstPac.y], 0, [[firstPac.x, firstPac.y]],'']]
    const traces = {}
    traces[[firstPac.x, firstPac.y].join(',')]= +Infinity
    while(q.length){
        // on dépile
        q.sort((a,b) => {
            if(a[1]<b[1]) return -1
            else if(a[1]>b[1]) return 1
            else {
                // dans le cas où il y de la vitesse calculer le nombre de pellets prises sur la rooutes
                const nAPelletOnRoad = a[2].reduce((acc, [x1,y1]) => (game.grid[y1][x1].pellet?.value || 0)+ acc ,0)
                const  nBPelletOnRoad = b[2].reduce((acc, [x1,y1]) => (game.grid[y1][x1].pellet?.value || 0)+ acc ,0)
                if(isThereBrillantPellet){
                    const dA = distance([xBrillant, yBrillant],[a[0][0],a[0][1]])
                    const dB = distance([xBrillant, yBrillant],[b[0][0],b[0][1]])
                    if(dA<dB) return -1
                    else if(dA>dB) return 1
                }
                
                    if( nAPelletOnRoad  >  nBPelletOnRoad) return -1
                    else if ( nAPelletOnRoad<  nBPelletOnRoad  ) return 1
                
                const BrillantPelletA = (game.grid[a[0][1]][a[0][0]].pellet?.value || 0 )  
                const BrillantPelletB = (game.grid[b[0][1]][b[0][0]].pellet?.value || 0 ) 
                // priorisser la position où l'on rencontre le plus de pellet
                const mostPelletA = mostPelletInDirection(a[0][0],a[0][1], game,false,a[3])
                const mostPelletB = mostPelletInDirection(b[0][0],b[0][1], game, false, b[3])
                
                    if(BrillantPelletA>BrillantPelletB) return -1
                    else if(BrillantPelletA<BrillantPelletB) return 1
                    else return mostPelletB - mostPelletA
                
            } 
        })

        const [[x,y], step, path, dir] = q.shift()
        const np_pellet_eatean = path.reduce((acc, [x1,y1]) => acc + (game.grid[y1][x1].pellet?.value || 0) ,0)
       const nb_pellet_in_Direction =  mostPelletInDirection(myPac.x, myPac.y,game,false, dir)

        // condition de fin
        if( /** No speed */  ( !isThereBrillantPellet && ( ((game.grid[y][x].pellet || np_pellet_eatean) && step>= (myPac.speed /*&& nb_pellet_in_Direction>1*/ ?2:1)) || step>=5 )) || ( isThereBrillantPellet && ( ( ([x,y].join(',') === [xBrillant,yBrillant].join(',') || np_pellet_eatean>=10) && step>= (myPac.speed /*&& nb_pellet_in_Direction>1*/?2:1) ) || step>=5 ))) {

            // avant cela
            // mettre à jour la grid
            let [xDest, yDest] = [-1,-1]
            console.error('path :', path)
            const [xi,yi] = path.shift()
            game.grid[yi][xi].pac = null // cas mon pac se sertait déjà déplacé
            if(game.grid[y][x].pellet){
                // [xDest, yDest] = [x,y]
                // Dans ce cas là c'est okay par contre dans l'autre cas il n'y a de protéine dans la vision du pac
                // mettre des murs sur les autres cheminis jusque sur le fin
                /*path.forEach(([x1,y1]) => game.grid[y1][x1].isWall= true)*/
                game.grid[y][x].pellet = null
                game.grid[y][x].isWall = true
            }
            if(isThereBrillantPellet) {
                game.grid[yBrillant][xBrillant].pellet = null
                game.grid[yBrillant][xBrillant].isWall = true
            }
            [xDest, yDest] = (myPac.speed /*&& nb_pellet_in_Direction>1*/) ? path[1] : path[0] // peut importe prendre le premier chemin
            game.grid[yDest][xDest].isWall = true // ce chemin est pris, mettre un mur
            // Dans le cas où l'on speed et qu enotre premier pas est un pellet le mettre à null pour ne pas induire les autres pacs en erreur
            if(myPac.speed>=1){
                game.grid[path[0][1]][path[0][0]].isWall = true // pour éviter les collisisons quand un de mes pacs est en vitesse
             if( game.grid[path[0][1]][path[0][0]].pellet) game.grid[path[0][1]][path[0][0]].pellet= null
            }
            // s'il n'ya pas de pellet en vue mettre ce pas bloqué pour ne plus y repasser
            if(!nb_pelletInSight) notMoveHere[myPac.id][myPac.y][myPac.x].isWall = true

            // ccas où il y a collision recursive sur notre pac
            if([xDest,yDest].join(',') === previousCoordsPac[myPac.id].join(',') &&  !myPac.ability){
                 return `SWITCH ${firstPac.id} ${switchType(myPac.type)}`
            }

            // si on rentre ici c'est qu'on avancer sans problème donc essayer de speed d'abord
            if(!myPac.ability){
                // il reste 0 tour avant de pouvoir utiliser mes compténces
                // si je ne suis pas sous speed
                if(myPac.speed===0 &&  !(nb_pellet_in_Direction === 1 && game.grid[y][x].pellet)) return `SPEED ${firstPac.id}`
            }
            lastMoveForPacs[myPac.id] = dir
            previousCoordsPac[myPac.id]  = [xDest,yDest]
            return `MOVE ${firstPac.id} ${xDest} ${yDest}`
        }
        
        const move = (to : string) => {
            // left
            if(to==='L'){
                if( /*( (x-1+width)%width>= xmin && (x-1+width)%width<=xmax) && (y>=ymin && y<=ymax) &&*/ !notMoveHere[myPac.id][y][(x-1+width)%width].isWall && !game.grid[y][(x-1+width)%width].isWall && ( traces[[(x-1+width)%width,y].join(',')]  || +Infinity)>step+1 ){
                    traces[[(x-1+width)%width,y].join(',')] = step+1
                    const canIcross = cross(myPac,(x-1+width)%width,y,game, 'L')
                    if(canIcross.bool) q.push( [ [(x-1+width)%width,y], step+1, path.concat([[(x-1+width)%width,y]]),'L' ] ), qWhenNoSolution.push( [ [(x-1+width)%width,y], step+1, path.concat([[(x-1+width)%width,y]]) ,'L'])
                    else {
                        // il y a un ennemie sur notre route
                        if(canIcross.oppType) oppTypes.push(canIcross.oppType)
                    }
                }
            }

            //  right
            else if(to ==='R'){
                if( /*((x+1)%width>=xmin && (x+1)%width<=xmax) && (y>=ymin && y<=ymax) &&*/ !notMoveHere[myPac.id][y][(x+1)%width].isWall && !game.grid[y][(x+1)%width].isWall  && ( traces[[(x+1)%width,y].join(',')]  || +Infinity)>step+1 ){
                    traces[[(x+1)%width,y].join(',')] = step+1
                    const canIcross = cross(myPac,(x+1)%width,y, game, 'R' )
                    if(canIcross.bool) q.push( [ [(x+1)%width,y], step+1, path.concat([[(x+1)%width,y]]),'R' ] ), qWhenNoSolution.push([ [(x+1)%width,y], step+1, path.concat([[(x+1)%width,y]]),'R' ])
                    else {
                        // il y a un ennemie sur notre route
                        if(canIcross.oppType) oppTypes.push(canIcross.oppType)
                    }
                }
            }

            // up
            else if(to ==='U'){
                if( /*(x>=xmin && x<=xmax) && ((y-1+height)%height>=ymin && (y-1+height)%height<=ymax) &&*/ !notMoveHere[myPac.id][(y-1+height)%height][x].isWall && !game.grid[(y-1+height)%height][x].isWall  && ( traces[[x,(y-1+height)%height].join(',')]  || +Infinity)>step+1 ){
                    traces[[x,(y-1+height)%height].join(',')]  = step+1
                    const canIcross = cross(myPac, x, (y-1+height)%height, game, 'U')
                    if(canIcross.bool) q.push( [ [x,(y-1+height)%height], step+1, path.concat([[x,(y-1+height)%height]]) ,'U'] ), qWhenNoSolution.push([ [x,(y-1+height)%height], step+1, path.concat([[x,(y-1+height)%height]]) ,'U'])
                    else {
                        // il y a un ennemie sur notre route
                        if(canIcross.oppType) oppTypes.push(canIcross.oppType)
                    }
                }
            }

            // down 
            else if(to ==='D'){
                if( /*(x>=xmin && x<=xmax) && ((y+1)%height>=ymin && (y+1)%height<=ymax) &&*/ !notMoveHere[myPac.id][(y+1)%height][x].isWall && !game.grid[(y+1)%height][x].isWall  && ( traces[[x,(y+1)%height].join(',')]  || +Infinity)>step+1 ){
                    traces[[x,(y+1)%height].join(',')]  = step+1
                    const canIcross = cross(myPac, x,(y+1)%height, game, 'D' )
                    if(canIcross.bool) q.push( [ [x,(y+1)%height], step+1, path.concat([[x,(y+1)%height]]),'D' ] ), qWhenNoSolution.push( [ [x,(y+1)%height], step+1, path.concat([[x,(y+1)%height]]) ,'D'] )
                    else {
                        // il y a un ennemie sur notre route
                        if(canIcross.oppType) oppTypes.push(canIcross.oppType)
                    }
                }
            }
        }
         // switch selon les directions
        const directMove = (dir : string) => {
            if(dir==='L') move('L'), move('U'),move('D'),move('R')
            else if(dir==='R') move('R'),move('U'),move('D'), move('L')
            else if(dir ==='U') move('U'),move('L'),move('R'),move('D')
            else if(dir === 'D') move('D'),move('L'),move('R'),move('U')
            else     move('L'),move('R'),move('U'),move('D')
        }
        directMove(dir || lastMoveForPacs[myPac.id])

    }

    /***
     * Si on sort c'est qu'on pas trouvé de chemin menant vers un pellet
     */
    if(!myPac.ability && oppTypes.length){
        // il reste 0 tour avant de pouvoir utiliser mes compéténces (ici SWITCH)
        // si je ne suis pas sur speed
        // déterminer le maximum de type d'ennemie
        const repartition = {}
        oppTypes.forEach(type=> repartition[type] = (repartition[type] || 0)+1)
        const mostType = Object.keys(repartition).sort((type1,type2) => repartition[type2] - repartition[type1])[0]
        const defenderType = switchType(mostType)
        return `SWITCH ${firstPac.id} ${defenderType}`
    }
    // sinon essayer de se déplacer vers la prémière cas disponible pour nous
    /**
     * Régarder dans qWhenNoSolution pour prendre une solution viable
     */
    if(qWhenNoSolution.length){
        const valF = qWhenNoSolution.find(qval => qval[2].length>= (myPac.speed?3:2))
        if(valF){
            const pathF = valF[2]
            console.error('pathF :', pathF)
            const [xi,yi] = pathF.shift()
            game.grid[yi][xi].pac = null
            const [xf,yf] = myPac.speed? pathF[1]:pathF[0] 
            game.grid[yf][xf].isWall = true
            if(game.grid[yf][xf].pellet) game.grid[yf][xf].pellet = null
            if(game.grid[pathF[0][1]][pathF[0][0]].pellet) game.grid[pathF[0][1]][pathF[0][0]].pellet = null
            if(myPac.speed>=1) game.grid[pathF[0][1]][pathF[0][0]].isWall =true
            // s'il n'ya pas de pellet en vue mettre ce pas bloqué pour ne plus y repasser
            if(!nb_pelletInSight) notMoveHere[myPac.id][myPac.y][myPac.x].isWall = true
            lastMoveForPacs[myPac.id] = valF[3]
            previousCoordsPac[myPac.id]  = [xf,yf]
            return `MOVE ${firstPac.id} ${xf} ${yf}`

        }

    }
    // s'il ne peut vraiment pas à cause d'un blocage entre mes pacs, réinitialiser les blocages
    notMoveHere[myPac.id]  = [ ... Array(height).keys()].map(y => [... Array(width).keys()].map(x => ({pac: null, pellet: null,isWall: initGrid[y][x]==='#' , position: [x,y]})))

    // si on peut speed on speed
    if(!myPac.ability){
        // il reste 0 tour avant de pouvoir utiliser mes compténces
        // si je ne suis pas sous speed
        if(myPac.speed===0) return `SPEED ${firstPac.id}`
    }
    // sinon rien
    return ''
}
// fonction d'initialisation

const initialize = () : Game => {
    const grid : GridElement[][]  = [ ... Array(height).keys()].map(y => [... Array(width).keys()].map(x => ({pac: null, pellet: null,isWall: initGrid[y][x]==='#' , position: [x,y]})))
    const game: Game = {grid : grid, myPacs : [], oppPacs: [], pacMap : new Map<number, Pac>()}
    return game
}

for (let i = 0; i < height; i++) {
    const row: string = readline(); // one line of the grid: space " " is floor, pound "#" is wall
    initGrid.push(row)
}

const notMoveHere : {[id : number] : GridElement[][] } = {}
let sectionnateGrid : {[key : number] : [[number, number], [number, number]]} = {}
let lastMoveForPacs  : {[key: number] : string} = {}
const previousCoordsPac : {[key: number] : [number, number]} = {}
// game loop
while (true) {
    const game :  Game = initialize()
    var inputs: string[] = readline().split(' ');
    const myScore: number = parseInt(inputs[0]);
    const opponentScore: number = parseInt(inputs[1]);
    let Brillant_Pellets : number[][] = []
    sectionnateGrid = {}
    const visiblePacCount: number = parseInt(readline()); // all your pacs and enemy pacs in sight
    for (let i = 0; i < visiblePacCount; i++) {
        var inputs: string[] = readline().split(' ');
        const pacId: number = parseInt(inputs[0]); // pac number (unique within a team)
        const mine: boolean = inputs[1] !== '0'; // true if this pac is yours
        const x: number = parseInt(inputs[2]); // position in the grid
        const y: number = parseInt(inputs[3]); // position in the grid
        const typeId: string = inputs[4]; // unused in wood leagues
        const speedTurnsLeft: number = parseInt(inputs[5]); // unused in wood leagues
        const abilityCooldown: number = parseInt(inputs[6]); // unused in wood leagues
        const pac: Pac = {id : pacId, owner: mine, x: x, y:y,type:typeId, speed:speedTurnsLeft,ability:abilityCooldown}
        game.grid[y][x].pac = pac
        if(mine)  {
            game.myPacs.push(pac)
            // set onlly pacMap for me because , ids are sometimes the same for differents players
            game.pacMap.set(pacId, pac)
        }
        else game.oppPacs.push(pac)

         // remplir l'objet notMoveHere pour savoir s'il le pac peut repasser ou nonlà
         game.myPacs.forEach(pac=> {
           if (!(pac.id in notMoveHere)) notMoveHere[pac.id] = game.grid, lastMoveForPacs[pac.id] ='', previousCoordsPac[pac.id] = [-1,-1]
         })
    }
    const visiblePelletCount: number = parseInt(readline()); // all pellets in sight
    for (let i = 0; i < visiblePelletCount; i++) {
        var inputs: string[] = readline().split(' ');
        const x: number = parseInt(inputs[0]);
        const y: number = parseInt(inputs[1]);
        const value: number = parseInt(inputs[2]); // amount of points this pellet is worth
        if(value>1) Brillant_Pellets.push([x,y])
        const pellet : Pellet = {x : x, y: y, value: value}
        game.grid[y][x].pellet = pellet
    }

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
    // sort d'avorid mes pacs en fonction de celui qui est le plus proche des pellets brillants
   const pacsGame = game.myPacs.filter(pac=> pac.type !=='DEAD')
   sectionnateGrid = sectionGrid(pacsGame, game)
    if(Brillant_Pellets.length)   pacsGame.sort((pac1, pac2) => Math.min(... Brillant_Pellets.filter(([x1,y1]) => (x1>=sectionnateGrid[pac1.id][0][0] && x1<=sectionnateGrid[pac1.id][0][1]) && (y1>=sectionnateGrid[pac1.id][1][0] &&  y1<=sectionnateGrid[pac1.id][1][1])).map(([x1,y1]) => distance([x1,y1], [pac1.x, pac1.y]))) -  Math.min(... Brillant_Pellets.filter(([x1,y1]) => (x1>=sectionnateGrid[pac2.id][0][0] && x1<=sectionnateGrid[pac2.id][0][1] )&& (y1>=sectionnateGrid[pac2.id][1][0] && y1<=sectionnateGrid[pac2.id][1][1] )).map(([x1,y1]) => distance([x1,y1], [pac2.x, pac2.y])))  )
    const res = pacsGame.map(pac => bfs(game, pac, Brillant_Pellets) ).filter(Boolean).join(' | ')
    console.error('game :', JSON.stringify(game))

    console.log(res);

}
