// Lire les entrées
const L: string = readline();
const N: number = parseInt(readline());
const dict: string[] = [];
for (let i = 0; i < N; i++) {
    const W: string = readline();
    dict.push(W);
}

// Map pour convertir les lettres en code Morse
const map: Map<string, string> = new Map([
    ['A', '.-'], ['B', '-...'], ['C', '-.-.'], ['D', '-..'], ['E', '.'],
    ['F', '..-.'], ['G', '--.'], ['H', '....'], ['I', '..'], ['J', '.---'],
    ['K', '-.-'], ['L', '.-..'], ['M', '--'], ['N', '-.'], ['O', '---'],
    ['P', '.--.'], ['Q', '--.-'], ['R', '.-.'], ['S', '...'], ['T', '-'],
    ['U', '..-'], ['V', '...-'], ['W', '.--'], ['X', '-..-'], ['Y', '-.--'],
    ['Z', '--..']
]);

// Encodage des mots du dictionnaire en Morse
const encodedDict: string[] = dict.map(word => 
    word.split('').map(char => map.get(char)!).join('')
);

// Tableau dp où dp[i] est le nombre de façons de former L[0:i] en utilisant les mots du dictionnaire
const dp: number[] = Array(L.length + 1).fill(0);
dp[0] = 1; // Il y a 1 manière de former une chaîne vide

// Remplir le tableau dp
for (let i = 0; i <= L.length; i++) {
    if (dp[i] > 0) {  // Si nous pouvons former L[0:i]
        for (const word of encodedDict) {
            const len = word.length;
            if (i + len <= L.length && L.slice(i, i + len) === word) {
                dp[i + len] += dp[i];
            }
        }
    }
}

// Résultat : nombre de façons de former L
console.log(dp[L.length]);
