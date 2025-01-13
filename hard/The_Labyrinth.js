/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
const R = parseInt(inputs[0]); // number of rows.
const C = parseInt(inputs[1]); // number of columns.
const A = parseInt(inputs[2]); // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.
const simu = (map,x,y,Mapdiscovered) => {
    let val =''
    if(!Mapdiscovered) val='.?'
    else if(Mapdiscovered==='go') val='.C'
    else if(Mapdiscovered==='back') val='.'
    const traces = {}
    traces[[x,y].join(',')]=-Infinity
    const q = [[[x,y],0,[]]]
    while(q.length){
        q.sort((a,b)=> a[1]-b[1])
        const [[x1,y1],step,path] = q.shift()
        if(map[y1][x1]==='?'&&!Mapdiscovered) {
            return path.shift()
            
        }
        if(map[y1][x1]==='C'&&Mapdiscovered==='go'){
            return path
        }
        if([x1,y1].join(',')===coordK.join(',') &&Mapdiscovered==='back'){
            return path
        }
        if(x1-1>=0 && val.includes(map[y1][x1-1]) &&(traces[[x1-1,y1].join(',')] || +Infinity)>step+1) q.push([[x1-1,y1],step+1,path.concat(['LEFT'])]),traces[[x1-1,y1].join(',')]=step+1
        if(x1+1<C &&val.includes (map[y1][x1+1]) &&(traces[[x1+1,y1].join(',')] || +Infinity)>step+1) q.push([[x1+1,y1],step+1,path.concat(['RIGHT'])]),traces[[x1+1,y1].join(',')]=step+1
        if(y1-1>=0 && val.includes(map[y1-1][x1])&& (traces[[x1,y1-1].join(',')] || +Infinity)>step+1) q.push([[x1,y1-1],step+1,path.concat(['UP'])]),traces[[x1,y1-1].join(',')]=step+1
        if(y1+1<R && val.includes(map[y1+1][x1]) && (traces[[x1,y1+1].join(',')] || +Infinity)>step+1) q.push([[x1,y1+1],step+1,path.concat(['DOWN'])]),traces[[x1,y1+1].join(',')]=step+1

    }
    // return res.shift()
}
// game loop
let round=0
let dir = []
let coordC = []
let coordK = []
let mapDiscovered =  false
let go =[]
let back=[]
let move=''
while (true /*&& round<R*C*/) {
    var inputs = readline().split(' ');
    const KR = parseInt(inputs[0]); // row where Rick is located.
    const KC = parseInt(inputs[1]); // column where Rick is located.
    if(!coordK.length) coordK = [KC,KR]
    let map = []
    for (let i = 0; i < R; i++) {
        const ROW = readline(); // C of the characters in '#.TC?' (i.e. one line of the ASCII maze).
        // console.error(ROW)
        map.push(ROW.split(''))
        if(!coordC.length){
            const index = ROW.split('').indexOf('C')
            if(index!==-1) coordC = [index, i]
        }
    }
    map[KR][KC]='T'
    map[coordK[1]][coordK[0]]='.'
    console.error(map.map(s=>s.join('')).join('\n'))
    if(!mapDiscovered){
        move=simu(map,KC,KR,false)
        if(!move) mapDiscovered=true
    }
    if(mapDiscovered){
        if(!go.length && !move) {
            go =simu(map,KC,KR,'go')
        }
        move=go.shift()
        if(!move ){
            back=simu(map,KC,KR,'back')
        }
        if(back.length) move=back.shift()
    }

    console.log(move);     

}
