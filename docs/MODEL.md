# Modèle de décision — BIMO Factory Challenge

Version 1.1.0. Montants en k€, volumes en tonnes, taux internes entre 0 et 1.

Le modèle est spécifique aux règles et cartes fournies par l’équipe Oreo. Il sert à comparer des décisions avant les jets. Il ne garantit ni le classement final ni un optimum global.

## Données et traçabilité

Les sources locales sont accessibles dans l’application, rubrique « Règles & méthode » :

| Fichier | Contenu |
| --- | --- |
| `public/sources/rules.pdf` | Document joueurs, 13 pages, version fournie |
| `tours-1-2.jpg` | P1 à P3, page photographiée 11 |
| `tour-3.jpg` | P4 à P6, page photographiée 12 |
| `tour-4.jpg` | P7 à P9, page photographiée 13 |
| `tours-5-6.jpg` | P9 à P11, page photographiée 14 |
| `events.jpg` | Événements finaux et rappels mécaniques, page photographiée 15 |

Les références de section accompagnent les charges, les bonus et les formules. En cas de contradiction, la validation de l’animateur doit être renseignée explicitement.

## État initial personnalisé

T1 : réparation A, farine C, révision HAAS 80 et pièces 35. T2 : IFS A, plastique A, IoT 120 et automate 45. T3 : BIO A, QVT A, aucun achat supplémentaire. T4 : énergie B et ERP A. T5 A/D et T6 C sont des projections éditables, pas des décisions déjà enregistrées.

Profits confirmés : T1 181 ; T2 81,7 ; T3 68,67. Cash confirmé : T2 2 270 ; T3 2 338,67. Les profits cumulés de 331,37 impliquent un cash de 2 331,37 depuis les 2 000 initiaux. L’écart de 7,30 est conservé et signalé. Il ne devient jamais une recette fictive. Les points proposés T1/T2 supposent l’absence d’accident et doivent être corrigés si nécessaire.

La « mise en service » T2 n’a pas été identifiée. Le modèle ne lui attribue aucun actif ni gain. En particulier, la sécurité machines de 60 n’est pas supposée acquise.

## Calculs

Capacité = cadence nominale × (65 − arrêts exceptionnels) × disponibilité × [1 − max(0, absentéisme −4 %)] + capacité exceptionnelle.

Les investissements sont payés immédiatement et leurs effets techniques commencent au tour suivant. La disponibilité machine et le facteur RH sont distincts. Avec QVT A : 8 % d’absence en T3 donne 0,96 ; 5 % dès T4 donne 0,99. Les MTBF/MTTR ne remplacent pas les disponibilités explicites du jeu.

La production sert les produits natifs par ordre de marge, puis les transferts autorisés sur capacité libre. Les rendements de transfert sont appliqués, et aucune livraison ne dépasse la demande. Selon la mise à jour de compétition communiquée le 4 novembre 2026, les changements de ligne/série sont déjà compris dans les 1 340 k€ de coûts fixes. Aucun frais de série n’est ajouté aux dépenses ; les montants 3 /4,5 /3,5 restent seulement informatifs. Cela rend également utiles les petits transferts positifs autrefois écartés à cause d’un second paiement. P1 D coûte 90 +30 =120 k€, sans ajouter à nouveau les 3,5 de série. Cette mise à jour prévaut sur le livret initial. BIO B consomme la capacité de sa ligne hôte historique. Les 400 tonnes internes de P11 sont testées en bloc sur V1, HAAS ou Gorreri ; les répartitions continues entre lignes ne sont pas recherchées.

Pour les tours dont les finances sont enregistrées, le tableau de bord affiche ces finances par défaut : net T1 181 et cash T2 2 270. Le bouton « Scénario calculé » affiche séparément le résultat du moteur ; modifier une décision ou un événement active automatiquement ce scénario. Le cash T2 de 2 270 est transmis comme cash d’entrée de T3 dans les recherches futures. Aucune charge de bouclage n’est créée : le T1 sans incident actuellement modélisé donne 188,1704, et la règle de série n’explique pas l’écart avec les 181 déclarés, car ce scénario ne réalise aucun transfert. Les incidents et charges effectivement survenus restent à renseigner pour reproduire exactement ce résultat depuis le détail comptable. Les valeurs réelles T1/T2/T3 déjà déclarées ne sont pas réécrites par une modification des règles de simulation.

Net = marge produits − toutes les dépenses du tour + gains. Cash sortie = cash entrée + net. Les achats sont déduits intégralement conformément au jeu ; aucune dépréciation comptable inventée n’est ajoutée. Le ROI énergie est un ROI simple comparé aux surcoûts D, sur T4–T6. La durée de vie d’un actif n’étant pas fournie, aucun amortissement comptable n’est affirmé.

Score final = points opérationnels cumulés + résultat net cumulé /10. Seuils : service ≥95 % ; qualité strictement <1 % ; net strictement >300. Les bonus de lancement BIO/premium, QVT et certification sont attribués une seule fois. Le business case exige la validation manuelle de l’animateur. Aucun poids officiel de durabilité n’est donné : l’application propose une contrainte A/B distincte, sans inventer de points verts ni d’émissions CO₂.

## Recherche et incertitude

1. Énumérer les options des tours choisis et les sous-ensembles d’achats techniques du tour courant. Les achats des tours futurs restent ceux du planning saisi.
2. Écarter les violations déterministes : enveloppe d’investissement >500 ou interdiction liée au cash précédent. Pour un horizon long, garder au plus 256 préfixes intermédiaires, classés sans incident. Le résultat signale cet élagage.
3. Évaluer chaque plan retenu par un pilote de 32 scénarios pour préserver les actions préventives que le seul profit sans incident écarterait.
4. Présélectionner les plans par résultat du pilote, en gardant plusieurs familles de décisions, puis les réévaluer sur 96/192/384 scénarios indépendants du pilote. Tous les plans partagent les mêmes nombres aléatoires pour une comparaison moins bruitée.
5. Comparer score moyen, P10, erreur type, cash, risque de faillite et fréquence de service ≥95 %. Une pénalité de risque réglable peut privilégier le P10.

Les d10 et le d8 HACCP utilisent les seuils des cartes. Les jets non renseignés sont supposés uniformes et indépendants : cette indépendance est une hypothèse de simulation, pas une information supplémentaire du livret. Un jet saisi est conservé. Le tableau de bord sans jet représente une projection sans incident, pas une moyenne Monte Carlo. Les jets d’opportunité détectés ne produisent aucun gain inconnu.

Une faillite ou une violation d’investissement dans un scénario reçoit une pénalité numérique de 10 000 points pour l’ordonner après les plans réalisables ; ce nombre n’est pas un malus officiel du jeu. Les événements finaux n’ont aucune distribution supposée. Sélectionner une carte finale permet une analyse conditionnelle de cette carte seulement.

La durée d’une grève sous intérim B, l’échec marketing, le plafond tapis + IoT, la reprise de préventive et le devenir d’IFS C sont des hypothèses modifiables. Le risque allergène BIO B et les opportunités sans effet fourni restent exclus des probabilités. Les résultats sont conditionnels à ces limites.

## Agent avec outils

L’agent est une boucle Responses API. Au moins un outil est requis avant la première réponse. Les six outils autorisés lisent les règles, évaluent un scénario, recherchent des plans, contrôlent l’historique, comparent l’énergie ou préparent une proposition. Les schémas sont stricts. Les outils ne disposent ni d’un interpréteur de code arbitraire ni d’un accès réseau général. Les traces exposent appels et résultats numériques, sans chaîne de pensée privée.

L’agent ne valide aucun résultat réel. L’application exige les jets requis avant un enregistrement calculé. Les propositions doivent être appliquées au simulateur par l’utilisateur. Sans clé connectée, un assistant numérique local traite quelques intentions documentées et reste étiqueté comme tel.

La clé OpenAI existante est saisie dans le panneau de connexion. Elle reste dans l’état React en mémoire, puis passe dans le corps HTTPS à la route privée `/api/agent` et à OpenAI. Elle n’entre ni dans le scénario, ni dans localStorage, ni dans les exports. Aucun journal applicatif ne contient la clé. `store:false` est transmis à Responses ; cela ne constitue pas une promesse sur la politique de conservation opérationnelle du fournisseur. Les scénarios et questions utilisés dans une requête connectée sont transmis à OpenAI.

## Validation

Les tests couvrent les seuils, le timing des investissements, les bonus uniques, BIO B, les événements finaux, la séparation cash/profit, la reproductibilité, les contraintes de production, le maintien de la sécurité dans la recherche et une boucle Responses avec outil simulée. Aucun appel OpenAI réel ne peut être validé sans une clé connectée par l’utilisateur.

| Sans incident, achats historiques confirmés | Net k€ | Service | Points du tour |
| --- | ---: | ---: | ---: |
| T3 A/A | 71,66784 | 89,92293 % | 40 |
| T4 B/A | 539,58150 | 97,52781 % | 115 |
| T5 A/D, sans achat additionnel | 742,18246 | 97,43726 % | 150 |
| T6 C après ce T5, sans carte finale ni business case | 1 184,98246 | 96,26735 % | 130 |

Ces chiffres sont des repères conditionnels, pas des résultats réellement obtenus aux tours futurs. L’ajout de sécurité en T5 coûte 60 et change le profil de risque en T6.

## Ressources scientifiques et techniques

Le code de calcul est original, sans modèle de renforcement entraîné ni copie d’un solveur externe.

- Li et al., *Large Language Models for Supply Chain Optimization* (OptiGuide, 2023) : https://arxiv.org/abs/2307.03875 — relier les questions à des résultats d’optimisation calculés.
- Korth, Benfer & Lanza, *Multi-agentic production planning utilising simulation and optimisation* (2026) : https://publikationen.bibliothek.kit.edu/1000193429 — associer simulation et optimisation en planification.
- Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models* (ICLR 2023) : https://react-lm.github.io/ — boucle d’appels d’outils et observations.
- Ruiz-Rodríguez et al., *Evolutionary multi-objective multi-agent deep reinforcement learning for sustainable maintenance scheduling* (2025) : https://doi.org/10.1016/j.engappai.2025.111126 — distinguer les objectifs économiques et de durabilité.
- OpenAI, Responses et Function Calling : https://platform.openai.com/docs/guides/function-calling — contrat des outils, sorties structurées et appels successifs.

Les travaux inspirent l’architecture. Leurs gains empiriques ne sont pas revendiqués pour cette application. Aucune suite de plusieurs agents LLM autonomes n’est simulée artificiellement : un orchestrateur utilise des outils numériques réels.
