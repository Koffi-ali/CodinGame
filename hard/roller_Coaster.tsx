/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs: string[] = readline().split(' ');
const L: number = parseInt(inputs[0]);
const C: number = parseInt(inputs[1]);
const N: number = parseInt(inputs[2]);
let file : number[] = []
let dirahm : number = 0
console.error(L,C,N)
for (let i = 0; i < N; i++) {
    const pi: number = parseInt(readline());
    file.push(pi)
}
const map : Map<string, [number,number[]]> = new Map<string,[number,number[]]>
let key: string =''
let index: number = 0
    while(index <C) {
        const nbRequired : number[] = []
        let nb: number = 0
        let first : number =-1
        key= file.join(',')
        if(!map.has(key)){
            while((file.length) && (first=file.shift()) +nb<=L ){
                nb+=first
                nbRequired.push(first)
            }
            dirahm+=nb
            if(first!==-1 && file.length>0) file.unshift(first)
            file=file.concat([... nbRequired])
            map.set(key,[nb,file])
            index++
        } else {
                // on refait un cycle
                break;
        } 
        
    }
    // Dans le cas où l'on sort de la boucle sachant que i<C
if(index<C) { 
    const indexOfCycle: number = [... map.keys()].indexOf(key)
    const nbTurnLeft : number = C-index
    const values : number[] = [... map.values()].map((a:[number,number[]])=> a[0]).slice(indexOfCycle)
    const d: number = Math.floor(nbTurnLeft/(map.size-indexOfCycle))
    const r: number = nbTurnLeft%(map.size - indexOfCycle)
    const di=values.reduce((a,b)=>a+b,0)
    dirahm += ((d*di) + (r!==0?values.slice(0,r).reduce((a,b)=>a+b,0):0))
}
console.log(dirahm)

