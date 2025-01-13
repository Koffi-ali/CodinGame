import java.util.*;
import java.io.*;
import java.math.*;
import java.util.stream.*;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
class Player {

    public static void main(String args[]) {
        Scanner in = new Scanner(System.in);
        int N = in.nextInt(); // the total number of nodes in the level, including the gateways
        int L = in.nextInt(); // the number of links
        int E = in.nextInt(); // the number of exit gateways
        ArrayList<int[]> links = new ArrayList<int[]>();
        ArrayList<Integer> passerelles = new ArrayList<Integer>();
        HashSet <List<Integer>> setPasserellesGame = new HashSet<List<Integer>>();
        for (int i = 0; i < L; i++) {
            int N1 = in.nextInt(); // N1 and N2 defines a link between these nodes
            int N2 = in.nextInt();
            links.add(new int[] {N1, N2});
        }
        for (int i = 0; i < E; i++) {
            int EI = in.nextInt(); // the index of a gateway node
            passerelles.add(Integer.valueOf(EI));
        }
        System.err.println("links :");
        links.forEach((link) -> {System.err.println(Arrays.toString(link));});
        System.err.println("passerelles :");
        passerelles.forEach((pass) -> {System.err.println(pass);});
        String result  = "";
        // game loop
        while (true) {
            int SI = in.nextInt(); // The index of the node on which the Bobnet agent is positioned this turn
            System.err.println("agent :" + SI);
            // clean the result value at each turn
            result = "";

            // modifier la pile pour inclure l'état
            LinkedList <List<Integer>> pile = new LinkedList<List<Integer>>(); // le premier element de la liste c'est le noeud et le second le step
            HashSet <Integer> set = new HashSet<Integer>();
            set.add(SI);
            ArrayList <List<Integer>> setPasserellesTurn = new ArrayList <List<Integer>>(); // contenir les noeuds qui mènent aux passerelles pour le tour
            pile.add(Arrays.asList(new Integer[]{SI,0,SI}));
            while(pile.size() !=0 ) {
                ArrayList<Integer> head = new ArrayList<>(pile.removeFirst());
                int currentNode = head.removeFirst();
                int step = head.removeFirst();
                System.err.println("currentNde :" + currentNode);
                 System.err.println("head :" + head);
                List<int[]> posAchieved = links.stream()
                                .filter(link -> (link[0] ==  currentNode) || (link[1] ==  currentNode) )
                                .collect(Collectors.toList());
                for (int[] elem : posAchieved) {
                    int ind = currentNode != elem[0] ? 0 : 1;
                    ArrayList <Integer> newHead = new ArrayList<Integer>();
                    for( Integer val : head) {
                            newHead.add(val);
                    }
                    Collections.copy(head, newHead);
                    System.err.println("NewheadBefore :" + newHead);
                    newHead.add(elem[ind]);
                    System.err.println("Newhead :" + newHead);
                    if(passerelles.contains(elem[ind]) && !setPasserellesGame.contains(Arrays.asList(new Integer[] {currentNode,elem[ind]}))) {
                        List<Integer> newList = new ArrayList<>(List.of(currentNode, elem[ind], step + 1));
                        newList.addAll(newHead);
                            setPasserellesTurn.add(newList);
                            System.err.println("SetPasserellesTurn :" + Arrays.deepToString(setPasserellesTurn.toArray()));
                            //  mettre à jour rapidement result si à l'étape 0 on rencontre une passerelle
                            if(step == 0) {
                               result = currentNode + " " + elem[ind]; 
                               break;
                            }
                            
                    }
                    else if(!set.contains(elem[ind]) && !setPasserellesGame.contains(Arrays.asList(new Integer[] {currentNode,elem[ind]}))) {
                        List<Integer> newList = new ArrayList<>(List.of(elem[ind], step + 1));
                        newList.addAll(newHead);
                        pile.addLast(newList);
                        set.add(elem[ind]);
                        System.err.println("pile :" + pile);
                    }
                }
                if(result.length() != 0) {
                       System.err.println("resultIn : " + result);
                        break;
                }
            }
            // déterminer le premier noeud où l'agent de déplace
           List <List<List<Integer>>> mapPasserellesToList =new ArrayList <List<List<Integer>>>();
            if(setPasserellesTurn.size()>1) {
                List<Integer> firstmapPasserelle =  setPasserellesTurn.get(0);
                List<Integer> firstNodes = setPasserellesTurn.stream().
                                                    filter((List<Integer> passerelle) -> passerelle.get(2) == firstmapPasserelle.get(2))
                                                    .map((List<Integer> passerelle) -> passerelle.get(0))
                                                    .collect(Collectors.toSet()).stream()
                                                    .collect(Collectors.toList());
                // à la sortie de la bouche while de la (BFS) on détermine le noeud relié à le plus passerelles puis on supprime une liaison avec ce noeud
                Map<Integer, List<List<Integer>>> mapPasserelles = setPasserellesTurn.stream()
                                                                .collect(Collectors.groupingBy((List<Integer> list) -> list.get(0)));
                System.err.println("map : " +  mapPasserelles);
                mapPasserellesToList = new ArrayList <List<List<Integer>>> (mapPasserelles.values());
                
                // sort mapPasserellesToList par size décroissant puis par step croissant(le plus petit)
                mapPasserellesToList.sort(( List<List<Integer>> liste1 , List<List<Integer>>  liste2) -> {
                    if(liste1.size() > liste2.size()) {
                        return -1;
                    } else if(liste1.size() < liste2.size()) {
                        return 1;
                    } else {
                        return +liste1.get(0).get(2) - liste2.get(0).get(2);
                    }
                });
                System.err.println("mapToList : " +  mapPasserellesToList);
                 mapPasserellesToList =  mapPasserellesToList.stream().
                                               filter(( List<List<Integer>> chemins) -> {
                                                List<Integer> chemin = chemins.get(0);
                                                return !Collections.disjoint( chemin.subList(3,chemin.size()),firstNodes );
                                                })
                                               .collect(Collectors.toList());
                System.err.println("mapToList After filter : " +  mapPasserellesToList);
                }
            List<Integer> first = mapPasserellesToList.size()!=0? mapPasserellesToList.get(0).get(0).subList(0,2) : setPasserellesTurn.get(0).subList(0,2);
            setPasserellesGame.add( first); // ajoute le noeud qui relie la passerelle pour notre tour
            result =  first.get(0) + " " + first.get(1);
            // Example: 0 1 are the indices of the nodes you wish to sever the link between
            System.out.println(result);
        }
    }
}