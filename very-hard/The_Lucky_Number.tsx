/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs: string[] = readline().split(' ');
const L: bigint = BigInt(parseInt(inputs[0]));
const R: bigint = BigInt(parseInt(inputs[1]));
console.error(L,R)

// Write an answer using console.log()
// To debug: console.error('Debug messages...');
function countMagicalNumbersUpTo(N: string): bigint {
    const len = N.length;
    let memo = new Map<string, bigint>(); // Pour mémoriser les résultats

    function dp(pos: number, isTight: boolean, hasSix: boolean, hasEight: boolean): bigint {
        // Clé pour la mémoïsation
        const key = `${pos}-${isTight ? 1 : 0}-${hasSix ? 1 : 0}-${hasEight ? 1 : 0}`;
        if (memo.has(key)) {
            return memo.get(key)!; // Retourner la valeur mémorisée
        }

        if (pos === len) {
            return (hasSix && !hasEight) || (hasEight && !hasSix) ? BigInt(1) : BigInt(0);
        }

        let limit = isTight ? Number(N[pos]) : 9;
        let totalCount = BigInt(0);

        for (let digit = 0; digit <= limit; digit++) {
            totalCount += dp(
                pos + 1,
                isTight && (digit === limit),
                hasSix || (digit === 6),
                hasEight || (digit === 8)
            );
        }

        memo.set(key, totalCount); // Mémoriser le résultat
        return totalCount;
    }

    return dp(0, true, false, false);
}

function countMagicalInRange(L: bigint, R: bigint): bigint {
    const RCount = countMagicalNumbersUpTo(R.toString());
    const LCount = countMagicalNumbersUpTo((L - BigInt(1)).toString());

    return RCount - LCount;
}

console.log(countMagicalInRange(L, R).toString()); // Devrait afficher "4"


