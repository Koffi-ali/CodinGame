/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/


interface Order {
    action1: string,
    action2: string,
    precedence: string
}

interface Action{
    name: string,
}
const N: number = parseInt(readline());
console.error(N)
const actions : Action [] = [];
const orders : Order[] = []
for (let i = 0; i < N; i++) {
    const action: string = readline();
    console.error(action)
    actions.push({name: action})
    /*const listAction : string[] = action.split(" ")
    actions.push({action1: listAction[0], action2: listAction[2], precedence: listAction[1]})*/
}
const nbOrders: number = parseInt(readline());
for (let i = 0; i < nbOrders; i++) {
    const order: string = readline();
    console.error(order)
    const listAction : string[] = order.split(" ")
    orders.push({action1: listAction[0], action2: listAction[2], precedence: listAction[1]})
}

// créer un graphe

const graph : {[name: string] : string[]} = {}

const parents : {[name :string] : number} = {}

actions.forEach((order : Action) => {
    graph[order.name] = []
    parents[order.name] = 0
})

console.error("graph :", graph)
orders.forEach((order: Order) => {
    if(order.precedence === 'before') {
        graph[order.action1].push(order.action2)
        parents[order.action2]++
    } else {
        graph[order.action2].push(order.action1)
        parents[order.action1]++
    }
})

// BFS algorithm to determine he right order
const queue : string[] = Object.keys(graph).filter((action : string) => parents[action]===0).sort((action1 : string, action2 : string) => actions.map(action=>action.name).indexOf(action1) -  actions.map(action=>action.name).indexOf(action2))

const result : string[] = []

while(queue.length) {
   queue.sort((action1 : string, action2 : string) => actions.map(action=>action.name).indexOf(action1) -  actions.map(action=>action.name).indexOf(action2))
   const head : string = queue.shift()!
   result.push(head)

   graph[head].forEach((action : string) => {
        parents[action]--
        if(parents[action] ===0) {
            queue.push(action)
        }
   })

   
}
// BFS algorithm to determine he right order

result.forEach((order : string) => console.log(order))

