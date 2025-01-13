/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const distance = (pointA : [number, number], pointB : [number,number]) : number => {
    const [latA, longA] = pointA
    const [latB, longB] = pointB
    const x: number = (Math.PI/180)*(longB - longA)*Math.cos((Math.PI*(latA+latB))/360)
    const y: number = (Math.PI/180)*(latB - latA)
    return 6371*Math.sqrt(x**2+y**2)
}

const StopId : Map <string,[string,[number,number]]> = new Map<string,[string,[number,number]]>
const Liaisons :  Map<string,string[]> = new Map<string,string[]>
const startPoint: string = readline();
const endPoint: string = readline();
const N: number = parseInt(readline());
for (let i = 0; i < N; i++) {
    const stopName: string[] = readline().split(/,+/);
    console.error('stopName: :', stopName)
    StopId.set(stopName.shift(),[stopName.shift(),[Number(stopName.shift()),Number(stopName.shift())]])
}
const M: number = parseInt(readline());
for (let i = 0; i < M; i++) {
    const route: string[] = readline().split(' ');
    console.error('route :', route)
    if(!Liaisons.has(route[0])) Liaisons.set(route[0],[route[1]])
    else {
        if(!Liaisons.get(route[0]).includes(route[1]))Liaisons.get(route[0]).push(route[1])
    }
}

console.error('stopId :',StopId)
console.error('Liaisons :', Liaisons)

// mise en place du backtracking
const set : [string, number, number] = [startPoint,0,0] // un set pour conserver le noeud dela route et l'heureustique
const mapChemin : Map<string, [number,number]> = new Map<string, [number,number]>
/***
 * string :  le point actuel
 * number: pour la distance actuelle (heureustique)
 * number :étape actuelle
 * string: concantenation du chemin actuel (join(','))
 */

const queue: [string, number,number, string[]][]= [[startPoint,0,0,[startPoint]]]
let res : string[] = []
while(queue.length) {
    // sort la queue par heureustique décroissant
    queue.sort((a: [string, number,number, string[]],b:[string, number,number, string[]]) => a[2]- b[2])
    const [node, heureustique, cost, chemins] = queue.shift()!
    if(node===endPoint) {
        res=chemins
        // console.error("chemins :",chemins.map((s: string) => StopId.get(s)[0].replace(/"/g,'')))
        break;
    }
    const coordsNode : [number, number] = StopId.get(node)[1]
    for( const voisin of (Liaisons.get(node) || []) ) {
        const dist : number = distance(StopId.get(voisin)[1], coordsNode)
        const newHeureustique: number = dist
        const newCost: number = cost+dist
        console.error("cost :", newCost)
        console.error('distance :', dist)
        if( !mapChemin.has(voisin)) {
            mapChemin.set(voisin,[newHeureustique, newCost])
            queue.push([voisin,newHeureustique,newCost,chemins.concat(voisin)])
        } else if(mapChemin.get(voisin)[1]>newCost) {
            mapChemin.set(voisin,[newHeureustique, newCost])
            queue.push([voisin,newHeureustique,newCost,chemins.concat(voisin)])
        }
        // 
    }

}

console.log(res.length?(res.map((s: string) => StopId.get(s)[0].replace(/"/g,'')).join('\n')):'IMPOSSIBLE')

