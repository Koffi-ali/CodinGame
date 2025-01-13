const Salles: Map<string,number> = new Map<string,number>()
const Voies : Map<string, string[]> = new Map<string,string[]>()
const N: number = parseInt(readline());
for (let i = 0; i < N; i++) {
    const room: string[] = readline().split(' ');
    const placeId : string = room.shift()
    const coins : number = Number(room.shift())
    Salles.set(placeId,coins)
    if(Voies.has(placeId)) Voies.get(placeId).push(... room)
    else Voies.set(placeId,[... room])
}

const traces : Map<string,number> = new Map<string,number>()
traces.set('0',Salles.get('0'))
const queue: [string, number, string[]][] = [['0',Salles.get('0'),['0']]]
// queue sera la liste de liste qui contiendra la salle dans laquelle on se trouve actuellement, le coût actuel, puis la liste
// des chemin déjà parcourus

while(queue.length) {
    queue.sort((a:[string,number,string[]], b:[string,number,string[]]) => b[1]-a[1]) // triéer par ordre décroissant de cout actuel
    const [place, cost, chemins] = queue.shift()

    if(place !=='E') {
        for( const voisin of Voies.get(place)) {
            const heureustique: number = Salles.get(voisin) || 0
            const newCost : number = cost + heureustique
            if(!traces.has(voisin)) {
                traces.set(voisin,newCost)
                queue.push([voisin,newCost,chemins.concat(voisin)])
            } else if(traces.get(voisin)<newCost) {
                traces.set(voisin,newCost)
                queue.push([voisin,newCost,chemins.concat(voisin)])
            }
        }
    }
}
// récupérer l'ensemble des salles qui ont déboule sur l'exxtérieur

const placesToExt : string[] = [... Voies.keys()].filter((place :string) => Voies.get(place).includes('E'))
const placesToExtGame : string[] = [... traces.keys()].filter((place :string) => placesToExt.includes(place)).sort((a: string,b:string) => traces.get(b)-traces.get(a))
console.log(traces.get(placesToExtGame[0]))

