/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const set : Set<string> = new Set <string>()
const partitions = (primes : number[] , num : number, map:{[a:number]:number}) : number [][] => {
    // num is the size of each elem of the partition
    const queue : number[][] = []
    // const set : Set<string> = new Set <string>()
    set.add(JSON.stringify([]))
    queue.push([])
    while(queue[0].length < num) {
          const  head : number [] = queue.shift()!
          for (const prime of primes) {
                const new_part : number []= head.filter((a:number)=>a===prime).length<map[prime]?head.concat([prime]).sort((a:number,b:number)=>a-b):[]
                if(!set.has(new_part.join(';'))) {
                    set.add(new_part.join(';'))
                    queue.push(new_part)
                }
          }
    }
    return queue
}
const sum = (l:number[]):number => l.reduce((a:number, b:number)=> a+b,0)**2
const prod = (l:number[]):number => l.reduce((a:number, b:number)=> a*b,1)
const distinct = (l1: number[], l2: number[], map: { [a: number]: number }): boolean => {
    const combined_map: { [key: number]: number } = {};
  
    // Parcours des deux listes simultanément
    for (let i = 0; i < l1.length; i++) {
      combined_map[l1[i]] = (combined_map[l1[i]] || 0) + 1;
      if (combined_map[l1[i]] > (map[l1[i]] || 0)) return false;  // Early exit
  
      combined_map[l2[i]] = (combined_map[l2[i]] || 0) + 1;
      if (combined_map[l2[i]] > (map[l2[i]] || 0)) return false;  // Early exit
    }
  
    return true;
  };
const N: number = parseInt(readline());
console.error("N :",N)
var inputs: string[] = readline().split(' ');
const l :number[] =[]
for (let i = 0; i < N; i++) {
    const value: number = parseInt(inputs[i]);
    l.push(value)
}
const map: {[a:number]:number} = {}
for (const elem of l){
    if(map[elem])map[elem]++
    else map[elem]=1
}
console.error('list : ', l)
const parts : number[][] = partitions(l,N/2,map)
const sumProd : number[][] = parts.map((part:number[], i:number) => [sum(part),prod(part),i])
console.error('length :',parts.length)
// console.log('bool :',set.has('[1,3,7,10,11]'))
// console.error('sumProd :',sumProd)
let min : number | null = null
for (let i=0; i<parts.length-1; i++) {
    const first : number[] = sumProd[i]
    console.error('firstBefore :',first)
    console.error('first :',parts[first[2]])
    const filt : number[][] = sumProd.slice(i+1).filter((elem: number[]) => distinct(parts[elem[2]], parts[i],map))
    for (/*let j=i+1;j<parts.length;j++*/ const elem of filt) {

        // const elem : number[] = sumProd[j]
        
        if(min === null) min=Math.min(Math.abs(first[0] - elem[1]), Math.abs(first[1] - elem[0]))
        else if( /*!parts[elem[2]].filter((e:number)=>parts[i].includes(e)).length&&*//*distinct(parts[elem[2]], parts[i],map)*/1 ) {
            min = Math.min(min,Math.abs(first[0] - elem[1]),Math.abs(first[1] - elem[0]))
            console.error('min :',min)
            console.error('val : ', parts[elem[2]])
        }
    }
}
console.error('ex: ', sumProd[1])
console.error('parts: ', parts[1])
console.log(min)