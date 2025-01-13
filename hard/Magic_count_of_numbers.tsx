/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs: string[] = readline().split(' ');
const n: number = parseInt(inputs[0]);
console.error("n : ", n)
const k: number = parseInt(inputs[1]);
console.error("k : ", k)
var inputs: string[] = readline().split(' ');
const primes :  number[] = []
// let tab : number[][] = []
for (let i = 0; i < k; i++) {
    const prime: number = parseInt(inputs[i]);
    primes.push(prime)
}
console.error("primes : " , primes)

const partitions = (primes : number[] , num : number) : number [][] => {
    // num is the size of each elem of the partition
    const queue : number[][] = []
    const set : Set<string> = new Set <string>()
    queue.push([])
    while(queue.find((head : number[]) => head.length != num)) {
          const  head : number [] = queue.shift()!
          for (const prime of primes) {
                const new_part : number []= Array.from(new Set([... head, prime])).sort((a : number,b: number) => a-b)
                if(!set.has(JSON.stringify(new_part))) {
                    set.add(JSON.stringify(new_part))
                    queue.push(new_part)
                }
          }
    }
    return queue
}
let result : number = 0
for (let i=0; i<k; i++) {
    const Partitions : number[][] = partitions(primes, i+1)
    result = result + (-1)**(i+2)*Partitions.reduce((acc : number , val : number[]) => {
        acc += Math.floor(n/val.reduce((a :number , v: number) => a*v,1))
        return acc
    },0)
    
    //console.error(`partions de ${i+1} :`, partitions(primes, i+1))
}

console.log(result);
