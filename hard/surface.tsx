/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const L: number = parseInt(readline());
const H: number = parseInt(readline());
const circuit :  string[][] = []
for (let i = 0; i < H; i++) {
    const row: string = readline();
    circuit.push(row.split(''))
    console.error(row)
}
const map : Map<Set<string>, number> = new Map<Set<string>, number>
const Coords : [number, number] [] =[]
const N: number = parseInt(readline());
for (let i = 0; i < N; i++) {
    var inputs: string[] = readline().split(' ');
    const X: number = parseInt(inputs[0]);
    const Y: number = parseInt(inputs[1]);
    Coords.push([X,Y])
    console.error(X,Y)
}
for (let i = 0; i < N; i++) {
    const [x,y] = Coords[i]
    if(circuit[y][x]==='#') console.log(0)
    else {
        const NewSet : Set<string> = new Set<string>
        const mapKeys : Set<string>[] = [... map.keys()]
        const relevantSet : Set<string> = mapKeys.find((set : Set<string>) => set.has([x,y].join(',')))
        if(relevantSet) console.log(map.get(relevantSet))
        else {
            const queue : [number, number][] = [[x,y]]
            NewSet.add([x,y].join(','))
            while(queue.length) {
                const [x,y] : [number, number] = queue.shift()!
                if(x+1<L && circuit[y][x+1]==='O' && !NewSet.has([x+1,y].join(','))) {
                    queue.push([x+1,y])
                    NewSet.add([x+1,y].join(','))
                }
                if(x-1>=0 && circuit[y][x-1]==='O' && !NewSet.has([x-1,y].join(','))) {
                    queue.push([x-1,y])
                    NewSet.add([x-1,y].join(','))
                }
                if(y+1<H && circuit[y+1][x]==='O' && !NewSet.has([x,y+1].join(','))) {
                    queue.push([x,y+1])
                    NewSet.add([x,y+1].join(','))
                }
                if(y-1>=0 && circuit[y-1][x]==='O' && !NewSet.has([x,y-1].join(','))) {
                    queue.push([x,y-1])
                    NewSet.add([x,y-1].join(','))
                }
                
            }
            const res : number = NewSet.size
            map.set(NewSet,res)
            console.log(res)
        }
    }


}
