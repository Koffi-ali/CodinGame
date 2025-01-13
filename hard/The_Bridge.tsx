/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const M: number = parseInt(readline()); // the amount of motorbikes to control
const V: number = parseInt(readline()); // the minimum amount of motorbikes that must survive
const L0: string = readline(); // L0 to L3 are lanes of the road. A dot character . represents a safe space, a zero 0 represents a hole in the road.
const L1: string = readline();
const L2: string = readline();
const L3: string = readline();
const height : number = 4
const width : number = L1.length
const tab : string[][] = [L0.split(''),L1.split(''),L2.split(''),L3.split('')]
const tab1 : string[][] = [...tab]
let move: string = ''
// console.error(L0)
// console.error(L1)
// console.error(L2)
// console.error(L3)
type ret = {
    can : boolean;
    coord : motorbike;
    step : string
}
 type motorbike = {
    x :number;
    y: number;
    A: number
 }

 /*** Fonction speed wait or slow ****/
const speed_or_wait_or_slow = (x: number , y: number , s : number, type: number) : ret =>  {
    // if type = 1 => accelerate else if type= 0 constant speed, else if speed = -1 => slow
    let bool : boolean = false
    let step : string = ''
    let coord : motorbike = {x:x, y:y, A:1}
    const index_speed : number = tab[y].indexOf('0',x+1)
    if(type === 1) {
        if(/*x+s+1 <width &&*/ (index_speed > x+s+1 || index_speed === -1)) {
            // we can speed
            step = 'SPEED'
            bool = true
            coord = {x:x+s+1,y:y, A:1}
        }
        else {
            // impossible check others move
            bool = false
            coord = {x:x,y:y, A:0}
            step='NONE' 
        }
    }
    else if(type === 0) {
        if (/*x+s <width &&*/ type === 0 && (index_speed > x+s || index_speed === -1)) {
            // wait
            bool = true
            step = 'WAIT'
            coord = {x:x+s,y:y, A:1}
        }
        else {
            // impossible check others move
            bool = false
            coord = {x:x,y:y, A:0}
            step='NONE' 
        }
    }
   else {
        if(s>0 && /*x+s-1 <width &&*/(index_speed > x+s -1 || index_speed === -1) ) {
            // slow
            bool = true
            step = 'SLOW'
            coord = {x:x+s-1,y:y, A:1}
        }
        else {
            // impossible check others move
            bool = false
            coord = {x:x,y:y, A:0}
            step='NONE' 
        }
   }
    return {can : bool, coord : coord, step : step}
}

/** Fonction jump **/
const jump = (x: number , y: number, s: number) : ret => {
    let bool : boolean = false
    let coord :  motorbike = {x:x, y:y, A:1}
    let step : string = ''
    if((x+s< width && tab[y][x+s] !== '0') || (x+s>width && tab[y][width-1] !== '0')) {
        bool =true
        coord = {x:x+s,y:y, A:1}
        step = 'JUMP'
    } else {
        // on peut quand même sauter mais cela ne sert à rien
        bool = false
        coord = {x:x,y:y, A:0}
        step='NONE'
    }
    return {can : bool, coord : coord, step : step}
}

/** Fonction up or down ** */
const up_or_down = (x: number , y: number, s: number, type: number) : ret => {
    // type = -1 if up or type = +1 if down
    let bool : boolean = false
    let step: string = type === 1 ? 'DOWN' : 'UP'
    let coord :  motorbike = {x:x, y:y, A:1}
    const index_current_road : number = tab[y].indexOf('0',x)
    if(y+type>=0 && y+type<height){
        // on descend ou on monte d'une voie (les trous doivent être considéres sur la voie courante et l'autre voie)
        const index_other_road : number = tab[y+type].indexOf('0',x)
        if((index_other_road === -1 || index_other_road>x+s) && (index_current_road === -1 || index_current_road>x+s-1)/*&& x+s <width*/) {
            bool = true
            coord = {x:x+s, y:y+type, A:1}
        }
        else {
            bool = false
            step = 'NONE'
            coord = {x:x,y:y, A:0}
        }
    } else {
        // impossible de monter ou descendre, on reste sur la même voie
        if(index_current_road === -1 || index_current_road > x+s) {
            bool = true
            coord = {x:x+s, y:y, A: 1}
        }

    }
    return {can : bool, coord : coord, step : step}
}
const best_move = (motors: motorbike[] , S : number, init : number) : Map<string, ret[]> => {
    /**
     * init est utilisée pour spécifier si c'est le début ou pas car au début on accepte une vitesse nulle
     * par contre après on accepte plus de vitesse nulle
    */
    const  motorbikes = motors.filter((motor : motorbike) => !!motor.A)
    const Speed : ret[] = motorbikes.map((motor :motorbike) => speed_or_wait_or_slow(motor.x, motor.y, S, 1)).filter((res : ret) => res.can)
    const Slow : ret[] = motorbikes.map((motor :motorbike) => speed_or_wait_or_slow(motor.x, motor.y, S, -1)).filter((res : ret) => res.can)
    const Wait : ret[] = motorbikes.map((motor :motorbike) => speed_or_wait_or_slow(motor.x, motor.y, S, 0)).filter((res : ret) => res.can)
    const Jump : ret[] = motorbikes.map((motor :motorbike) => jump(motor.x, motor.y, S)).filter((res : ret) => res.can)
    const Up : ret[] = motorbikes.map((motor :motorbike) => up_or_down(motor.x, motor.y, S, -1)).filter((res : ret) => res.can)
    const Down : ret[] = motorbikes.map((motor :motorbike) => up_or_down(motor.x, motor.y, S, 1)).filter((res : ret) => res.can)
    const concatRet : ret[] = Speed.concat(Wait).concat(Slow).concat(Jump).concat(Up).concat(Down) 
    let groupByMove : Map<string, ret[]> = new Map()
    // Group by keyMove
    for( const elem of concatRet) {
        if(groupByMove.has(elem.step)) {
            const getter : ret [] = groupByMove.get(elem.step)
            getter.push(elem)
            groupByMove.set(elem.step, getter)
        } else {
            groupByMove.set(elem.step, [elem])
        }
    }
    groupByMove = new Map( [...groupByMove].sort((a: [string, ret[]], b: [string, ret[]]) => b[1].length - a[1].length) )
    // if(init) {
    //     return groupByMove
    // }
    return (S || init)? groupByMove : new Map<string, ret[]>()
}

const get_speed = (move: string, s : number) : number => {
    if(move === "SPEED") {
        return s + 1
    } else if(move === 'SLOW') {
        return s - 1
    } else {
        return s
    }
}
// game loop
while (true) {
    const S: number = parseInt(readline()); // the motorbikes' speed
    console.error("speed: ", S)
    let motorbikes: motorbike [] = []
    let groupByMove : Map<string, ret[]> = new Map()
    for (let i = 0; i < M; i++) {
        var inputs: string[] = readline().split(' ');
        const X: number = parseInt(inputs[0]); // x coordinate of the motorbike
        const Y: number = parseInt(inputs[1]); // y coordinate of the motorbike
        const A: number = parseInt(inputs[2]); // indicates whether the motorbike is activated "1" or detroyed "0"
        motorbikes.push({x: X, y: Y, A: A})
        tab1[Y][X] = (i+1).toString()
    }
    tab1.forEach((elem :any) => console.error(elem.join('')))

    //  first attempt
    groupByMove = best_move(motorbikes, S,1)
     console.error('group :', groupByMove)
    const groupByMoveList : [string, ret[]][] = [... groupByMove ].filter((value : [string, ret[]]) => value[1].length>=V)
    if(groupByMoveList.length === 0) {
        // error occurs
        move = "FAIL"
    } else {
        /*let first_index_group_move : number = groupByMoveList.findIndex((value : [string, ret[]]) => value[1].length>=V)
        if(first_index_group_move === -1 ) {
            // on s'est trompé sur le choix du move du tour précédent
            move = "BAD CHOICE STEP - 1"
        } else {
          let first_group_move : [string, ret[]] = groupByMoveList.splice(first_index_group_move,1)[0]
          let current_move :  string = first_group_move[0]
          let alive_motorbikes : motorbike[] = first_group_move[1].map((ret : ret) => ret.coord)*/
          // vérfier avec ce move si le move suivant respecte la règle

          const backTrack = (groupByMoveList : [string, ret[]][], S: number, step : number , path: string[], simulation_number :  number ) => {
            console.error("path, ", path)
            if(step === simulation_number && S>0) {
                return path
            }
            for (const elem of groupByMoveList) {
                const motors : motorbike[] = elem[1].map((val :ret) => val.coord)
                const next_move : string = elem[0]
                let newGroupByMoveList : [string, ret[]][] = [... best_move(motors, get_speed(next_move, S),0) ].filter((value : [string, ret[]]) => value[1].length>=V)
                if(newGroupByMoveList.length) {
                     const result : string[] | null = backTrack(newGroupByMoveList,get_speed(next_move, S) , step + 1, path.concat([next_move]), simulation_number)
                     if(result) {
                        return result
                     }
                }
            }
            return null
          }

          const simulation : string[] = backTrack(groupByMoveList,S ,1, [], 4)
         /* while([... best_move(alive_motorbikes, get_speed(current_move, S)) ].findIndex((value : [string, ret[]]) => value[1].length>=V) === -1 && groupByMoveList.length) {
            first_index_group_move  = groupByMoveList.findIndex((value : [string, ret[]]) => value[1].length>=V)
            if(first_index_group_move === -1 ) {
                // on s'est trompé sur le choix du move du tour précédent
                move = "BAD CHOICE STEP - 1 AGAIN"
            } else {
                first_group_move = groupByMoveList.splice(first_index_group_move,1)[0]
                current_move = first_group_move[0]
                alive_motorbikes = first_group_move[1].map((ret : ret) => ret.coord)    
            }
          }
          move = current_move*/
          console.error("simualation : ", simulation)
          move = simulation[0]
        }
        /**
         * récuperer le move actuel et vérifier si avec ce move un prochain move est possible
         *C 'est à dire c'est que possibe que le nombre minimal de moto se déplace
        */
    // }
    // Write an action using console.log()
    // To debug: console.error('Debug messages...');
   /* console.error('group :', groupByMove)*/
    // move = groupByMove.size? [...groupByMove][0][0] : "FAIL"

    /**
     *  A partir d'ici une fois que le jump a été selectionné, il faut anticiper avec le coup suivant voir si les
     * contraintes du nombre de motos qui doivent survivre est correct 
    **/ 

    // A single line containing one of 6 keywords: SPEED, SLOW, JUMP, WAIT, UP, DOWN.
    console.log(move);
}
