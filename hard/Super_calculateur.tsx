/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const N: number = parseInt(readline());
console.error(N)
const l : number[][] =[]
for (let i = 0; i < N; i++) {
    var inputs: string[] = readline().split(' ');
    const J: number = parseInt(inputs[0]);
    const D: number = parseInt(inputs[1]);
    l.push([J, J+D-1,0])
}
l.sort((a: number[], b: number[])=> {
    if(a[0]<b[0]) {
        return -1
    }else if(a[0]>b[0]) {
        return 1
    } else {
        return a[1]-b[1]
    }
})
const prec : number[][] = []
for (const elem of l) {
    if(!prec.length) {
        prec.push(elem)
    } else {
            if(elem[0]>prec[prec.length-1][1]) {
                prec.push(elem)
            }
            else if(elem[1]<prec[prec.length-1][1]) prec[prec.length-1]=elem
    }
}
console.log(prec.length)
