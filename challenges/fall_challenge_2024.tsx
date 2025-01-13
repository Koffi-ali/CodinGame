/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const distance =(b1: building, b2: building): number => Math.sqrt((b2.x-b1.x)**2+(b2.y-b1.y)**2)

const pointOnSegment = (b1: building, b2: building, b3: building): boolean => {
    // on veut créer un tube entre b2 et b3 et on veut check s'il passe par b1
    const epsilon : number = 0.00000001
    const diff :number = distance(b1, b2) + distance(b1 ,b3) - distance(b2, b3)
    return (-epsilon <diff) && (diff < epsilon)

}

const orientation = (b1: building, b2: building, b3: building) : number => {
    const prod :number = (b3.y-b1.y) * (b2.x-b1.x) - (b2.y-b1.y) * (b3.x-b1.x)
    if(prod<0)return -1
    else if(prod>0)return 1
    else return 0
}

const segmentsIntersect = (b1: building, b2:building, b3:building, b4:building) : boolean => {
    return  orientation(b1, b2, b3) * orientation(b1, b2, b4) < 0 && orientation(b3, b4, b1) * orientation(b3, b4, b2) < 0
}

// fonction pour vérifier s'il est possible de créer un tube entre 2 bâtiments

const canCreateTube = (Tubes : tube[], Buildings: building[], bId1: number, bId2:number) : boolean => {
        // console.error(`enter for ${bId1}-${bId2}`)
        // b1 et b2 sont les deux bâtiments qui relient le tube que l'on veut créer
        const buildingsEligibles : building[] = Buildings.filter((b:building) => b && ![bId1,bId2].includes(b.id))
        // console.error(' buildingsEligibles : ',buildingsEligibles)
        const tubesEligibles : tube[] = Tubes.filter((t:tube)=> t /*&&[t.buildingId1,t.buildingId2].sort((a,b)=>a-b).join(';') !==[bId1,bId2].sort((a,b)=>a-b).join(';')*/ )
        // console.error(' tubesEligibles : ',tubesEligibles)
        return !buildingsEligibles.some((b:building)=> pointOnSegment(b,Buildings[bId1],Buildings[bId2])) && !tubesEligibles.some((t:tube)=> [t.buildingId1,t.buildingId2].sort((a,b)=>a-b).join(';') !==[bId1,bId2].sort((a,b)=>a-b).join(';')?segmentsIntersect(Buildings[t.buildingId1],Buildings[t.buildingId2],Buildings[bId1],Buildings[bId2]): true)
}


// Fonction pour vérifier la connectivité entre deux bâtiments
const isConnected = (startId: number, targetId: number, tubes: tube[]): boolean => {
    const graph: { [key: number]: number[] } = {};

    // Construire le graphe des tubes
    for (const tube of tubes) {
        if (!graph[tube.buildingId1]) graph[tube.buildingId1] = [];
        if (!graph[tube.buildingId2]) graph[tube.buildingId2] = [];
        graph[tube.buildingId1].push(tube.buildingId2);
        graph[tube.buildingId2].push(tube.buildingId1);
    }

    // Recherche en largeur (BFS) pour vérifier la connectivité
    const queue: number[] = [startId];
    const visited: Set<number> = new Set([startId]);

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === targetId) return true;
        if (!graph[current]) {
            return false; //  'current' n'est pas dans le graphe, la connexion est impossible
        }
        for (const neighbor of graph[current]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return false;  // Pas de connexion trouvée
};

// Fonction pour obtenir le bâtiment le plus proche d'un type d'astronaute donné
const findClosestBuilding = (buildingType: number, source: building, buildings: building[]): building | null => {
    const maxTubes : number = 5
    const targetBuildings = buildings.filter(b => b.type === buildingType && b.tubeAppartenance<maxTubes);
    return targetBuildings
        .sort((a, b) => distance(source, a) - distance(source, b))[0] || null;
};

// Fonction pour établir une connexion à travers d'autres zones si nécessaire
const findAlternateConnection = (zone: building, buildings: building[], tubes: tube[], targetBuilding: building): building | null => {
    const maxTubes : number = 5
    const availableLandingZones = buildings.filter(b => b.type === 0 && b.id !== zone.id && b.tubeAppartenance<maxTubes);

    // Trier les zones d'atterrissage par distance à la zone donnée
    availableLandingZones.sort((a, b) => distance(zone, a) - distance(zone, b));

    // Vérifier chaque zone d'atterrissage triée
    for (const landingZone of availableLandingZones) {
        
        if (canCreateTube(tubes, buildings, zone.id, landingZone.id) && 
            isConnected(landingZone.id, targetBuilding.id, tubes)) {
            return landingZone; // Retourne une zone d'atterrissage qui peut atteindre le bâtiment cible
        }
        
    }
    
    return null; // Aucune connexion alternative trouvée
};

// Algorithme principal
const createTubesAndTeleporters = (
    buildings: building[],
    resources: number,
    tubes: tube[]
): {links: number[][], res: number }=> {
    const newTubes: number[][] = [];  // Liste des tubes à créer
    const maxTubes = 5;

    const updateBuildingLists = () => {
        return {
            landingZones: buildings.filter(b => b && b.type === 0),
            destinationBuildings: buildings.filter(b => b && b.type !== 0)
        };
    };

    // Filtrer les zones d'atterrissage et les bâtiments de destination
    let { landingZones, destinationBuildings } = updateBuildingLists();

    // 1. Analyse de la répartition des astronautes dans chaque zone d'atterrissage
    for (const zone of landingZones) {
        const astronautPercentages: { [key: number]: number } = {};

        // Compter le nombre d'astronautes de chaque type dans la zone d'atterrissage
        for (const astronaut of zone.astronautes) {
            astronautPercentages[astronaut] = (astronautPercentages[astronaut] || 0) + 1/(zone.astronautes.length);
        }

        const dominantAstronautType = Object.keys(astronautPercentages).find(
            type => astronautPercentages[type] > 0.75
        );

        if (dominantAstronautType) {
            // Cas 1 : Astronautes dominants
            const dominantType = parseInt(dominantAstronautType);
            const targetBuilding = findClosestBuilding(dominantType, zone, destinationBuildings);

            if (targetBuilding && zone.tubeAppartenance < maxTubes && targetBuilding.tubeAppartenance < maxTubes && canCreateTube(tubes, buildings, zone.id, targetBuilding.id)) {
                const dist = distance(zone, targetBuilding);
                const cost = Math.ceil(dist * 10);  // Le coût en ressources : 1 ressource pour 0.1km

                if (resources >= cost) {
                    // console.log(`Creating tube between ${zone.id} and ${targetBuilding.id} (cost: ${cost})`);
                    newTubes.push([zone.id, targetBuilding.id]);
                    buildings[zone.id].tubeAppartenance++;
                    buildings[targetBuilding.id].tubeAppartenance++;
                    tubes.push({ buildingId1: zone.id, buildingId2: targetBuilding.id, capacity: 1 });
                    resources -= cost;
                    ({ landingZones, destinationBuildings } = updateBuildingLists())
                }
            } else {
                // Cas 2 : Pas de tube possible, essayer de se connecter via une autre zone d'atterrissage
                const alternateZone = findAlternateConnection(zone, buildings, tubes, targetBuilding);
                if (alternateZone) {
                    const dist = distance(zone, alternateZone);
                    const cost = Math.ceil(dist * 10);

                    if (resources >= cost /*&& canCreateTube(tubes, buildings, zone.id, alternateZone.id)*/) {
                        // console.log(`Creating alternate tube between ${zone.id} and ${alternateZone.id} (cost: ${cost})`);
                        newTubes.push([zone.id, alternateZone.id]);
                        buildings[zone.id].tubeAppartenance++;
                        buildings[alternateZone.id].tubeAppartenance++;
                        tubes.push({ buildingId1: zone.id, buildingId2: alternateZone.id, capacity: 1 });
                        resources -= cost;
                        ({ landingZones, destinationBuildings } = updateBuildingLists())
                    }
                }
            }
        } else {
            // Cas 3 : Répartition presque égale, essayer de connecter aux bâtiments
            // il faut recalculer les  destinationBuildings pour mettre à jour tube appartenance où mettre à jour directement
            // destinationBuildings = buildings.filter(b => b.type !== 0);
            const buildingsToConnect = destinationBuildings.filter(b => zone.astronautes.includes(b.type) && b.tubeAppartenance<maxTubes)
                .sort((a, b) => distance(zone, a) - distance(zone, b)); // Trier par distance

            for (const targetBuilding of buildingsToConnect) {
                if (zone.tubeAppartenance < maxTubes /*&& targetBuilding.tubeAppartenance < maxTubes*/) {
                    const dist = distance(zone, targetBuilding);
                    const cost = Math.ceil(dist * 10);

                    if (resources >= cost && canCreateTube(tubes, buildings, zone.id, targetBuilding.id)) {
                        // console.log(`Creating tube between ${zone.id} and ${targetBuilding.id} (cost: ${cost})`);
                        newTubes.push([zone.id, targetBuilding.id]);
                        buildings[zone.id].tubeAppartenance++;
                        zone.tubeAppartenance++
                        buildings[targetBuilding.id].tubeAppartenance++;
                        tubes.push({ buildingId1: zone.id, buildingId2: targetBuilding.id, capacity: 1 });
                        resources -= cost;
                        ({ landingZones, destinationBuildings } = updateBuildingLists())
                    }
                }
            }
        }
        // Si les ressources sont insuffisantes, on sort
        if (resources <= 0) {
            console.log(`Resources depleted`);
            break;
        }
    }
    // 2. Essayer de relier les bâtiments restants aux zones d'atterrissage
    for (const building of destinationBuildings) {
        if (resources <= 0) break; // Ne pas créer de tubes si les ressources sont épuisées
        
        // Vérifier si le bâtiment a un type correspondant à des zones d'atterrissage
        const matchingLandingZones = landingZones.filter(zone => zone.astronautes.includes(building.type));
        
        // Trier par distance minimale
        matchingLandingZones.sort((a, b) => distance(building, a) - distance(building, b));
        
        for (const zone of matchingLandingZones) {
            if (zone.tubeAppartenance < maxTubes && building.tubeAppartenance < maxTubes) {
                // Vérifier si on peut créer un tube
                if (canCreateTube(tubes, buildings, building.id, zone.id)) {
                    const tubeCost = Math.ceil(distance(building, zone) * 10); // Coût du tube
                    if (resources >= tubeCost) {
                        newTubes.push([building.id, zone.id]);
                        buildings[zone.id].tubeAppartenance++;
                        buildings[building.id].tubeAppartenance++;
                        tubes.push({ buildingId1: building.id, buildingId2: zone.id, capacity: 1 });
                        resources -= tubeCost; // Déduire le coût des ressources
                        ({ landingZones, destinationBuildings } = updateBuildingLists())
                    } else {
                        break; // Pas assez de ressources pour créer plus de tubes
                    }
                }
            }
        }
    }
    return {links:newTubes, res: resources}
}

/*const greedyMST = (Buildings: building[]): [number, number][] => {
    const n = Buildings.length;
    const inMST: boolean[] = Array(n).fill(false);  // Marquer si le point est déjà dans le MST
    const mstEdges: [number, number][] = [];  // Tableau pour stocker les arêtes du MST (juste les IDs)

    inMST[0] = true;  // Commencez avec le premier point déjà inclus dans le MST

    // Répéter jusqu'à ce que l'arbre ait n-1 arêtes
    for (let count = 1; count < n; count++) {
        let minDistance = Infinity;
        let selectedEdge: [number, number] = [-1, -1];

        // Parcourir tous les points déjà dans le MST
        for (let u = 0; u < n; u++) {
            if (inMST[u]) {
                // Pour chaque point dans le MST, trouver le point non encore connecté le plus proche
                for (let v = 0; v < n; v++) {
                    if (!inMST[v]) {
                        if(Buildings[u].tubeAppartenance<=5 && Buildings[v].tubeAppartenance<=5) {
                            const dist = distance(Buildings[u], Buildings[v]);
                            if (dist < minDistance) {
                                minDistance = dist;
                                selectedEdge = [Buildings[u].id, Buildings[v].id];  // Sauvegarder cette arête (juste les IDs)
                            }
                        }
                      
                    }
                }
            }
        }

        // Ajouter l'arête sélectionnée au MST
        const [u, v] = selectedEdge;
        Buildings[u].tubeAppartenance++
        Buildings[v].tubeAppartenance++
        mstEdges.push([u, v]);

        // Marquer le point v comme inclus dans le MST
        inMST[v] = true;
    }

    return mstEdges;
}*/
const construireItineraireDFS = (liens: number[][]): string => {
    // Représenter le graphe sous forme de dictionnaire (liste d'adjacence)
    const graphe: { [key: number]: number[] } = {};
    
    // Construire la liste d'adjacence à partir des liens
    for (const [u, v] of liens) {
        if (!graphe[u]) graphe[u] = [];
        if (!graphe[v]) graphe[v] = [];
        graphe[u].push(v);
        graphe[v].push(u);
    }

    // Tableau pour garder la trace de l'itinéraire
    let itineraire: number[] = [];
    
    // Set pour marquer les arêtes visitées (les liens sont non orientés)
    const visitedEdges: Set<string> = new Set();

    // Fonction DFS récursive pour parcourir le graphe
    function dfs(current: number) {
        itineraire.push(current); // Ajouter le sommet actuel à l'itinéraire
        
        for (const voisin of graphe[current]) {
            const edgeKey = `${Math.min(current, voisin)}-${Math.max(current, voisin)}`;
            
            // Si l'arête n'a pas été visitée, on la parcourt
            if (!visitedEdges.has(edgeKey)) {
                visitedEdges.add(edgeKey);  // Marquer l'arête comme visitée
                dfs(voisin);                // Explorer en profondeur
                itineraire.push(current);   // Ajouter le sommet actuel au retour
            }
        }
    }

    // On commence le DFS à partir du premier sommet du premier lien
    const start = liens[0][0]
    dfs(start);

    // Retourner l'itinéraire sous forme de chaîne de caractères
    return itineraire.join(' ');
}
const managePods = (
    newBuildings: building[],
    Buildings: building[],
    remainingResources: number[],
    Pods: pod[],
    links: number[][]
): string[] => {
    let result: string[] = [];
    // 1. Créer les tubes et récupérer les liens possibles avec les ressources restantes
    // let { links, res: remainingResources } = createTubesAndTeleporters(filteredBuildings, resources, Tubes);
    // console.error('links :',links)
    // console.error('resources after: ', remainingResources)

    // 2. Analyser les zones d'atterrissage et la répartition des astronautes
    const landingZoneAstronauts: { [zoneId: number]: { type: number, count: number }[] } = analyzeLandingZones(newBuildings);

    // 3. Répartition intelligente des tubes et pods
    const podLinks = assignTubesToPods(links, landingZoneAstronauts, Buildings,remainingResources[0]);

    // 4. Créer les pods et définir les itinéraires
    let podId = Pods.length + 1;
    if (remainingResources[0] < 1000) {
        result.push('WAIT');
        const pod: pod = { podId, itineraires: construireItineraireDFS(links), links, actif: false };
        console.error('hier :, ', pod)
        Pods.splice(podId,0,pod);
    }
    console.error('podLinks : ',podLinks)
    console.error('remainingResources: ',remainingResources)
    for (const podSpecificLinks of podLinks) {
        // Générer un itinéraire cyclique pour ce pod à l'aide du DFS ou d'une autre fonction adaptée
        podSpecificLinks.sort((a: number[], b:number[])=> Math.min(Buildings[a[0]].type,Buildings[a[1]].type)-Math.min(Buildings[b[0]].type,Buildings[b[1]].type))
        podSpecificLinks[0]= podSpecificLinks[0].sort((a:number, b:number)=> Buildings[a].type - Buildings[b].type)
        const podItineraries = construireItineraireDFS(podSpecificLinks);

        // Créer le pod
        const pod: pod = { podId, itineraires: podItineraries, links: podSpecificLinks, actif: true };
        Pods.splice(podId,0,pod);
        result.push('POD ' + pod.podId + ' ' + pod.itineraires);

        remainingResources[0] -= 1000; // Déduire le coût de création du pod
        podId++;
    }

    // console.error('linkTubesAfter : ',linksTubes)
    // console.error('resultAfter :',result)

    return result;
};
// Fonction pour analyser la répartition des astronautes dans les zones d'atterrissage
const analyzeLandingZones = (buildings: building[]): { [zoneId: number]: { type: number, count: number }[] } => {
    const landingZoneAstronauts: { [zoneId: number]: { type: number, count: number }[] } = {};

    for (const zone of buildings.filter(b => b.type === 0)) {
        const astronautCounts: { [type: number]: number } = {};

        // Compter le nombre d'astronautes par type dans cette zone
        for (const astronaut of zone.astronautes) {
            astronautCounts[astronaut] = (astronautCounts[astronaut] || 0) + 1;
        }

        // Enregistrer les résultats pour cette zone
        landingZoneAstronauts[zone.id] = Object.entries(astronautCounts).map(([type, count]) => ({
            type: parseInt(type),
            count
        }));
    }

    return landingZoneAstronauts;
};
/*const assignTubesToPods = (
    links: number[][],
    landingZoneAstronauts: { [zoneId: number]: { type: number, count: number }[] },
    Buildings: building[],
    resources: number,
    podCost: number = 1000
): number[][][] => {
    const podLinks: number[][][] = [];
    const maxPods = Math.floor(resources / podCost);
    if (maxPods === 0) {
        console.error('Pas assez de ressources pour créer un pod.');
        return [];
    }

    // Structure pour gérer les tubes assignés par pod
    const tubesPerPod: { [podId: number]: number[][] } = {};
    const graph = buildGraph(links); // Construire un graphe des connexions

    // Suivre les astronautes restants à desservir
    const remainingAstronauts = { ...landingZoneAstronauts };

    // Regrouper les zones d'atterrissage avec des astronautes de différents types
    const zonesGroupedByAstronauts = groupLandingZonesByAstronauts(landingZoneAstronauts);

    // Parcourir toutes les zones et assigner les itinéraires de pods
    for (let podId = 0; podId < maxPods; podId++) {
        let podPath: number[][] = []; // Assurer que podPath est un tableau de tableaux
        let assignedZones: Set<number> = new Set(); // Pour suivre les zones déjà desservies par ce pod

        // Parcourir les zones regroupées par type d'astronaute
        for (const zone of zonesGroupedByAstronauts) {
            const zoneId = zone.zoneId;

            // Si cette zone n'a pas encore été desservie par le pod
            if (!assignedZones.has(zoneId) && remainingAstronauts[zoneId]) {
                assignedZones.add(zoneId); // Marquer la zone comme desservie

                const astronautDistribution = remainingAstronauts[zoneId];

                // Trouver les bâtiments correspondants pour chaque type d'astronaute
                for (const { type } of astronautDistribution) {
                    const targetBuildings = Buildings.filter(b => b.type === type);

                    // Chercher des tubes pertinents pour cette zone
                    const relevantTubes = findRelevantTubesWithIntermediates(graph, zoneId, targetBuildings);
                    if (relevantTubes.length > 0) {
                        // Assurer que relevantTubes est un tableau de tableaux
                        podPath = podPath.concat(relevantTubes); // Concaténer les tubes trouvés
                    }
                }
            }
        }

        // Assigner les tubes trouvés au pod
        if (podPath.length > 0) {
            tubesPerPod[podId] = podPath; // Assigner le chemin au pod
        }
    }

    // Vérifier les bâtiments non desservis à partir des astronautes restants
    const buildingsToServe: Set<number> = new Set();

    for (const zoneId in remainingAstronauts) {
        const astronautDistribution = remainingAstronauts[zoneId];
        for (const { type, count } of astronautDistribution) {
            // Trouver les bâtiments correspondants
            const targetBuildings = Buildings.filter(b => b.type === type);
            targetBuildings.forEach(b => buildingsToServe.add(b.id));
        }
    }

    // Rechercher des tubes pour desservir les bâtiments restants
    for (const podId in tubesPerPod) {
        const podPath = tubesPerPod[podId];

        // Obtenir tous les bâtiments desservis par ce pod
        const servedBuildings = new Set<number>();

        for (const [start, end] of podPath) {
            servedBuildings.add(end); // Ajout du bâtiment de destination
        }

        // Vérifier quels bâtiments restent non desservis
        const unsatisfiedBuildings = Array.from(buildingsToServe).filter(b => !servedBuildings.has(b));

        if (unsatisfiedBuildings.length > 0) {
            // Pour chaque bâtiment non desservi, tenter d'ajouter des tubes
            unsatisfiedBuildings.forEach(buildingId => {
                const building = Buildings.find(b => b.id === buildingId);
                if (building) {
                    // Chercher les zones d'atterrissage qui peuvent accéder à ce bâtiment
                    for (const zoneId in landingZoneAstronauts) {
                        const astronautDistribution = landingZoneAstronauts[zoneId];
                        const types = astronautDistribution.map(a => a.type);

                        // Vérifier si ce bâtiment peut accueillir des astronautes de ces types
                        if (types.includes(building.type)) {
                            // Trouver des tubes de cette zone vers le bâtiment
                            const relevantTubes = findRelevantTubesWithIntermediates(graph, parseInt(zoneId), [building]);
                            if (relevantTubes.length > 0) {
                                tubesPerPod[podId] = (tubesPerPod[podId] || []).concat(relevantTubes);
                            }
                        }
                    }
                }
            });
        }
    }

    return Object.values(tubesPerPod);
};*/
const assignTubesToPods = (
    links: number[][],
    landingZoneAstronauts: { [zoneId: number]: { type: number, count: number }[] },
    Buildings: building[],
    resources: number,
    podCost: number = 1000,
): number[][][] => {
    const podLinks: number[][][] = [];
    const maxPods = Math.floor(resources / podCost);
    if (maxPods === 0) {
        console.error('Pas assez de ressources pour créer un pod.');
        return [];
    }

    const usedTubes = new Set<string>(); // Pour suivre les tubes déjà utilisés sous forme unique
    const tubesPerPod: { [podId: number]: number[][] } = {};
    const graph = buildGraph(links); // Construire un graphe des connexions
    const remainingAstronauts = { ...landingZoneAstronauts };

    // Grouper les zones d'atterrissage en fonction des astronautes présents
    const zonesGroupedByAstronauts = groupLandingZonesByAstronauts(landingZoneAstronauts);

    // Fonction pour générer un identifiant unique pour un tube (indépendamment de l'ordre)
    const getTubeKey = (start: number, end: number): string => {
        return `${Math.min(start, end)}-${Math.max(start, end)}`;
    };

    // 1. Clustering des zones en fonction de la proximité
    const clusterZonesByProximity = (zones: { zoneId: number }[], maxClusters: number) => {
        const clusters: number[][] = [];
        const assignedZones = new Set<number>();

        for (const zone of zones) {
            if (assignedZones.has(zone.zoneId)) continue;

            let cluster: number[] = [zone.zoneId];
            assignedZones.add(zone.zoneId);

            // Trouver les zones les plus proches et les ajouter au cluster
            let closestZones = zones
                .filter(z => !assignedZones.has(z.zoneId)) // Filtrer les zones déjà assignées
                .map(z => ({
                    zoneId: z.zoneId,
                    distance: distance(Buildings[zone.zoneId], Buildings[z.zoneId]),
                }))
                .sort((a, b) => a.distance - b.distance); // Trier par distance croissante

            // Ajouter les zones proches au cluster
            while (closestZones.length > 0 && cluster.length < Math.ceil(zones.length / maxClusters)) {
                const closest = closestZones.shift();
                cluster.push(closest.zoneId);
                assignedZones.add(closest.zoneId);
            }

            clusters.push(cluster);
        }

        return clusters;
    };

    // Clustering des zones selon leur proximité
    const clusters = clusterZonesByProximity(zonesGroupedByAstronauts, maxPods);

    // 2. Répartir les clusters entre les pods
    for (let podId = 0; podId < maxPods; podId++) {
        const cluster = clusters[podId];
        if (!cluster) continue; // Si plus de clusters que de pods, certains pods peuvent ne pas avoir de cluster.

        let podPath: number[][] = [];

        for (const zoneId of cluster) {
            const astronautDistribution = remainingAstronauts[zoneId];

            // Rechercher des tubes pertinents pour chaque type d'astronaute
            for (const { type } of astronautDistribution) {
                const targetBuildings = Buildings.filter(b => b.type === type);

                // Chercher des tubes non encore utilisés
                const relevantTubes = findRelevantTubesWithIntermediates(graph, zoneId, targetBuildings)
                    .filter(tube => !usedTubes.has(getTubeKey(tube[0], tube[1])));

                if (relevantTubes.length > 0) {
                    podPath = podPath.concat(relevantTubes);
                    relevantTubes.forEach(tube => usedTubes.add(getTubeKey(tube[0], tube[1]))); // Marquer comme utilisé
                }
            }
        }

        // Assigner les tubes trouvés au pod
        if (podPath.length > 0) {
            tubesPerPod[podId] = podPath;
        }
    }

    // Vérification des bâtiments non desservis à partir des astronautes restants
    const buildingsToServe: Set<number> = new Set();
    for (const zoneId in remainingAstronauts) {
        const astronautDistribution = remainingAstronauts[zoneId];
        for (const { type, count } of astronautDistribution) {
            const targetBuildings = Buildings.filter(b => b.type === type);
            targetBuildings.forEach(b => buildingsToServe.add(b.id));
        }
    }

    // Pour chaque pod, on traite les bâtiments non desservis
    for (const podId in tubesPerPod) {
        const podPath = tubesPerPod[podId];
        const servedBuildings = new Set<number>();

        for (const [start, end] of podPath) {
            servedBuildings.add(end);
        }

        const unsatisfiedBuildings = Array.from(buildingsToServe).filter(b => !servedBuildings.has(b));

        if (unsatisfiedBuildings.length > 0) {
            unsatisfiedBuildings.forEach(buildingId => {
                const building = Buildings.find(b => b.id === buildingId);
                if (building) {
                    // Rechercher des tubes pour desservir les bâtiments restants
                    for (const zoneId in landingZoneAstronauts) {
                        const astronautDistribution = landingZoneAstronauts[zoneId];
                        const types = astronautDistribution.map(a => a.type);

                        if (types.includes(building.type)) {
                            const relevantTubes = findRelevantTubesWithIntermediates(graph, parseInt(zoneId), [building])
                                .filter(tube => !usedTubes.has(getTubeKey(tube[0], tube[1])));

                            if (relevantTubes.length > 0) {
                                tubesPerPod[podId] = (tubesPerPod[podId] || []).concat(relevantTubes);
                                relevantTubes.forEach(tube => usedTubes.add(getTubeKey(tube[0], tube[1]))); // Marquer comme utilisé
                            }
                        }
                    }
                }
            });
        }
    }

    return Object.values(tubesPerPod);
};


// Fonction pour regrouper les zones d'atterrissage selon les types d'astronautes présents
const groupLandingZonesByAstronauts = (
    landingZoneAstronauts: { [zoneId: number]: { type: number, count: number }[] },
): { zoneId: number, types: number[] }[] => {
    const zonesGrouped: { zoneId: number, types: number[] }[] = [];

    for (const zoneId in landingZoneAstronauts) {
        const astronautDistribution = landingZoneAstronauts[zoneId];
        const types = astronautDistribution.map(a => a.type);
        zonesGrouped.push({ zoneId: parseInt(zoneId), types });
    }

    // Trier les zones en fonction du nombre d'astronautes
    return zonesGrouped.sort((a, b) => b.types.length - a.types.length);
};

// Fonction pour construire un graphe des connexions entre zones et buildings
const buildGraph = (links: number[][]): Map<number, number[]> => {
    const graph = new Map<number, number[]>();

    for (const [building1Id, building2Id] of links) {
        if (!graph.has(building1Id)) graph.set(building1Id, []);
        if (!graph.has(building2Id)) graph.set(building2Id, []);

        graph.get(building1Id)!.push(building2Id);
        graph.get(building2Id)!.push(building1Id);
    }

    return graph;
};
// Fonction pour trouver des tubes pertinents en passant éventuellement par des zones intermédiaires
const findRelevantTubesWithIntermediates = (
    graph: Map<number, number[]>,
    zoneId: number,
    targetBuildings: building[]
): number[][] => {
    const visited = new Set<number>();
    const tubes: number[][] = [];
    
    const dfs = (currentId: number, path: number[] = []) => {
        if (visited.has(currentId)) return false;
        visited.add(currentId);

        // Si nous atteignons un bâtiment cible, enregistrer le chemin parcouru
        if (targetBuildings.some(b => b.id === currentId)) {
            path.push(currentId);
            for (let i = 0; i < path.length - 1; i++) {
                tubes.push([path[i], path[i + 1]]);
            }
            return true;
        }

        // Explorer les connexions adjacentes
        for (const neighborId of graph.get(currentId) || []) {
            if (dfs(neighborId, [...path, currentId])) return true;
        }

        return false;
    };

    // Lancer la recherche à partir de la zone d'atterrissage
    dfs(zoneId);

    return tubes;
};

const simulation = (Buildings: building[], Tubes: tube[], Pods: pod[], newBuildings : building[], resources: number) : string => {
    const filteredBuildings :building[] = !Buildings.length?newBuildings:Buildings
    let result : string[] = [] 
    console.error('pods :', Pods)
    if(!Tubes.length) {
        /**
         * S'il n'ya pas de tubes, en créer en reliant d'abord les pistes d'attérissages entre elles
         * Puis ensuite en reliant les pistes d'attérissages avec les autres buildings
         */
        let { links, res: remainingResources } = createTubesAndTeleporters(filteredBuildings, resources, Tubes);
            // Ajouter les liens des tubes au résultat toujours avant les pods
        const linksTubes: string[] = links.map((a: number[]) => 'TUBE ' + a[0] + ' ' + a[1]);
        result = result.concat(linksTubes);
        
       /*let {links, res : res} = createTubesAndTeleporters(filteredBuiildings,resources,Tubes)
       links = links.sort((a: number[], b:number[])=> Math.min(Buildings[a[0]].type,Buildings[a[1]].type)-Math.min(Buildings[b[0]].type,Buildings[b[1]].type))
       console.error('links :',links)
       console.error('resources after: ', res)
       links[0]= links[0].sort((a:number, b:number)=> Buildings[a].type - Buildings[b].type)
       const linksTubes : string[] = links.map((a:number[])=> 'TUBE '+a[0]+ ' '+ a[1])
       result = result.concat(linksTubes)

       // création du pod
       const pod : pod = {podId:1, itineraires: construireItineraireDFS(links), links, actif: res>1000 }
       Pods.splice(pod.podId,0,pod)
       res>1000?result.push('POD '+pod.podId+ ' '+pod.itineraires):result.push('WAIT')*/
       result = result.concat(managePods(filteredBuildings,filteredBuildings,[remainingResources],Pods, links))
       console.error('result :', result)

    }
    else {
        /**  il ya des pods
         * et vérifier les pods qui n'étaient pas actif au tour précédent pour en créer de nouveau
         *
        */
        // result = result.concat(managePods(filteredBuiildings,resources,Tubes,Pods))
        // 1. Vérifier les pods existants et réactiver ceux qui étaient inactifs
        let res: number[] = [resources]
        result = result.concat(reactivatePods(Pods, res));
        resources = res[0]

        // 2. Vérifier les zones d'atterrissage non desservies et créer des téléporteurs si nécessaire
        const undrainedLandingZones = findUndrainedZones(filteredBuildings, Pods);
        if (undrainedLandingZones.length > 0) {
            if (resources >= 5000) {
                // Créer des téléporteurs pour ces zones si les ressources sont suffisantes
                console.error('yes i can')
                res = [resources]
                const {result :Res, links :linksTeleport} = createTeleporters(undrainedLandingZones, Buildings,Tubes, res)
                result = result.concat(Res);
                resources= res[0]
                const resInter : number[] = [resources]
                result = result.concat(Res);
                console.error('Tubbbes : ', linksTeleport)
                linksTeleport.forEach((links : number[][]) => {
                    console.error('linkkkk :', links)
                    if (resInter[0] < 1000) {
                        result.push('WAIT');
                        const podId : number = Pods.length + 1
                        const pod: pod = { podId, itineraires: construireItineraireDFS(links), links, actif: false };
                        Pods.splice(podId,0,pod);
                    } else {
                        const podId : number = Pods.length + 1
                        links.sort((a: number[], b:number[])=> Math.min(Buildings[a[0]].type,Buildings[a[1]].type)-Math.min(Buildings[b[0]].type,Buildings[b[1]].type))
                        links[0]= links[0].sort((a:number, b:number)=> Buildings[a].type - Buildings[b].type)
                        const podItineraries = construireItineraireDFS(links);
                
                        // Créer le pod
                        const pod: pod = { podId, itineraires: podItineraries, links, actif: true };
                        Pods.splice(podId,0,pod);
                        result.push('POD ' + pod.podId + ' ' + pod.itineraires);
                
                        resInter[0] -= 1000; // Déduire le coût de création du pod
                    }
                    // result = result.concat(managePods(undrainedLandingZones,Buildings,resInter ,Pods, link))
                })
                resources = resInter[0]
            } else {
                // Sinon, tenter de les relier via des tubes 
                // Ne rien faire pour le moment
                // result = result.concat(tryRelinkUndrainedZones(undrainedLandingZones, Tubes, Buildings));
            }
        }

        // 3. Gérer les nouveaux buildings
        if (newBuildings.length > 0) {
            /*result = result.concat(handleNewBuildings(newBuildings, filteredBuildings, Tubes, Pods, resources));*/
            // let { links, res: remainingResources } = createTubesAndTeleporters([...newBuildings, ...Buildings], resources, Tubes);
            // // Ajouter les liens des tubes au résultat toujours avant les pods
            // const linksTubes: string[] = links.map((a: number[]) => 'TUBE ' + a[0] + ' ' + a[1]);
            // result = result.concat(linksTubes);
            // if(links.length)  result = result.concat(managePods(newBuildings,Buildings,[remainingResources],Pods, links))
            // console.error('result :', result)
        }
        else {
            // essayer de créer des téleport au max quand il ya des ressources entre bâtiments qui n'ont pas de téléport
            const availableBuildingsWithoutTeleport : building[] = Buildings.filter((b: building) => b.type === 0 && b.teleport<1)
            // console.error('buildingsId: ',availableBuildingsWithoutTeleport)
            // console.error('buildings: ',Buildings.map((b:building)=> b.id))
            res = [resources]
            if( resources>=5000 ) {
                const {result :Res, links :linksTeleport} = createTeleporters(availableBuildingsWithoutTeleport, Buildings,Tubes, res)
                resources = res[0]
                const resInter : number[] = [resources]
                result = result.concat(Res);
                console.error('Tubbbes : ', linksTeleport)
                linksTeleport.forEach((links : number[][]) => {
                    console.error('linkkkk :', links)
                    if (resInter[0] < 1000) {
                        result.push('WAIT');
                        const podId : number = Pods.length + 1
                        const pod: pod = { podId, itineraires: construireItineraireDFS(links), links, actif: false };
                        Pods.splice(podId,0,pod);
                    } else {
                        const podId : number = Pods.length + 1
                        links.sort((a: number[], b:number[])=> Math.min(Buildings[a[0]].type,Buildings[a[1]].type)-Math.min(Buildings[b[0]].type,Buildings[b[1]].type))
                        links[0]= links[0].sort((a:number, b:number)=> Buildings[a].type - Buildings[b].type)
                        const podItineraries = construireItineraireDFS(links);
                
                        // Créer le pod
                        const pod: pod = { podId, itineraires: podItineraries, links, actif: true };
                        Pods.splice(podId,0,pod);
                        result.push('POD ' + pod.podId + ' ' + pod.itineraires);
                
                        resInter[0] -= 1000; // Déduire le coût de création du pod
                    }
                    // result = result.concat(managePods(undrainedLandingZones,Buildings,resInter ,Pods, link))
                })
                // resources= res[0]
            }
        }

    }
    // mettre à jour les nouveaux buildings dans Buildings
    newBuildings.forEach((b: building) => Buildings.splice(b.id,0,b))
    return result.join(';')
}
/**
 * Fonction pour réactiver les pods qui sont inactifs si les ressources le permettent
 */
const reactivatePods = (Pods: pod[], resources: number[]): string[] => {
    let result: string[] = [];
    Pods.forEach(pod => {
        if (!pod.actif && resources[0] >= 1000) {
            pod.actif = true;
            resources[0] -= 1000;
            result.push(`POD ${pod.podId} ${pod.itineraires}`);
        }
    });
    return result;
};
/**
 * Fonction pour identifier les zones d'atterrissage non desservies
 */
const findUndrainedZones = (Buildings: building[], Pods: pod[]): building[] => {
    let undrainedZones: building[] = [];
    
    Buildings.forEach(building => {
        if (building.type === 0) { // Si c'est une zone d'atterrissage
            const isDrained = building.teleport===0?Pods.some(pod => pod.links.some(link => link.includes(building.id))):true;
            if (!isDrained) undrainedZones.push(building);
        }
    });

    return undrainedZones;
};
/**
 * Fonction pour créer des téléporteurs pour des zones non desservies
 */
const createTeleporters = (
    zones: building[], // Zones d'atterrissage à téléporter
    Buildings: building[], // Liste de tous les bâtiments
    Tubes: tube[],
    resources: number[] // Ressources disponibles
): {result :string[], links: number[][][]} => {
    let result: string[] = [];
    const links : number[][][] = []
    // Fonction pour trier les astronautes par type (ID) dans une zone, par ordre décroissant
    const groupAstronautsById = (zone: building): { id: number, count: number }[] => {
        const counts = zone.astronautes.reduce((acc: { [id: number]: number }, id1: number) => {
            acc[id1] = (acc[id1] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts)
            .map(([id, count]) => ({ id: Number(id), count }))
            .sort((a, b) => b.count - a.count); // Tri par ordre décroissant
    };

    // Fonction pour trouver des bâtiments non téléportés compatibles
    const findCompatibleBuilding = (majorType: number) => {
        return Buildings.find(b => b && b.type === majorType && b.teleport < 1);
    };

    // Fonction pour trouver une autre zone hors de "zones" avec un astronaute d'un ID spécifique
    const findZoneWithAstronautId = (zone: building, id: number) => {
        return Buildings
            .filter(b => !zones.some(z => z.id === b.id)) // Exclure les zones dans "zones"
            .sort((a, b) => (a.teleport === b.teleport) ? 0 : a.teleport ? 1 : -1) // Prioriser celles avec téléport
            .find(b => b.astronautes.includes(id) && canCreateTube( Tubes,Buildings,zone.id, b.id) && b.tubeAppartenance<5);
    };

    for (const zone of zones) {
        console.error('zone  :', zone);
        const linkZone : number [][] = [] // linkZoone est pour conserver les tubes créer crées en cas de non téléport

        // Trouver le type d'astronaute majoritaire dans la zone non desservie
        const groupedAstronauts = groupAstronautsById(zone);
        console.error('grouped :',groupedAstronauts)
        const majorType = groupedAstronauts[0].id;
        console.error('grouAs :', majorType)

        // Chercher un building qui accepte ce type d'astronaute
        let targetBuilding = findCompatibleBuilding(majorType);
        console.error('targetBuilding  :', targetBuilding);

        if (targetBuilding) {
            // Si un téléporteur peut être construit
            if(resources[0] >= 5000) {
                Buildings[zone.id].teleport++;
                Buildings[targetBuilding.id].teleport++;
                result.push(`TELEPORT ${zone.id} ${targetBuilding.id}`);
                resources[0] -= 5000;
            }
        } else {
            // Aucun téléporteur trouvé, on essaie de créer des tubes
            console.error(`Pas de téléporteur disponible pour la zone ${zone.id}, tentative de création de tubes...`);

            // Pour chaque groupe d'astronautes trié par nombre décroissant
            for (const group of groupedAstronauts) {
                const astronautId = group.id;
                console.error('astronauTid :', astronautId)

                // Chercher une autre zone hors de "zones" avec des astronautes de même type
                const targetZone = findZoneWithAstronautId(zone,astronautId);
                console.error('targetZone: ,',targetZone)
                // Chercher le bâtiment le plus proche avec le même type d'astronaute
                // console.error('tubes : ', Tubes)
                const nearbyBuilding = Buildings
                    .filter(b =>  b.type === astronautId && canCreateTube(Tubes,Buildings,zone.id, b.id) && b.tubeAppartenance<5)
                    .sort((a, b) => distance(zone, a) - distance(zone, b))[0]; // Trouver le plus proche
                console.error('nearBuilding: ',nearbyBuilding)
                // console.error('buidinngsFFF : ', Buildings.map(b =>b.id))

                if (targetZone) {
                    // Créer un tube avec une autre zone
                    const dist = distance(zone, targetZone);
                    const tubeCost = 10 * dist;

                    if (resources[0] >= tubeCost ) {
                        console.error(`TUBE créé entre ${zone.id} et zone ${targetZone.id} pour le type ${astronautId}`);
                        result.push(`TUBE ${zone.id} ${targetZone.id}`);
                        Tubes.push({ buildingId1: zone.id, buildingId2: targetZone.id, capacity: 1 });
                        linkZone.push([zone.id,targetZone.id])
                        Buildings[zone.id].tubeAppartenance++
                        Buildings[targetZone.id].tubeAppartenance++
                        // zone.tubeAppartenance++
                        resources[0] -= tubeCost;
                    }
                } else if (nearbyBuilding && nearbyBuilding.tubeAppartenance < 5 && zone.tubeAppartenance<5) {
                    // Créer un tube avec le bâtiment le plus proche disponible
                    const dist = distance(zone, nearbyBuilding);
                    const tubeCost = 10 * dist;
                    console.error('resource near :', resources[0]-tubeCost)

                    if (resources[0] >= tubeCost) {
                        console.error(`TUBE créé entre ${zone.id} et building ${nearbyBuilding.id} pour le type ${astronautId}`);
                        result.push(`TUBE ${zone.id} ${nearbyBuilding.id}`);
                        Tubes.push({ buildingId1: zone.id, buildingId2: nearbyBuilding.id, capacity: 1 });
                        linkZone.push([zone.id,nearbyBuilding.id])
                        Buildings[nearbyBuilding.id].tubeAppartenance++
                        Buildings[zone.id].tubeAppartenance++
                        // zone.tubeAppartenance++
                        resources[0] -= tubeCost;
                    }
                }
            }
        }
        if(linkZone.length) links.push(linkZone)  
    }

    return {result,links};
};

const findMajorAstronautType = (zone: building): number => {
    const astronautCount: { [type: number]: number } = {};
    console.error('zone : ', zone)

    // Compter les astronautes par type dans la zone
    zone.astronautes.forEach(astronaut => {
        if (!astronautCount[astronaut]) {
            astronautCount[astronaut] = 0;
        }
        astronautCount[astronaut]++;
    });

    // Retourner le type avec le plus grand nombre d'astronautes
    return Object.keys(astronautCount).reduce((a, b) => astronautCount[a] >= astronautCount[b] ? a : b) as unknown as number;
};
/**
 * Fonction pour gérer les nouveaux buildings apparus lors d'un nouveau tour
 */
const handleNewBuildings = (newBuildings: building[], Buildings: building[], Tubes: tube[], Pods: pod[], resources: number): string[] => {
    let result: string[] = [];
    
    newBuildings.forEach(newBuilding => {
        const nearestLandingZone = Buildings.find(b => b.type === 0 && isConnected(newBuilding.id, b.id, Tubes));
        if (nearestLandingZone) {
            result.push(`TUBE ${newBuilding.id} ${nearestLandingZone.id}`);
        }
    });

    return result;
};
type building = {
    id: number;
    type: number;
    x: number;
    y: number;
    tubeAppartenance: number  /** un bâtiment ne peut être réliée à au plus 5 tubes**/
    teleport : number  /** un batiment ne peut être contenir soit le point d'entrée ou le point de sortie d'un téléporteur **/
    astronautes: number[]
}

type tube = {
    buildingId1: number;
    buildingId2: number;
    capacity : number /** Nombre de passager que peut contenir le tube**/
}

type pod = {
    podId : number;
    itineraires: string
    links : number [][] /** Links sert juste à garder une trace des tubes constituants l'intinéraire */
    actif : boolean
}
const Buildings :building[] = []
const Pods: pod[] = []
let result = ''
while (true) {
    const Tubes : tube[] = []
    const newBuildings : building[] = []
    const resources: number = parseInt(readline());
    console.error('ressources: ', resources)
    const numTravelRoutes: number = parseInt(readline());
    console.error('num :',numTravelRoutes)
    for (let i = 0; i < numTravelRoutes; i++) {
        var inputs: string[] = readline().split(' ');
        const buildingId1: number = parseInt(inputs[0]);
        const buildingId2: number = parseInt(inputs[1]);
        const capacity: number = parseInt(inputs[2]);
        if(capacity)Tubes.push({buildingId1,buildingId2,capacity}) // je ne push que les vrai tubes et pas de teleport
    }
    const numPods: number = parseInt(readline());
    console.error('podsNum :', numPods)
    for (let i = 0; i < numPods; i++) {
        const podProperties: string[] = readline().split(' ');
        console.error('pods :', podProperties)
        const podId : number = parseInt(podProperties[0])
        const nbTrajets : number = parseInt(podProperties[1])
        const itineraires : string = podProperties.slice(2).join('')
        // Pods.splice(podId,0,{podId,itineraires})
    }
    const numNewBuildings: number = parseInt(readline());
    for (let i = 0; i < numNewBuildings; i++) {
        const buildingProperties: string[] = readline().split(' ');
        const type: number = parseInt(buildingProperties[0])
        if(type===0){
            // aire d'attérissage
            const newBuilding : building = {id:parseInt(buildingProperties[1]),type:type,x:parseInt(buildingProperties[2]),y:parseInt(buildingProperties[3]),tubeAppartenance:0,teleport:0, astronautes:[]}
            // add this building to the liste of buildings
            newBuilding.astronautes= buildingProperties.slice(5).map((s: string)=> parseInt(s))
            newBuildings.splice(parseInt(buildingProperties[1]),0,newBuilding)
            // newBuildings.push( newBuilding)
        } else {
            const newBuilding : building = {id:parseInt(buildingProperties[1]),type:type,x:parseInt(buildingProperties[2]),y:parseInt(buildingProperties[3]),tubeAppartenance:0,teleport:0, astronautes:[]}
            newBuildings.splice(parseInt(buildingProperties[1]),0,newBuilding)
            // newBuildings.push(newBuilding)
        }
    }
    // console.error('buidings :', Buildings)

    // Write an action using console.log()
    // To debug: console.error('Debug messages...');

   /* console.log('TUBE 0 1;TUBE 0 2;POD 42 0 1 0 2 0 1 0 2');     // TUBE | UPGRADE | TELEPORT | POD | DESTROY | WAIT*/
   const res = simulation(Buildings, Tubes, Pods, newBuildings, resources)
   result = res || 'WAIT'
   console.log(result)

}
