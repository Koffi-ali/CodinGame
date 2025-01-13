/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const N: number = parseInt(readline());
const L : number[][] = []
for (let i = 0; i < N; i++) {
    var inputs: string[] = readline().split(' ');
    const num: number = parseInt(inputs[0]);
    const t: number = parseInt(inputs[1]);
    L.push([num,t])
}

const scopes : number[] = []
for (let i=0;i<N-1;i++) scopes.push( Math.log(L[i+1][1]/L[i][1])/Math.log(L[i+1][0]/L[i][0]) )
const alpha : number = Number((scopes.reduce((a,b)=>a+b,0)/(N-1)).toFixed(1))
console.error(alpha)
if(alpha>=0 && alpha<=0.05) console.log('O(1)')
else if(alpha>0 && alpha<0.7) console.log('O(log n)')
else if(alpha>=0.9&&alpha<=1)console.log('O(n)')
else if(alpha>1&&alpha<1.5)console.log('O(n log n)')
else if(alpha>=1.8&&alpha<=2)console.log('O(n^2)')
else if(alpha>2&&alpha<2.5)console.log('O(n^2 log n)')
else if(alpha>=2.8&&alpha<=3)console.log('O(n^3)')
else console.log('O(2^n)')
