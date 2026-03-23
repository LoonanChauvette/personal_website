#import "@preview/basic-resume:0.2.8": *

// Put your personal information here, replacing mine
#let name = "Loonan Chauvette"
#let email = "loonan.chauvette@cervo.ulaval.ca"
#let github = "github.com/LoonanChauvette"
#let linkedin = "linkedin.com/in/loonan-chauvette"
#let phone = "+1 (581) 624-9900"
//#let personal-site = "TODO"

#show: resume.with(
  author: name,
  email: email,
  github: github,
  //linkedin: linkedin,
  phone: phone,
  //personal-site: personal-site,
  accent-color: "#26428b",
  font: "Libertinus Serif",
  paper: "us-letter",
  author-position: center,
  personal-info-position: center,
)

/*
* Lines that start with == are formatted into section headings
* You can use the specific formatting functions if needed
* The following formatting functions are listed below
* #edu(dates: "", degree: "", gpa: "", institution: "", location: "", consistent: false)
* #work(company: "", dates: "", location: "", title: "")
* #project(dates: "", name: "", role: "", url: "")
* certificates(name: "", issuer: "", url: "", date: "")
* #extracurriculars(activity: "", dates: "")
* There are also the following generic functions that don't apply any formatting
* #generic-two-by-two(top-left: "", top-right: "", bottom-left: "", bottom-right: "")
* #generic-one-by-two(left: "", right: "")
*/
== Éducation

#work(
  title: "Doctorat en Sciences de la réadaptation",
  company: "Université Laval, École de réadaptation, Québec, QC, Canada",
  dates: dates-helper(start-date: "2023", end-date: "Présent"),
)
- Passage accéléré au doctorat

#work(
  title: "Maitrise en Sciences de la réadaptation",
  company: "Université Laval, École de réadaptation, Québec, QC, Canada",
  dates: dates-helper(start-date: "2022", end-date: "2023"),
)

#work(
  title: "Maitrise professionnelle en audiologie",
  company: "Université Laval, École de réadaptation, Québec, QC, Canada",
  dates: dates-helper(start-date: "2020", end-date: "2022"),
)

#work(
  title: "Baccalauréat en Sciences du langage",
  company: "Université Laval, Faculté des lettres et des sciences humaines, Québec, QC, Canada",
  dates: dates-helper(start-date: "2016", end-date: "2019"),
)

== Prix et distinctions

#work(
  title: "Prix Engagement en supervision",
  company: "Équipe des stages, École de réadaptation, Université Laval, Québec, QC, Canada",
  dates: dates-helper(start-date: "2024", end-date: "2025"),
)

#work(
  title: "ISA Student Scholarship (2 000 $)",
  company: "International Society of Audiology, Geneva, Switzerland",
  dates: "Sept 2024",
)

#work(
  title: "Student Poster Outstanding Research Award Winner",
  company: "Canadian Academy of Audiology, Toronto, ON, Canada",
  dates: "Oct 2023",
)

#work(
  title: "Student Poster Outstanding Research Award Winner",
  company: "Canadian Academy of Audiology, Toronto, ON, Canada",
  dates: "Oct 2022",
)

#work(
  title: "CAA Student Award",
  company: "Canadian Academy of Audiology, Toronto, ON, Canada",
  dates: "Oct 2022",
)

#work(
  title: "Tableau d’honneur",
  company: "Université Laval, Faculté des études supérieures et postdoctorales, Québec, QC, Canada",
  dates: "Aug 2022",
)

#work(
  title: "Prix du CIRRIS (1 000 $)",
  company: "Centre interdisciplinaire de recherche en réadaptation et intégration sociale, Québec, QC, Canada",
  dates: "Mai 2022",
)

#work(
  title: "Bourse d’excellence en audiologie (1 500 $)",
  company: "Fondation Groupe Forget, Québec, QC, Canada",
  dates: "Mars 2022",
)

#work(
  title: "Tableau d’honneur",
  company: "Université Laval, Faculté des lettres et des sciences humaines, Québec, QC, Canada",
  dates: "Aug 2019",
)

== Bourses nominatives

#work(
  title: "Formation de doctorat pour détenteurs de diplôme professionnels (135 000 $)",
  company: "Fonds de recherche du Québec – Santé (FRQS)",
  dates: dates-helper(start-date: "2024", end-date: "2028"),
)
- Titre : _Aide compensatoire tactile pour pallier les limitations des aides auditives pour la perception du timbre chez les personnes âgées avec une perte auditive_
- Directrice : Professeure Andréanne Sharp, PhD
- DOI : https://doi.org/10.69777/348570

#work(
  title: "Bourse d’études supérieures du Canada - ES D (63 000 $)",
  company: "Conseil de recherches en sciences naturelles et en génie du Canada (CRSNG)",
  dates: dates-helper(start-date: "2024", end-date: "2027"),
)
- Titre : _Perception du timbre dans les modalités tactile et auditive-tactile en contexte de plasticité cérébrale intermodale_
- Directrice : Professeure Andréanne Sharp, PhD

#work(
  title: "Bourse de formation de maitrise (35 000 $)",
  company: "Fonds de recherche du Québec – Santé (FRQS)",
  dates: dates-helper(start-date: "2022", end-date: "2024"),
)
- Titre : _Vieillissement et perte auditive - amélioration de la perception du timbre à l'aide d'un support vibrotactile_
- Directrice : Professeure Andréanne Sharp, PhD

#work(
  title: "Bourse d’études supérieures du Canada au niveau de la maitrise (17 500 $)",
  company: "Conseil de recherches en sciences naturelles et en génie du Canada (CRSNG)",
  dates: dates-helper(start-date: "2022", end-date: "2023"),
)
- Titre : _Perception auditive et tactile du timbre en contexte de privation auditive prolongée liée au vieillissement normal_
- Directrice : Professeure Andréanne Sharp, PhD

== Publications scientifiques

*Chauvette, L.*, Grenier, A.S., Albouy, P., Coffey, E., Zatorre, R., & Sharp, A. (2025).
Auditory and vibrotactile interactions in perception of timbre acoustic features.
_Scientific reports, 15_(1), 38055.

Hotton, M., *Chauvette, L.*, Poulin, S., & Gagné, J. P. (2025).
Investigating the implementation of a new protocol and clinical tool designed to assess the audiological needs of individuals with hearing loss in primary care settings.
_Frontiers in Audiology and Otology, 2_, 1520014
https://doi.org/10.3389/fauot.2024.1520014

*Chauvette, L.*, Whittom, A., Fecteau, A., Larouche-Gagnon, G., & Sharp, A. (2025).
Musicianship Modulates Octave Illusion Perception Differently Across Stimulation Frequencies.
_Psychological Research, 88_(78). 1-13.
https://doi.org/10.1007/s00426-025-02112-5

*Chauvette, L.*, Leprohon, É., Perron-Houle, L.-P., Pintat, V., Delnavaz, A., Voix, J. & Sharp, A. (2024).
Multichannel Vibrotactile Glove: Validation of a new device designed to sense vibrations.
_IEEE transactions on haptics, 17_(4), 913-923.
https://doi.org/10.1109/TOH.2024.3475740.

*Chauvette, L.*, Leprohon, E., Perron-Houle, L.-P., Pintat, V., Delnavaz, A., Voix, J., & Sharp, A. (2024).
The multichannel vibrotactile gloves: A transmodal technology to feel sound through touch.
_The Journal of the Acoustical Society of America, 155_(3 Suppl.), A38–A38.

Sharp, A., Carbajal Chavez, A. B., *Chauvette, L.*, Zatorre, R., & Coffey, E. (2024).
Feel sounds with your hands: Exploring tactile frequency-following response.
_The Journal of the Acoustical Society of America, 155_(3 Suppl.), A37–A37.
https://doi.org/10.1121/10.0026714

Whittom, A., *Chauvette, L.*, Bégin, A., Blanchette, I., Tremblay, P., & Sharp, A. (2024).
Music Perception in Older Adults With Hearing Loss: Protective Effect of Musical Experience.
_Ear and hearing, 46_(3), 707–718.
https://doi.org/10.1097/AUD.0000000000001615

*Chauvette, L.*, Pinsonnault-Skvarenina, A., Sharp, A., Gagné J.-P., Lacerda, A. B. M., & Hotton, M. (2023).
Perceptions of Adults with Hearing Loss About the Communication Difficulties Generated by the COVID-19 Preventive Measures: A Qualitative Study.
_Journal of Speech, Language, and Hearing Research, 66_(12), 5109–5128.
https://doi.org/10.1044/2023_JSLHR-23-00163

Hotton, M., *Chauvette, L.*, & Gagné, J. P. (2023).
Pilot evaluation of a protocol and a clinical tool developed to assess the audiological needs of adults with hearing loss.
_International Journal of Audiology, 63_(10), 827–835.
https://doi.org/10.1080/14992027.2023.2211737

Whittom, A., Couture, F., *Chauvette, L.*, & Sharp, A. (2023).
Octave illusion: Stimulation frequencies can modulate perception.
_Psychological Research, 87_, 2183-2191.
 https://doi.org/10.1007/s00426-023-01805-z

*Chauvette, L.*, Fournier, P., & Sharp, A. (2022).
The frequency-following response to assess the neural representation of spectral speech cues in older adults.
_Hearing Research, 418_, 108486. https://doi.org/10.1016/j.heares.2022.108486

Pinsonnault-Skvarenina, A., Hotton, M., Sharp, A., *Chauvette, L.*, Tremblay, É., Choquette, R., Ansaldo, A. I., Gagné, J. P., & Lacerda, A. (2022).
Communication during the COVID-19 pandemic: the hearing-impaired perspective.
_International journal of audiology, 62_(12), 1155–1165.
https://doi.org/10.1080/14992027.2022.2120552


== Communications orales

*Chauvette, L.*, Grenier, A.S., Coffey, E., Zatorre, R., Albouy, P., Voix, J. & Sharp, A. (2026, 2-4 juillet).
_Timbre beyond hearing: auditory and vibrotactile interactions in the perception of timbre-related acoustic features._
4#super[th] International Conference on Timbre, Montréal, QC, Canada.
- Accepté

*Chauvette, L.*, Grenier, A.S., Coffey, E., Zatorre, R., Albouy, P., Voix, J. & Sharp, A. (2026, 25-26 juin).
_Exploring the auditory-tactile integration of complex acoustic features using the multichannel vibrotactile gloves._
7#super[th] Virtual Conference on Computational Audiology, En ligne.
- À soumettre

*Chauvette, L.*, Grenier, A.S., Coffey, E., Zatorre, R., Albouy, P., Voix, J. & Sharp, A. (2026, 4 juin).
_Quand le sens du toucher aide à entendre : Stimulation vibrotactile pour pallier les difficultés auditives._
16#super[th] colloque de l'AFREPA, Montréal, QC, Canada.
- Accepté

*Chauvette, L.* (2026, 27 mai).
_From timbre perception to auditory scene analysis: effects of musicianship across auditory and tactile modalities._ [Planned Session].
37#super[th] World Congress of Audiology, Seoul, Corée.
- Accepté

*Chauvette, L.* (2026, 30 janvier).
_Passé, présent et futur de la substitution sensorielle vibrotactile en audiologie._
16#super[e] Journée Étudiante en Audiologie, Montréal, QC, Canada.

*Chauvette, L.* (2025, 16-18 october).
_From timbre perception to musical scene analysis: effects of musical training on across auditory and tactile modalities._
Canadian Academy of Audiology annual conference, Blue Mountain, ON, Canada.

*Chauvette, L.*, Grenier, A. S., Albouy, P., & Sharp, A. (2024, 5 décembre).
_Investigating sensory substitution for hearing rehabilitation._ [Video flash talk].
CERVO Scientific Day 2024, Québec, QC, Canada.

*Chauvette L.* (2024, 22 septembre).
_Enhancing Auditory Perception through Tactile Stimulation: A Comparative Study of Auditory, Tactile, and Multimodal Timbre Perception and Music Recognition._
36#super[th] World Congress of Audiology, Paris, France.

*Chauvette L.* (2023, 30 novembre).
_Perception du timbre dans les modalités tactiles et auditive._
4#super[e] édition de la rencontre scientifique des étudiant.e.s de l’Université Laval en recherche en langage, parole et audition, Québec, QC, Canada.

*Chauvette L.* (2022, 16 novembre).
Investiguer la « boite noire » de la perception auditive par les illusions auditives.
3#super[e] édition de la rencontre scientifique des étudiant.e.s de l’Université Laval en recherche en langage, parole et audition, Québec, QC, Canada.

*Chauvette, L.* (2022, 13 mai).
_Vieillissement et traitement auditif spectral dans la littérature électrophysiologique FFR._
89#super[e] Congrès de l’ACFAS, colloque 102 - Bien vieillir et santé auditive, Québec, QC, Canada. https://www.acfas.ca/evenements/congres/programme/89/100/102/c

== Communications par affiches (1#super[er] auteur)

*Chauvette, L.*, Grenier, A. S., Albouy, P., Sharp, A. (2024, 27-28 novembre).
_Music through Touch: Comparing Auditory, Tactile, and Multimodal Timbre Perception._
CERVO Scientific Day 2024, Québec, QC, Canada.

*Chauvette, L.*, Grenier, A. S., Coffey, E., Zatorre, R., Albouy, P., Sharp, A. (2024, 19-22 septembre).
_Enhancing Auditory Perception through Tactile Stimulation: A Comparative Study of Auditory, Tactile, and Multimodal Timbre Perception and Music Recognition._
36#super[th] World Congress of Audiology, Paris, France.

*Chauvette, L.*, Whittom, A., Larouche-Gagnon, G., Fecteau, A., Sharp, A. (2024, 11 avril).
_The Impact of Musicianship on Harmonic Perception with Missing and Present Fundamentals._
CRBLM Scientific Day, Montréal, QC, Canada.

*Chauvette, L.*, Sharp, A. (2024, 28 février).
_Mechanoreceptors as Sound Translators: Tactile Perception of Complex Acoustic Vibrations._
16#super[e] Journée de la recherche en neurosciences de neuroquébec, Québec, QC, Canada.

*Chauvette, L.*, Sharp, A. (2023, 08 décembre).
_Perception auditive et vibrotactile du timbre avec le gant vibrotactile multicanaux._
Journée scientifique CERVO 2023, Québec, QC, Canada.

*Chauvette, L.*, Sharp, A. (2023, octobre).
_Vibrotactile and Auditory Timbre Perception with the Multichannel Vibrotactile Glove._
Canadian Academy of Audiology annual conference, Toronto, ON, Canada.
- Récipiendaire du Student Poster Outstanding Research Award

*Chauvette, L.*, Leprohon, É., Sharp A. (2023, 28-31 mai).
_Development of a haptic glove to investigate auditory-tactile integration and multimodal plasticity._
16#super[th] Canadian Neuroscience Meeting, Montréal, QC, Canada.

*Chauvette, L.*, Leprohon, É., Sharp A. (2023, 23-24 mai).
_Développement et validation d'un gant haptique vibrotactile pour étudier l’intégration multisensorielle auditive et tactile._
Journées de la recherche 2023 de la Faculté de médecine et des centres affiliés, Québec, QC, Canada.

*Chauvette, L.*, Leprohon, É., Sharp A. (2023, 15 mai).
_Un gant haptique vibrotactile pour étudier l’intégration multisensorielle auditive et tactile de la musique._
CRBLM Scientific Day, Montréal, QC, Canada.

*Chauvette L.*, Whittom A., et Sharp A. (2023, 06 février).
_Musical training and auditory scene analysis: no impact of missing fundamentals on mistuned harmonic detection in professional musicians._
15#super[e] Journée de la recherche en neurosciences de neuroquébec, Québec, QC, Canada.

*Chauvette L.*, Fournier P. et Sharp A. (2022, 11 novembre).
_Évaluation du traitement spectral auditif à l'aide des FFR chez les personnes âgées._
Journées professionnelles 2022 – Ordre professionnel des orthophonistes et des audiologistes du Québec, Saint-Hyacinthe, QC, Canada.

*Chauvette, L.*, Whittom A., Couture, F., Nadeau C., et Sharp, A. (2022, 12-15 octobre).
_First results of a new methodology: Missing fundamentals impair mistuned harmonic perception._
Canadian Academy of Audiology annual conference, Niagara Falls, ON, Canada.
- Récipiendaire du Student Poster Outstanding Research Award

*Chauvette, L*. et Sharp, A. (2022, 9-13 mai).
_Octave Illusion : une nouvelle découverte permet de mieux comprendre ce mystérieux phénomène auditif._
89#super[e] Congrès de l’ACFAS, Québec, QC, Canada. https://www.acfas.ca/evenements/congres/89/contribution/octave-illusion-nouvelle-decouverte-permet-mieux-comprendre-ce

*Chauvette, L.*, Fournier, P., et Sharp, A. (2022, 6 mai).
_Techniques FFR pour déterminer l'impact du vieillissement sur le traitement auditif spectral._
Conférence annuelle de l’AQOA, Montréal, QC, Canada.

== Communications par affiches (collaborateur)

Bégin, A., *Chauvette, L.*, Sharp. A. (2026, 2-4 juillet).
_Towards embodied and inclusive crossmodal experiences of timbre and music: User perspectives of a new vibrotactile assistive device._
4#super[th] International Conference on Timbre, Montréal, QC, Canada.
- Accepté

Autheurs ? Ordre ? (2026, 24-27 mai).
_Exploring Stakeholders’ Perspectives on Artificial Intelligence (AI) Integration in Hearing Healthcare._
37#super[th] World Congress of Audiology, Seoul, Corée.
- Accepté

Grenier, A. S., *Chauvette, L.*, Albouy, P. & Sharp, A. (2024, 27 novembre).
_Unveiling Barriers to Multisensory Integration: Challenges in Using Tactile Input to Enhance Auditory Melodic Discrimination in Noise._
Journée scientifique CERVO 2024, Centre de recherche CERVO, Québec, Canada.

Coffey, E. B. J., Carbajal Chávez, A., *Chauvette, L.*, Farrés-Franch, M., Sharp, A., & Zatorre, R. J. (2024, 30-31 mai).
_Hearing with hands: Vibrotactile stimulation generates a Frequency-Following response._
2024 Annual Meeting of the Belgian Association for Psychological Sciences, Brussel, Belgium

Whittom, A., *Chauvette, L.*, Blanchette, I., Tremblay, P., & Sharp A. (2024, 11 avril).
_Relationship between musical experience and music perception in older adults._
CRBLM Scientific Day, Montréal, Canada.

Coffey, E. B. J., Carbajal Chávez, A., *Chauvette, L.*, Farrés-Franch, M., Sharp, A., & Zatorre, R. J. (2024, 3-7 février).
_Hearing with Hands: Vibrotactile Stimulation Generates a Frequency-Following Response._
Association for Research in Otolaryngology: 47#super[th] Annual Midwinter Meeting, Anaheim, CA, USA

Whittom, A., *Chauvette, L.*, & Sharp, A. (2023, 28-31 mai).
_Modulating the octave illusion in musicians and non-musicians._
16#super[th] Canadian Neuroscience Meeting, Montréal, QC, Canada.

Augereau, T., *Chauvette, L.*, Whittom, A., Champoux, F., & Sharp, A. (2023, 28-31 mai).
_Mistuned harmonic detection threshold unimpaired by missing fundamentals in professional musicians._
16#super[th] Canadian Neuroscience Meeting, Montréal, QC, Canada.

Whittom, A., *Chauvette, L.*, & Sharp, A. (2023, 06 février).
_Impact de l’entraînement musical sur la perception de l’illusion d’octave._
Journée de la recherche en neurosciences de neuroquébec, Québec, QC, Canada

Whittom, A., Couture, F., Nadeau, C., *Chauvette, L.* & Sharp, A. (2022, 12-16 novembre).
_Mistuned harmonic perception when the F0 is missing: A new protocol to investigate pitch perception in humans._
Society for Neuroscience – Neuroscience 2022, San Diego, CA, États-Unis.

Whittom, A., Couture, F., *Chauvette, L.* & Sharp, A. (2022, 25 novembre).
_Influence de la fréquence sur la perception de l'illusion d'octave._
NeuroQAM – Journée scientifique 2022, Montréal, QC, Canada.

== Vulgarisation scientifique

*Chauvette, L.* (2026, 13 février).
_Interaction entre l’audition et la stimulation vibrotactile._ [Entrevue].
Sourdine Express. https://auditionquebec.org/interaction-entre-laudition-et-la-stimulation-vibrotactile/

*Chauvette, L.* (2024, 11 septembre).
_Perception auditive et vibrotactile de la musique._ [Communication orale].
Cocktail de reconnaissance des personnes étudiantes en sciences de la réadaptation, Québec, QC, Canada.

*Chauvette, L.* (2023, 11-14 septembre).
_Changement de paradigme en audiologie : vers la démocratisation de la santé auditive._ [Communication par affiche].
Le 12ème Congrès International Francophone de Gérontologie et Gériatrie, Montréal, QC, Canada.

Sharp, A., & *Chauvette, L.* (Août 2023).
_Beyond ears: Exploring tactile perception to feel music._ [Communication orale].
Summer School - CRBLM day at the MNI, Montréal, QC, Canada. https://crblm.ca/crblm-highlights-and-showcase/

*Chauvette, L.* (Janvier 2023).
_Prothèses auditives : N’oublions pas la musique !_ [Article de magazine].
Sourdine Express. https://auditionquebec.org/protheses-auditives-musique/

*Chauvette, L.* (2022, 10 mai).
_Les enjeux communicationnels tout au long de la vie_ [Scéance d’échange thématique].
89#super[e] Congrès de l’ACFAS, Québec, QC, Canada.


== Bourses de recherche

#work(
  title: "Bourse de recherche – Recherche qualitative (1 800 $)",
  company: "Université de Montréal, Montréal, QC, Canada",
  dates: dates-helper(start-date: "Juil 2022", end-date: "Janv 2023"),
)
- Chercheur responsable : Mathieu Hotton, professeur associé
- Transcription d’entrevues et analyses qualitatives avec le programme QualCoder
- Interprétation des résultats et rédaction d’un article scientifique

#work(
  title: "Auxiliaire de recherche – Analyses statistiques (600 $)",
  company: "Institut universitaire de gériatrie de Montréal (IUGM), Montréal, QC, Canada",
  dates: dates-helper(start-date: "Juil 2022", end-date: "Sept 2022"),
)
- Chercheur responsable : Jean-Pierre Gagné, professeur émérite
- Préparer les analyses statistiques pour répondre aux questions de recherche
- Compléter diverses analyses (régressions logistiques, chi-carré, Breslow-Day, etc.) avec R

#work(
  title: "Bourse pour stage de recherche (1 200 $)",
  company: "Institut universitaire de gériatrie de Montréal (IUGM), Montréal, QC, Canada",
  dates: dates-helper(start-date: "Mai 2021", end-date: "Mars 2022"),
)
- Chercheur responsable : Adriana Lacerda, professeure agrégée
- Participer à la conception d’une trousse de sensibilisation à la communication avec les personnes sourdes
- Recruter des participants sourds et des professionnels de la santé par courriel et par téléphone
- Animer des groupes de discussion d’une heure en portant sur la communication et la surdité

#work(
  title: "Bourse du chercheur (850 $)",
  company: "Centre interdisciplinaire de recherche en réadaptation et intégration sociale, Québec, QC, Canada",
  dates: dates-helper(start-date: "Sept 2021", end-date: "Déc 2021"),
)
- Chercheur responsable : Mathieu Hotton, professeur associé
- Présenter la validation d’un nouveau protocole d’évaluation globale des besoins pour la surdité
- Rédiger deux manuscrits pour publication dans des revues scientifiques arbitrées par les pairs

#work(
  title: "Bourse pour stage de recherche (4 000 $)",
  company: "Université de Montréal, Montréal, QC, Canada",
  dates: dates-helper(start-date: "Mai 2021", end-date: "Déc 2021"),
)
- Chercheur responsable : Alexis Pinsonnault-Skvarenina, PhD
- Mesurer les impacts des mesures sanitaires sur la communication des personnes sourdes
- Conduire des entrevues d’une heure par visioconférence avec des participants sourds
- Gérer la base de données SPSS, effectuer les analyses statistiques et interpréter les résultats

== Emplois académiques

#work(
  title: "Chargé de cours",
  company: "Psychoacoustique (AUD 6001), Université Laval",
  dates: dates-helper(start-date: "2025", end-date: "Présent")
)
- Enseigner un cours de 2#super[e] cycle en audiologie
- Monter les examens et le matériel pédagogique

#work(
  title: "Auxiliaire d’enseignement",
  company: "Évaluation électrophysiologique (AUD 6006), Université Laval",
  dates: dates-helper(start-date: "2022", end-date: "Présent")
)
- Professeure : Andréanne Sharp, professeur adjointe
- Encadrer les étudiants et étudiantes dans les laboratoires d’électrophysiologie
- Enseigner les bases de l’électrophysiologies et des tests spécifiques (PÉATC, ÉOA, FFR)

#work(
  title: "Auxiliaire d’enseignement",
  company: "Programme de maitrise professionnel en audiologie, Université Laval",
  dates: "2024"
)
- Titulaire du projet : Nadine Tougas, chargée d’enseignement en médecine
- Rédiger des cas cliniques fictifs pour des fins éducatives

#work(
  title: "Auxiliaire d’enseignement",
  company: "Introduction à la linguistique (LNG 1000), Université Laval
Morphologie (LNG 2100), Université Laval",
  dates: dates-helper(start-date: "2021", end-date: "2022")
)
- Professeur : Manuel Español Echevarría, professeur titulaire
- Créer du matériel didactique et des questionnaires
- Développer des questions d’examen et corriger les examens

#work(
  title: "Auxiliaire d’enseignement",
  company: "Syntaxe (LNG 2002), Université Laval",
  dates: "2021",
)
- Professeure : Claudia Borgonovo, professeure titulaire
- Corriger les examens et formuler des rétroactions

#work(
  title: "Aide pédagogique au développement de cours en ligne",
  company: "Introduction à la linguistique (LNG 1000), Université Laval
Diachronie et diversité linguistique (FRN 3006), Université Laval
Recherche en langue et société (LNG 7016), Université Laval",
  dates: "2020",
)
- Responsable : Véronique Nguyên-Duy, Directrice de département
- Concevoir du matériel didactique pour le développement de cours en ligne
- Conseiller sur les approches pédagogiques et les modalités d’enseignement
