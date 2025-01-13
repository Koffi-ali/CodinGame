function pgcd(a: number, b: number): number {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return Math.abs(a); // Retourner la valeur absolue du PGCD
}

function ppcm(a: number, b: number): number {
    return (Math.abs(a * b) / pgcd(a, b));
}
// Fonction pour résoudre un système d'équations linéaires
function gaussJordan(matrix: number[][]): number[] {
  const n = matrix.length;
    const cols = matrix[0].length;

    for (let col = 0; col < cols; col++) {
        // Étape 1 : Trouver le pivot
        let pivotRow = -1;
        for (let row = col; row < n; row++) {
            if (matrix[row][col] !== 0) {
                pivotRow = row;
                break;
            }
        }

        // Si un pivot a été trouvé
        if (pivotRow !== -1) {
            // Étape 2 : Échanger les lignes pour amener le pivot en haut
            if (pivotRow !== col) {
                [matrix[col], matrix[pivotRow]] = [matrix[pivotRow], matrix[col]];
            }

            // Récupérer le coefficient du pivot
            const pivotValue = matrix[col][col];

            // Étape 3 : Élimination des lignes en dessous
            for (let row = col + 1; row < n; row++) {
                if (matrix[row][col] !== 0) {
                    const currentValue = matrix[row][col];

                    // Calculer le PPCM des valeurs de pivot et courant
                    const ppcmValue = ppcm(pivotValue, currentValue);

                    // Ajuster la ligne en fonction de la relation avec le pivot
                    for (let j = col; j < cols; j++) {
                        matrix[row][j] = (ppcmValue / currentValue) * matrix[row][j] - (ppcmValue / pivotValue) * matrix[col][j];
                    }
                }
            }
        }
        console.error(`step ${col} : ${JSON.stringify(matrix)}`)
    }

  console.error('matriceE : ', matrix)
  const reducedMatrix = matrix
  // Initialiser le vecteur solution avec des zéros
    const solution = new Array(cols).fill(0); // Taille cols, incluant la colonne des résultats
    const dependencies: number[][] = [];  // Stocke les relations entre variables

    // Étape 1 : Remonter la matrice et établir les dépendances
    for (let r = n - 1; r >= 0; r--) {
        const nonZeroIndices = [];
        for (let j = 0; j < cols ; j++) {
            if (reducedMatrix[r][j] !== 0) {
                nonZeroIndices.push(j);  // Indices des variables non nulles
            }
        }

        // Cas où il y a exactement deux variables non nulles
        if (nonZeroIndices.length === 2 && r===n-1) {
            let varSmallIndex = nonZeroIndices[0];
            let varLargeIndex = nonZeroIndices[1];

            const coeffSmall = reducedMatrix[r][varSmallIndex];
            const coeffLarge = reducedMatrix[r][varLargeIndex];

            if (Math.abs(coeffSmall) > Math.abs(coeffLarge)) {
                [varSmallIndex, varLargeIndex] = [varLargeIndex, varSmallIndex];
            }

            const newCoeffSmall = Math.abs(reducedMatrix[r][varSmallIndex]);
            const newCoeffLarge = Math.abs(reducedMatrix[r][varLargeIndex]);
            const factor = pgcd(newCoeffSmall, newCoeffLarge);

            const coeffSmallNormalized = newCoeffSmall / factor;
            const coeffLargeNormalized = newCoeffLarge / factor;

            // Ajouter cette relation : varSmall = -coeffSmallNormalized * varLarge
            dependencies.push([varSmallIndex, varLargeIndex, coeffSmallNormalized, coeffLargeNormalized]);

        } else if (nonZeroIndices.length >=2 ) {
            // Cas où il y a plus de deux variables non nulles
            for (let k = 0; k < nonZeroIndices.length; k++) {
                const varIndex = nonZeroIndices[k];

                // Vérifier si cette variable a une relation dans `dependencies` en tant que varLargeIndex
                const dep = dependencies.find(dep => dep[0] === varIndex);

                if (dep) {
                    // Remplacer la variable avec la relation trouvée
                    const [varSmallIndex, varLargeIndex, coeffSmall, coeffLarge] = dep;

                    // Ajuster la matrice en fonction de la relation pour réduire les variables non nulles
                    reducedMatrix[r][varLargeIndex] += reducedMatrix[r][varIndex] * coeffLarge;
                    reducedMatrix[r][varIndex] = 0;  // Remplacer par zéro
                }
            }

            // Réduire à deux variables après simplification
            const nonZeroIndicesAfterSimplification = [... Array(cols).keys()].filter((idx )=> reducedMatrix[r][idx] !== 0);
            console.error('nonZeroIndicesAfterSimplification :', nonZeroIndicesAfterSimplification)

            if (nonZeroIndicesAfterSimplification.length === 2) {
                let varSmallIndex = nonZeroIndicesAfterSimplification[0];
                let varLargeIndex = nonZeroIndicesAfterSimplification[1];

                const coeffSmall = reducedMatrix[r][varSmallIndex];
                const coeffLarge = reducedMatrix[r][varLargeIndex];

                if (Math.abs(coeffSmall) > Math.abs(coeffLarge)) {
                    [varSmallIndex, varLargeIndex] = [varLargeIndex, varSmallIndex];
                }

                const newCoeffSmall = Math.abs(reducedMatrix[r][varSmallIndex]);
                const newCoeffLarge = Math.abs(reducedMatrix[r][varLargeIndex]);
                const factor = pgcd(newCoeffSmall, newCoeffLarge);

                const coeffSmallNormalized = newCoeffSmall / factor;
                const coeffLargeNormalized = newCoeffLarge / factor;  // Toujours inverser ici

                // avant de push la nouvelle dépendance, mettre à jour la liste des dépendances, en fonction de la nouvelle grande
                // dépendance
                dependencies.push([varSmallIndex, varLargeIndex, coeffSmallNormalized, coeffLargeNormalized]);
                dependencies.forEach(dependency => {
                    if(dependency[1]===varSmallIndex) {
                        dependency[1] = varLargeIndex
                        dependency[3] *=coeffLargeNormalized
                        const fact = pgcd(dependency[2],dependency[3])
                        dependency[2]/=fact
                        dependency[3] /=fact
                    }
                })
                

            }
        }
    }
    // console.error('dependencies :', dependencies)
    // Étape 2 : Fixer la première variable une fois que toutes les relations sont établies
    const firstSolution = Math.max(... dependencies.map(dependency => dependency[2]))
    const [varSmallIndex, varLargeIndex, coeffSmall, coeffLarge] = dependencies[dependencies.length - 1];
    solution[varLargeIndex] = firstSolution;  // Fixer la variable avec le plus grand coefficient
    solution[varSmallIndex] = Math.abs((coeffLarge * solution[varLargeIndex])/coeffSmall);  // Déduire l'autre

    // Étape 3 : Remonter et ajuster les relations pour fixer les autres variables
    for (let i = dependencies.length - 2; i >= 0; i--) {
        const [varSmallIndex, varLargeIndex, coeffSmall, coeffLarge] = dependencies[i];
        if (solution[varLargeIndex] !== 0) {
            solution[varSmallIndex] = Math.abs((coeffLarge * solution[varLargeIndex])/coeffSmall);
        }
    }


    return solution;
}

                        /**** Above functions are to calculate Gauss method (Ax=0) *********/

const s: string = readline();
console.error(s)
const [p1,p2] = s.split(' -> ')
console.error([p1,p2])

const split_p1 = p1.split(' + ')
const match_part1 : [string, number] [][]= split_p1.map((s: string) => [...s.matchAll(/([A-Z][a-z]*)(\d*)/g)].map((list : string[]) => [list[1], list[2]?Number(list[2]):1] ))

const map1 : Map<string, Map<string, number>> = new Map<string, Map<string,number>>

split_p1.forEach((s, index) => {
    if(!map1.has(split_p1[index])) map1.set(split_p1[index], new Map(match_part1[index]))
})
console.error(split_p1)
console.error('match_part1 :',match_part1)
console.error('map1 :', map1)
const split_p2 = p2.split(' + ')
const match_part2: [string, number][][]= split_p2.map((s: string) => [...s.matchAll(/([A-Z][a-z]*)(\d*)/g)].map((list : string[]) => [list[1], list[2]?Number(list[2]):1] ))
const map2 : Map<string, Map<string, number>> = new Map<string, Map<string,number>>
split_p2.forEach((s, index) => {
    if(!map2.has(split_p2[index])) map2.set(split_p2[index], new Map(match_part2[index]))
})
console.error(split_p2)
console.error('match_part2 :',match_part2)
console.error('map2 :', map2)

const atomes : string [] = [... new Set( [... map1.values()].flatMap((atom : Map<string, number>) => [... atom.keys()]).concat( [... map2.values()].flatMap((atom : Map<string, number>) => [... atom.keys()])))]

console.error('atomes :', atomes)

/****  Construction de la matrice de gauss *****/

const matrice : number[][] = []
for (let molecule of split_p1) {
    matrice.push(atomes.map((atome :string) => map1.get(molecule).get(atome) || 0))
}
for (let molecule of split_p2) {
    matrice.push(atomes.map((atome :string) => (map2.get(molecule).get(atome) || 0)*(-1)))
}
console.error('matrice :', matrice)
const transposeMatrix : number[][] = [... Array(atomes.length).keys()].map((index : number) => matrice.map((list :number[])=> list[index]))
console.error('matriceTransposed :', transposeMatrix)

const coefficients : number[] = gaussJordan(transposeMatrix)
console.error('coefficients :',coefficients)

console.log( [split_p1.map((molecule :string, index :number) => coefficients[index]>1?(`${coefficients[index]}`+molecule):molecule).join(' + '), split_p2.map((molecule :string, index :number) => coefficients[index+split_p1.length]>1?(`${coefficients[index+split_p1.length]}`+molecule):molecule).join(' + ')].join(' -> ')  )
