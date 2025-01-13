/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const line1 = readline();
const line2 = readline();
const line3 = readline();
const line4 = readline();
console.error(line1)
console.error(line2)
console.error(line3)
console.error(line4)
const square = (x,y,map) => {
    const row  = map[y].join('').replace(/0/g,'')
    const col = [... Array(4).keys()].map(j=> map[j][x]).join('').replace(/0/g,'')
    if((x>=0 && x<=1) && (y>=0 && y<=1)){
        // top left square
        const s = map.slice(0,2).map(l=>l.slice(0,2).join('')).join('').replace(/0/g,'')
        return '1234'.split('').filter(a=> !s.includes(a) && !row.includes(a) &&!col.includes(a))
    } else if((x>=2 && x<=3) && (y>=0 && y<=1)){
        // top right square
        const s = map.slice(0,2).map(l=>l.slice(2).join('')).join('').replace(/0/g,'')
        return '1234'.split('').filter(a=> !s.includes(a) && !row.includes(a) &&!col.includes(a))
    } else if((x>=0 && x<=1) && (y>=2 && y<=3)){
        // bottom left
        const s = map.slice(2).map(l=>l.slice(0,2).join('')).join('').replace(/0/g,'')
        return '1234'.split('').filter(a=> !s.includes(a) && !row.includes(a) &&!col.includes(a))
    } else if((x>=2 && x<=3) && (y>=2 && y<=3)){
        // bottom right
        const s = map.slice(2).map(l=>l.slice(2).join('')).join('').replace(/0/g,'')
        return '1234'.split('').filter(a=> !s.includes(a) && !row.includes(a) &&!col.includes(a))
    }
}
const find0 = (map) => {
    console.error('map in find0 :',map)
    for(let i=0;i<4;i++){
        for(let j=0;j<4;j++){
            if(map[j][i]==='0') return [i,j]
        }
    }
    return []
}
const map = [line1.split(''),line2.split(''),line3.split(''),line4.split('')]
let res = []
let found = false
const dfs = (x,y,map) => {
    if(x<0 || x>=4 || y<0 || y>=4 || found ) return
    if(map[y][x]==='0'){
        const val = square(x,y,map)
        for(const n of val) {
            const newMap = JSON.parse(JSON.stringify(map))
            newMap[y][x]=n
            dfs(x,y,newMap)
        }
    } else {
        console.error('map :',map)
        const find_0= find0(map)
        if(!find_0.length) {
            found = true
            res = map
            return
        } else dfs(find_0[0],find_0[1],map)
    }
}
dfs(0,0,map)
console.log(res.map(s=>s.join('')).join('\n'));
