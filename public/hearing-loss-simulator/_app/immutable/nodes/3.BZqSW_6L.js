import{$ as e,A as t,B as n,E as r,G as i,H as a,I as o,J as s,K as c,M as l,O as u,U as d,V as f,X as p,Z as m,b as h,et as g,g as _,it as v,q as y,rt as b,s as x,tt as S,v as C,y as w}from"../chunks/dHErhZye.js";import{n as T,t as E}from"../chunks/CB9V4EnK.js";import{t as D}from"../chunks/DSfc-TJW.js";function O(e,t){for(;/\s/.test(e[t]);)t++;if(e[t]===`{`){let n=0,r=t+1;for(;t<e.length;t++)if(e[t]===`{`)n++;else if(e[t]===`}`&&--n===0)return[e.slice(r,t),t+1]}else if(e[t]===`"`){let n=e.indexOf(`"`,t+1);return[e.slice(t+1,n),n+1]}let n=/^[^,}\s]+/.exec(e.slice(t)),r=n?n[0]:``;return[r,t+r.length]}function k(e){let t=[],n=/@(\w+)\s*\{\s*([^,\s]+)\s*,/g,r;for(;r=n.exec(e);){let i=r[1].toLowerCase();if(i===`comment`||i===`string`||i===`preamble`)continue;let a={},o=n.lastIndex;for(;;){for(;o<e.length&&/[\s,]/.test(e[o]);)o++;if(o>=e.length||e[o]===`}`)break;let t=/^([\w-]+)\s*=/.exec(e.slice(o));if(!t)break;o+=t[0].length;let[n,r]=O(e,o),i=t[1].toLowerCase();i===`author`&&/^\{[^{}]*\}$/.test(n.trim())&&(a.corporate=`true`),a[i]=n.replace(/[{}]/g,``).replace(/\s+/g,` `).trim(),o=r}t.push({key:r[2],type:i,fields:a}),n.lastIndex=o}return t}var A=new Map(k(`% references.bib — hearing-loss-simulation
% Every entry was checked against Crossref (https://api.crossref.org/works/<doi>)
% and/or the publisher/repository page; see references/VERIFICATION.md for details
% and for everything that could NOT be verified.
% Accented characters are written as LaTeX escapes so the file is plain ASCII.

% ---------------------------------------------------------------------------
% Simulation models (threshold elevation, recruitment, smearing, TFS, WHIS)
% ---------------------------------------------------------------------------

@article{moore1993simulation,
  author    = {Moore, Brian C. J. and Glasberg, Brian R.},
  title     = {Simulation of the effects of loudness recruitment and threshold elevation on the intelligibility of speech in quiet and in a background of speech},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {1993},
  volume    = {94},
  number    = {4},
  pages     = {2050--2062},
  doi       = {10.1121/1.407478},
}

@article{nejime1997simulation,
  author    = {Nejime, Yoshito and Moore, Brian C. J.},
  title     = {Simulation of the effect of threshold elevation and loudness recruitment combined with reduced frequency selectivity on the intelligibility of speech in noise},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {1997},
  volume    = {102},
  number    = {1},
  pages     = {603--615},
  doi       = {10.1121/1.419733},
}

@article{baer1993spectral,
  author    = {Baer, Thomas and Moore, Brian C. J.},
  title     = {Effects of spectral smearing on the intelligibility of sentences in noise},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {1993},
  volume    = {94},
  number    = {3},
  pages     = {1229--1241},
  doi       = {10.1121/1.408176},
}

@article{baer1994spectral,
  author    = {Baer, Thomas and Moore, Brian C. J.},
  title     = {Effects of spectral smearing on the intelligibility of sentences in the presence of interfering speech},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {1994},
  volume    = {95},
  number    = {4},
  pages     = {2277--2280},
  doi       = {10.1121/1.408640},
}

@article{glasberg1990derivation,
  author    = {Glasberg, Brian R. and Moore, Brian C. J.},
  title     = {Derivation of auditory filter shapes from notched-noise data},
  journal   = {Hearing Research},
  year      = {1990},
  volume    = {47},
  number    = {1--2},
  pages     = {103--138},
  doi       = {10.1016/0378-5955(90)90170-T},
}

@article{irino2023whis,
  author    = {Irino, Toshio},
  title     = {Hearing Impairment Simulator Based on Auditory Excitation Pattern Playback: {WHIS}},
  journal   = {IEEE Access},
  year      = {2023},
  volume    = {11},
  pages     = {78419--78430},
  doi       = {10.1109/ACCESS.2023.3298673},
}

@misc{whis2023github,
  author       = {Irino, Toshio},
  title        = {{WHIS}: Wakayama-University Hearing impairment Simulator},
  howpublished = {GitHub repository, AMLAB-Wakayama/WHIS},
  url          = {https://github.com/AMLAB-Wakayama/WHIS},
  note         = {CC0-1.0 licence. Packages WHISv300 (Nov 2021) and WHISv302 (Mar 2022); requires the gammachirp filterbank GCFB v2.31/v2.33 or later. The README names Irino (2023), IEEE Access 11:78419--78430 as the primary citation. No GitHub release tags; cite the package version used.},
}

@misc{irino2022whisarxiv,
  author       = {Irino, Toshio},
  title        = {{WHIS}: Hearing impairment simulator based on the gammachirp auditory filterbank},
  howpublished = {arXiv preprint arXiv:2206.06604},
  year         = {2022},
  doi          = {10.48550/arXiv.2206.06604},
}

@misc{gcfb2023github,
  author       = {Irino, Toshio},
  title        = {Gammachirp auditory filterbank ({GCFB})},
  howpublished = {GitHub repository, AMLAB-Wakayama/gammachirp-filterbank},
  url          = {https://github.com/AMLAB-Wakayama/gammachirp-filterbank},
  note         = {Apache-2.0 licence. Version GCFBv234 (18 May 2023 version; repository commit c3dc7db, 2026-11-09) is the one used with WHISv302 by hls-core.},
}

@article{irino2006dynamic,
  author    = {Irino, Toshio and Patterson, Roy D.},
  title     = {A Dynamic Compressive Gammachirp Auditory Filterbank},
  journal   = {IEEE Transactions on Audio, Speech, and Language Processing},
  year      = {2006},
  volume    = {14},
  number    = {6},
  pages     = {2222--2232},
  doi       = {10.1109/TASL.2006.874669},
}

@article{irino2001compressive,
  author    = {Irino, Toshio and Patterson, Roy D.},
  title     = {A compressive gammachirp auditory filter for both physiological and psychophysical data},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {2001},
  volume    = {109},
  number    = {5},
  pages     = {2008--2022},
  doi       = {10.1121/1.1367253},
}

@article{patterson2003extending,
  author    = {Patterson, Roy D. and Unoki, Masashi and Irino, Toshio},
  title     = {Extending the domain of center frequencies for the compressive gammachirp auditory filter},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {2003},
  volume    = {114},
  number    = {3},
  pages     = {1529--1542},
  doi       = {10.1121/1.1600720},
}

@article{pichorafuller2007temporal,
  author    = {Pichora-Fuller, M. Kathleen and Schneider, Bruce A. and MacDonald, Ewen and Pass, Hollis E. and Brown, Sasha},
  title     = {Temporal jitter disrupts speech intelligibility: A simulation of auditory aging},
  journal   = {Hearing Research},
  year      = {2007},
  volume    = {223},
  number    = {1--2},
  pages     = {114--121},
  doi       = {10.1016/j.heares.2006.10.009},
}

@article{lopezpoveda2013perception,
  author    = {Lopez-Poveda, Enrique A. and Barrios, Pablo},
  title     = {Perception of stochastically undersampled sound waveforms: a model of auditory deafferentation},
  journal   = {Frontiers in Neuroscience},
  year      = {2013},
  volume    = {7},
  pages     = {124},
  doi       = {10.3389/fnins.2013.00124},
}

@article{kujawa2009adding,
  author    = {Kujawa, Sharon G. and Liberman, M. Charles},
  title     = {Adding Insult to Injury: Cochlear Nerve Degeneration after \`\`Temporary'' Noise-Induced Hearing Loss},
  journal   = {The Journal of Neuroscience},
  year      = {2009},
  volume    = {29},
  number    = {45},
  pages     = {14077--14085},
  doi       = {10.1523/JNEUROSCI.2845-09.2009},
}

@article{verhulst2018computational,
  author    = {Verhulst, Sarah and Alto{\\\`e}, Alessandro and Vasilkov, Viacheslav},
  title     = {Computational modeling of the human auditory periphery: Auditory-nerve responses, evoked potentials and hearing loss},
  journal   = {Hearing Research},
  year      = {2018},
  volume    = {360},
  pages     = {55--75},
  doi       = {10.1016/j.heares.2017.12.018},
}

@article{baby2021convolutional,
  author    = {Baby, Deepak and Van Den Broucke, Arthur and Verhulst, Sarah},
  title     = {A convolutional neural-network model of human cochlear mechanics and filter tuning for real-time applications},
  journal   = {Nature Machine Intelligence},
  year      = {2021},
  volume    = {3},
  number    = {2},
  pages     = {134--143},
  doi       = {10.1038/s42256-020-00286-8},
}

@article{deutsch2026evaluation,
  author    = {Deutsch, Thomas and Falanga, Luigi and Willmes, Klaus and Koch, Iring and Fels, Janina},
  title     = {Evaluation of elevated hearing thresholds produced by models for the simulation of cochlear hearing loss},
  journal   = {Acta Acustica},
  year      = {2026},
  volume    = {10},
  pages     = {14},
  doi       = {10.1051/aacus/2026007},
  note      = {Author list as registered at Crossref (K. Willmes); the proposal's \`\`Willmes-von Hinckeldey K'' form is not what Crossref/OpenAlex show. The value 14 is Crossref's page field (article number).},
}

@inproceedings{graetzer2021clarity,
  author    = {Graetzer, Simone and Barker, Jon and Cox, Trevor J. and Akeroyd, Michael and Culling, John F. and Naylor, Graham and Porter, Eszter and Viveros Mu{\\~n}oz, Rhoddy},
  title     = {Clarity-2021 Challenges: Machine Learning Challenges for Advancing Hearing Aid Processing},
  booktitle = {Proc. Interspeech 2021},
  year      = {2021},
  pages     = {686--690},
  doi       = {10.21437/Interspeech.2021-1574},
}

@software{pyclarity,
  author    = {Barker, Jon and Roa Dabike, Gerardo and Tu, Zehai and Shephard, Neil},
  title     = {{pyclarity}: Tools for the Clarity Challenge},
  year      = {2023},
  publisher = {The University of Sheffield},
  doi       = {10.15131/shef.data.23230694.v1},
  url       = {https://github.com/claritychallenge/clarity},
  note      = {MIT licence. Clarity Challenge toolkit (MSBG hearing-loss model, NAL-R, HASPI/HASQI, MBSTOI). Archived release DOI from the Sheffield ORDA record (DataCite metadata, linked from the repository README badge); the repository has no CITATION.cff and no GitHub release tags (README badge shows PyPI v0.9.0 at time of check). Cite the exact version/commit used.},
}

% ---------------------------------------------------------------------------
% Outer ear / calibration / audiograms / normative
% ---------------------------------------------------------------------------

@article{shaw1974transformation,
  author    = {Shaw, E. A. G.},
  title     = {Transformation of sound pressure level from the free field to the eardrum in the horizontal plane},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {1974},
  volume    = {56},
  number    = {6},
  pages     = {1848--1861},
  doi       = {10.1121/1.1903522},
}

@article{bisgaard2010standard,
  author    = {Bisgaard, Nikolai and Vlaming, Marcel S. M. G. and Dahlquist, Martin},
  title     = {Standard Audiograms for the {IEC} 60118-15 Measurement Procedure},
  journal   = {Trends in Amplification},
  year      = {2010},
  volume    = {14},
  number    = {2},
  pages     = {113--120},
  month     = jun,
  doi       = {10.1177/1084713810379609},
  note      = {Open access: PMC4111352},
}

@standard{iso7029,
  author       = {{International Organization for Standardization}},
  title        = {{ISO} 7029:2017 Acoustics --- Statistical distribution of hearing thresholds related to age and gender},
  organization = {ISO},
  year         = {2017},
  type         = {Standard},
  number       = {ISO 7029:2017},
  note         = {Amended by ISO 7029:2017/Amd 1:2024 (Correction of parameter values for estimating the hearing threshold distribution; published 2024-03-26). Paywalled; numeric coefficients not obtained, see references/VERIFICATION.md. Earlier editions: ISO 7029:1984, ISO 7029:2000.},
}

@standard{iso7029_2000,
  author       = {{International Organization for Standardization}},
  title        = {{ISO} 7029:2000 Acoustics --- Statistical distribution of hearing thresholds as a function of age},
  organization = {ISO},
  year         = {2000},
  type         = {Standard},
  number       = {ISO 7029:2000},
  note         = {Withdrawn/superseded by ISO 7029:2017. Cited here only because its median-threshold coefficients (alpha) are quoted in bahng2015hearing.},
}

@article{bahng2015hearing,
  author    = {Bahng, Junghwa and Lee, Junghak},
  title     = {Hearing Thresholds for a Geriatric Population Composed of Korean Males and Females},
  journal   = {Journal of Audiology \\& Otology},
  year      = {2015},
  volume    = {19},
  number    = {2},
  pages     = {91--96},
  doi       = {10.7874/jao.2015.19.2.91},
  note      = {Open access (PMC4582456). Table 8 quotes the ISO 7029:2000 alpha coefficients for 250--8000 Hz, males and females.},
}

@standard{iso389_1,
  author       = {{International Organization for Standardization}},
  title        = {{ISO} 389-1:2017 Acoustics --- Reference zero for the calibration of audiometric equipment --- Part 1: Reference equivalent threshold sound pressure levels for pure tones and supra-aural earphones},
  organization = {ISO},
  year         = {2017},
  type         = {Standard},
  number       = {ISO 389-1:2017},
}

@standard{iso389_5,
  author       = {{International Organization for Standardization}},
  title        = {{ISO} 389-5:2006 Acoustics --- Reference zero for the calibration of audiometric equipment --- Part 5: Reference equivalent threshold sound pressure levels for pure tones in the frequency range 8 kHz to 16 kHz},
  organization = {ISO},
  year         = {2006},
  type         = {Standard},
  number       = {ISO 389-5:2006},
  note         = {Edition and existence verified via standards-store listing; the full part title was NOT confirmed against an ISO page in this session.},
}

@standard{iso389_7,
  author       = {{International Organization for Standardization}},
  title        = {{ISO} 389-7:2019 Acoustics --- Reference zero for the calibration of audiometric equipment --- Part 7: Reference threshold of hearing under free-field and diffuse-field listening conditions},
  organization = {ISO},
  year         = {2019},
  type         = {Standard},
  number       = {ISO 389-7:2019},
}

@standard{itup58,
  author       = {{International Telecommunication Union, Telecommunication Standardization Sector}},
  title        = {Head and torso simulator for telephonometry},
  organization = {ITU-T},
  year         = {2023},
  type         = {Recommendation},
  number       = {ITU-T P.58},
  month        = mar,
  url          = {https://www.itu.int/rec/T-REC-P.58},
  note         = {Edition 03/2023 is the edition in force according to the ITU page; superseded editions include 05/2013 and 06/2021. No DOI.},
}

% ---------------------------------------------------------------------------
% Hearing-aid prescription, objective metrics
% ---------------------------------------------------------------------------

@article{byrne1986national,
  author    = {Byrne, Denis and Dillon, Harvey},
  title     = {The National Acoustic Laboratories' ({NAL}) New Procedure for Selecting the Gain and Frequency Response of a Hearing Aid},
  journal   = {Ear and Hearing},
  year      = {1986},
  volume    = {7},
  number    = {4},
  pages     = {257--265},
  doi       = {10.1097/00003446-198608000-00007},
}

@article{moore2010development,
  author    = {Moore, Brian C. J. and Glasberg, Brian R. and Stone, Michael A.},
  title     = {Development of a new method for deriving initial fittings for hearing aids with multi-channel compression: {CAMEQ2-HF}},
  journal   = {International Journal of Audiology},
  year      = {2010},
  volume    = {49},
  number    = {3},
  pages     = {216--227},
  doi       = {10.3109/14992020903296746},
}

@article{scollie2005desired,
  author    = {Scollie, Susan and Seewald, Richard and Cornelisse, Leonard and Moodie, Sheila and Bagatto, Marlene and Laurnagaray, Diana and Beaulac, Steve and Pumford, John},
  title     = {The Desired Sensation Level Multistage Input/Output Algorithm},
  journal   = {Trends in Amplification},
  year      = {2005},
  volume    = {9},
  number    = {4},
  pages     = {159--197},
  doi       = {10.1177/108471380500900403},
}

@article{kates2021haspi2,
  author    = {Kates, James M. and Arehart, Kathryn H.},
  title     = {The Hearing-Aid Speech Perception Index ({HASPI}) Version 2},
  journal   = {Speech Communication},
  year      = {2021},
  volume    = {131},
  pages     = {35--46},
  doi       = {10.1016/j.specom.2020.05.001},
}

@article{kates2014hasqi2,
  author    = {Kates, James M. and Arehart, Kathryn H.},
  title     = {The Hearing-Aid Speech Quality Index ({HASQI}) Version 2},
  journal   = {Journal of the Audio Engineering Society},
  year      = {2014},
  volume    = {62},
  number    = {3},
  pages     = {99--117},
  month     = mar,
  doi       = {10.17743/jaes.2014.0006},
}

% ---------------------------------------------------------------------------
% Binaural toolkit, cochlear-implant simulation
% ---------------------------------------------------------------------------

@article{cuevasrodriguez20193d,
  author    = {Cuevas-Rodr{\\'\\i}guez, Mar{\\'\\i}a and Picinali, Lorenzo and Gonz{\\'a}lez-Toledo, Daniel and Garre, Carlos and de la Rubia-Cuestas, Ernesto and Molina-Tanco, Luis and Reyes-Lecuona, Arcadio},
  title     = {{3D} {Tune-In} Toolkit: An open-source library for real-time binaural spatialisation},
  journal   = {PLOS ONE},
  year      = {2019},
  volume    = {14},
  number    = {3},
  pages     = {e0211899},
  doi       = {10.1371/journal.pone.0211899},
}

@article{shannon1995speech,
  author    = {Shannon, Robert V. and Zeng, Fan-Gang and Kamath, Vivek and Wygonski, John and Ekelid, Michael},
  title     = {Speech Recognition with Primarily Temporal Cues},
  journal   = {Science},
  year      = {1995},
  volume    = {270},
  number    = {5234},
  pages     = {303--304},
  doi       = {10.1126/science.270.5234.303},
}

@article{grange2017cochlear,
  author    = {Grange, Jacques A. and Culling, John F. and Harris, Naomi S. L. and Bergfeld, Sven},
  title     = {Cochlear implant simulator with independent representation of the full spiral ganglion},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {2017},
  volume    = {142},
  number    = {5},
  pages     = {EL484--EL489},
  doi       = {10.1121/1.5009602},
}

@article{greenwood1990cochlear,
  author    = {Greenwood, Donald D.},
  title     = {A cochlear frequency-position function for several species---29 years later},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {1990},
  volume    = {87},
  number    = {6},
  pages     = {2592--2605},
  doi       = {10.1121/1.399052},
}

@article{dorman2017sound,
  author    = {Dorman, Michael F. and Natale, Sarah Cook and Butts, Austin M. and Zeitler, Daniel M. and Carlson, Matthew L.},
  title     = {The Sound Quality of Cochlear Implants: Studies With Single-sided Deaf Patients},
  journal   = {Otology \\& Neurotology},
  year      = {2017},
  volume    = {38},
  number    = {8},
  pages     = {e268--e273},
  doi       = {10.1097/MAO.0000000000001449},
}

@standard{ansi1997s35,
  author       = {{Acoustical Society of America}},
  title        = {{ANSI/ASA} S3.5-1997 (R2017) American National Standard Methods for Calculation of the Speech Intelligibility Index},
  organization = {ANSI/ASA},
  year         = {1997},
  type         = {Standard},
  number       = {ANSI/ASA S3.5-1997},
  note         = {Overall speech levels by vocal effort (normal 62.35, raised 68.34, loud 74.85, shout 82.30 dB SPL) as tabulated in the standard; values cross-checked against the SII R package (CRAN, data set overall.spl)},
}

@book{who2021world,
  author       = {{World Health Organization}},
  title        = {World report on hearing},
  publisher    = {World Health Organization},
  address      = {Geneva},
  year         = {2021},
  url          = {https://www.who.int/publications/i/item/9789240020481},
  note         = {Table 1.3: grades of hearing loss (better-ear pure-tone average 0.5/1/2/4 kHz): normal <20, mild 20--<35, moderate 35--<50, moderately severe 50--<65, severe 65--<80, profound 80--<95, complete >=95 dB HL},
}

@article{smeds2015estimation,
  author    = {Smeds, Karolina and Wolters, Florian and Rung, Martin},
  title     = {Estimation of Signal-to-Noise Ratios in Realistic Sound Scenarios},
  journal   = {Journal of the American Academy of Audiology},
  volume    = {26},
  number    = {2},
  pages     = {183--196},
  year      = {2015},
  doi       = {10.3766/jaaa.26.2.7},
}

@article{wu2018characteristics,
  author    = {Wu, Yu-Hsiang and Stangl, Elizabeth and Chipara, Octav and Hasan, Syed Shabih and Welhaven, Anne and Oleson, Jacob},
  title     = {Characteristics of Real-World Signal to Noise Ratios and Speech Listening Situations of Older Adults With Mild to Moderate Hearing Loss},
  journal   = {Ear and Hearing},
  volume    = {39},
  number    = {2},
  pages     = {293--304},
  year      = {2018},
  doi       = {10.1097/AUD.0000000000000486},
}

@article{asha1990symbols,
  author       = {{American Speech-Language-Hearing Association}},
  title        = {Guidelines for Audiometric Symbols},
  journal      = {ASHA},
  volume       = {32},
  number       = {Suppl. 2},
  pages        = {25--30},
  year         = {1990},
  url          = {https://www.asha.org/policy/gl1990-00006/},
  note         = {Audiogram layout: one octave on the frequency scale equivalent in span to 20 dB on the hearing-level scale; grid lines at octave and 10 dB intervals; symbols O (right) and X (left)},
}

@misc{tdtiToolkit2026,
  author    = {{University of Malaga and Imperial College London}},
  title     = {{3D Tune-In Audio Toolkit}: hearing-loss simulation source},
  year      = {2026},
  url       = {https://github.com/3DTune-In/3dti_AudioToolkit/tree/5a87918b4b3c179f94f37b56c8b33f6f2db24a13},
  note      = {Commit 5a87918b4b3c179f94f37b56c8b33f6f2db24a13; LGPL-3.0; accessed 2026-11-13},
}
`).map(e=>[e.key,e]));function j(e){return e.replace(/\\&/g,`&`).replace(/--/g,`–`).replace(/\\["'`^~]\s*(\w)/g,(e,t)=>t).replace(/\\[a-z]+\s*/gi,``)}function M(e){if(!e)return``;let t=e.split(/\s+and\s+/).map(e=>j(e.includes(`,`)?e.split(`,`)[0]:e.split(` `).at(-1)));return t.length===1?t[0]:t.length===2?`${t[0]} & ${t[1]}`:`${t[0]} et al.`}function N(e){let t=A.get(e);if(!t)return`[missing: ${e}]`;let n=(t.fields.corporate?j(t.fields.organization??t.fields.author):M(t.fields.author))||j(t.fields.organization??t.fields.publisher??t.fields.institution??t.fields.title??e);return t.fields.year?`${n} (${t.fields.year})`:n}function P(e){let t=A.get(e);if(!t)return{text:`[missing reference: ${e}]`};let n=Object.fromEntries(Object.entries(t.fields).map(([e,t])=>[e,j(t)])),r=[n.author?n.corporate?n.author:n.author.split(/\s+and\s+/).join(`, `):n.organization??n.institution,n.year&&`(${n.year})`,n.title&&`${n.title}.`,n.journal??n.booktitle??n.publisher,n.volume&&(n.number?`${n.volume}(${n.number})`:n.volume),n.pages&&`${n.pages}`].filter(Boolean),i=n.doi?`https://doi.org/${n.doi}`:n.url;return{text:r.join(` `).replace(/\s+\./g,`.`),url:i}}var F=t(`<a target="_blank" rel="noopener"> </a>`),I=t(`<span> </span>`),L=t(`<!><!>`,1),R=t(`<span class="cite svelte-19975rj">(<!>)</span>`);function z(t,n){S(n,!0);var a=R(),d=s(i(a));C(d,17,()=>n.keys,w,(t,n,i)=>{let a=e(()=>P(o(n)));var d=L(),p=c(d),m=e=>{var t=l(`;\xA0`);u(e,t)};h(p,e=>{i>0&&e(m)});var g=s(p),_=e=>{var t=F(),i=y(t,!0);f(e=>{x(t,`href`,o(a).url),x(t,`title`,o(a).text),r(i,e)},[()=>N(o(n)).replace(/[()]/g,``)]),u(e,t)},v=e=>{var t=I(),i=y(t,!0);f(e=>{x(t,`title`,o(a).text),r(i,e)},[()=>N(o(n)).replace(/[()]/g,``)]),u(e,t)};h(g,e=>{o(a).url?e(_):e(v,-1)}),u(t,d)}),b(),v(a),u(t,a),g()}var B=t(`<a target="_blank" rel="noopener" class="svelte-1japjpd"> </a>`),V=t(`<li class="svelte-1japjpd"> <!></li>`),H=t(`<ol class="refs svelte-1japjpd"></ol>`);function ee(t,n){S(n,!0);let a=e(()=>[...new Set(n.keys)].map(e=>({k:e,...P(e)})).sort((e,t)=>e.text.localeCompare(t.text)));var c=H();C(c,21,()=>o(a),e=>e.k,(e,t)=>{var n=V(),a=i(n),c=s(a),l=e=>{var n=B(),i=y(n,!0);f(e=>{x(n,`href`,o(t).url),r(i,e)},[()=>o(t).url.replace(`https://`,``)]),u(e,n)};h(c,e=>{o(t).url&&e(l)}),v(n),f(()=>{x(n,`id`,`ref-${o(t).k??``}`),r(a,`${o(t).text??``} `)}),u(e,n)}),v(c),u(t,c),g()}var U={min_snr_db:60,worst_snr_db:121.59721878071979,cases:[{signal:`harmonic_am`,audiogram:`none`,src_pos:`ff`,severity:`NOTHING`,snr_db:148.5066392529836},{signal:`harmonic_am`,audiogram:`none`,src_pos:`df`,severity:`NOTHING`,snr_db:148.5520189784782},{signal:`harmonic_am`,audiogram:`none`,src_pos:`ITU`,severity:`NOTHING`,snr_db:148.48199640292128},{signal:`harmonic_am`,audiogram:`clarity_mild`,src_pos:`ff`,severity:`MILD`,snr_db:121.59721878071979},{signal:`harmonic_am`,audiogram:`clarity_mild`,src_pos:`df`,severity:`MILD`,snr_db:128.62939303518323},{signal:`harmonic_am`,audiogram:`clarity_mild`,src_pos:`ITU`,severity:`MILD`,snr_db:132.40614683862776},{signal:`harmonic_am`,audiogram:`clarity_moderate`,src_pos:`ff`,severity:`MODERATE`,snr_db:121.75945237645445},{signal:`harmonic_am`,audiogram:`clarity_moderate`,src_pos:`df`,severity:`MODERATE`,snr_db:131.2685085319105},{signal:`harmonic_am`,audiogram:`clarity_moderate`,src_pos:`ITU`,severity:`MODERATE`,snr_db:135.75615659249883},{signal:`harmonic_am`,audiogram:`clarity_mod_severe`,src_pos:`ff`,severity:`SEVERE`,snr_db:122.03975763639535},{signal:`harmonic_am`,audiogram:`clarity_mod_severe`,src_pos:`df`,severity:`SEVERE`,snr_db:128.57215247025184},{signal:`harmonic_am`,audiogram:`clarity_mod_severe`,src_pos:`ITU`,severity:`SEVERE`,snr_db:134.44257923862722},{signal:`pink_noise`,audiogram:`none`,src_pos:`ff`,severity:`NOTHING`,snr_db:147.04214276626794},{signal:`pink_noise`,audiogram:`none`,src_pos:`df`,severity:`NOTHING`,snr_db:147.0687084710679},{signal:`pink_noise`,audiogram:`none`,src_pos:`ITU`,severity:`NOTHING`,snr_db:147.06126544159838},{signal:`pink_noise`,audiogram:`clarity_mild`,src_pos:`ff`,severity:`MILD`,snr_db:150.61980621244618},{signal:`pink_noise`,audiogram:`clarity_mild`,src_pos:`df`,severity:`MILD`,snr_db:150.58183144049738},{signal:`pink_noise`,audiogram:`clarity_mild`,src_pos:`ITU`,severity:`MILD`,snr_db:150.6438437763423},{signal:`pink_noise`,audiogram:`clarity_moderate`,src_pos:`ff`,severity:`MODERATE`,snr_db:150.86666951873138},{signal:`pink_noise`,audiogram:`clarity_moderate`,src_pos:`df`,severity:`MODERATE`,snr_db:150.84464177956087},{signal:`pink_noise`,audiogram:`clarity_moderate`,src_pos:`ITU`,severity:`MODERATE`,snr_db:151.09868258614833},{signal:`pink_noise`,audiogram:`clarity_mod_severe`,src_pos:`ff`,severity:`SEVERE`,snr_db:151.40636096456115},{signal:`pink_noise`,audiogram:`clarity_mod_severe`,src_pos:`df`,severity:`SEVERE`,snr_db:151.37234155817654},{signal:`pink_noise`,audiogram:`clarity_mod_severe`,src_pos:`ITU`,severity:`SEVERE`,snr_db:151.46417409706874},{signal:`tone_pips`,audiogram:`none`,src_pos:`ff`,severity:`NOTHING`,snr_db:149.5902177459825},{signal:`tone_pips`,audiogram:`none`,src_pos:`df`,severity:`NOTHING`,snr_db:149.74121781063107},{signal:`tone_pips`,audiogram:`none`,src_pos:`ITU`,severity:`NOTHING`,snr_db:149.55993300210488},{signal:`tone_pips`,audiogram:`clarity_mild`,src_pos:`ff`,severity:`MILD`,snr_db:138.58851736482993},{signal:`tone_pips`,audiogram:`clarity_mild`,src_pos:`df`,severity:`MILD`,snr_db:139.64260034386558},{signal:`tone_pips`,audiogram:`clarity_mild`,src_pos:`ITU`,severity:`MILD`,snr_db:141.8130775820199},{signal:`tone_pips`,audiogram:`clarity_moderate`,src_pos:`ff`,severity:`MODERATE`,snr_db:138.32397795657656},{signal:`tone_pips`,audiogram:`clarity_moderate`,src_pos:`df`,severity:`MODERATE`,snr_db:139.9049931011237},{signal:`tone_pips`,audiogram:`clarity_moderate`,src_pos:`ITU`,severity:`MODERATE`,snr_db:143.77546827639046},{signal:`tone_pips`,audiogram:`clarity_mod_severe`,src_pos:`ff`,severity:`SEVERE`,snr_db:136.97416162644146},{signal:`tone_pips`,audiogram:`clarity_mod_severe`,src_pos:`df`,severity:`SEVERE`,snr_db:138.9624072655154},{signal:`tone_pips`,audiogram:`clarity_mod_severe`,src_pos:`ITU`,severity:`SEVERE`,snr_db:144.57813602479402}]},W={toolkit_commit:`5a87918b4b3c179f94f37b56c8b33f6f2db24a13`,reference_seed_instrumentation:`random_device replaced by seed + ear index; DSP unchanged`,sample_rate:44100,quick:!1,duration_seconds:1.2,snr_threshold_db:60,worst_snr_db:127.80542781095832,wasm:`web/src/lib/wasm/hls_wasm.wasm`,node:`v26.13.0`,platform:`Linux-7.0.0-30-generic-x86_64-with-glibc2.43`,snr_null_means:`exact float32 match (mathematical SNR +infinity)`,timing:`median of 3 complete app-wrapper calls, after one warmup; includes per-call setup and copy`,summary:[{filterbank:`butterworth`,stage:`expander`,worst_snr_db:142.15948348359012,median_wasm_ms_per_audio_second:50.805591250000006},{filterbank:`butterworth`,stage:`temporal_zero`,worst_snr_db:142.13362258844558,median_wasm_ms_per_audio_second:55.76749916666667},{filterbank:`butterworth`,stage:`temporal_jitter`,worst_snr_db:142.09617675150992,median_wasm_ms_per_audio_second:54.175007083333334},{filterbank:`butterworth`,stage:`smearing`,worst_snr_db:131.61377033115957,median_wasm_ms_per_audio_second:63.93483375000001},{filterbank:`butterworth`,stage:`combined_zero`,worst_snr_db:131.4860484344102,median_wasm_ms_per_audio_second:69.76881083333335},{filterbank:`butterworth`,stage:`combined_jitter`,worst_snr_db:131.9272697668002,median_wasm_ms_per_audio_second:66.92758541666669},{filterbank:`gammatone`,stage:`expander`,worst_snr_db:144.75539919901522,median_wasm_ms_per_audio_second:172.7515929166667},{filterbank:`gammatone`,stage:`temporal_zero`,worst_snr_db:144.68911658940698,median_wasm_ms_per_audio_second:158.90720124999996},{filterbank:`gammatone`,stage:`temporal_jitter`,worst_snr_db:144.76444029824944,median_wasm_ms_per_audio_second:159.43961874999997},{filterbank:`gammatone`,stage:`smearing`,worst_snr_db:127.80542781095832,median_wasm_ms_per_audio_second:167.0338770833333},{filterbank:`gammatone`,stage:`combined_zero`,worst_snr_db:127.99209870711661,median_wasm_ms_per_audio_second:172.47811625},{filterbank:`gammatone`,stage:`combined_jitter`,worst_snr_db:127.86521774455422,median_wasm_ms_per_audio_second:174.02520875000005}],sanity:{edge_cases:[{filterbank:`butterworth`,block_size:64,jitter_ms:0,snr_db:137.31808026495852,exact_float32_match:!1},{filterbank:`butterworth`,block_size:64,jitter_ms:.5,snr_db:136.3704479804765,exact_float32_match:!1},{filterbank:`butterworth`,block_size:1024,jitter_ms:0,snr_db:139.51248223560464,exact_float32_match:!1},{filterbank:`butterworth`,block_size:1024,jitter_ms:.5,snr_db:140.92174871164394,exact_float32_match:!1},{filterbank:`gammatone`,block_size:64,jitter_ms:0,snr_db:126.64239072374487,exact_float32_match:!1},{filterbank:`gammatone`,block_size:64,jitter_ms:.5,snr_db:126.4873191162284,exact_float32_match:!1},{filterbank:`gammatone`,block_size:1024,jitter_ms:0,snr_db:126.26859797083021,exact_float32_match:!1},{filterbank:`gammatone`,block_size:1024,jitter_ms:.5,snr_db:125.88051466677658,exact_float32_match:!1}],alignment:[{filterbank:`butterworth`,temporal:!1,lag_samples:0,gain_db:1.0039912462234497},{filterbank:`butterworth`,temporal:!0,lag_samples:0,gain_db:1.6331572532653809},{filterbank:`gammatone`,temporal:!1,lag_samples:0,gain_db:1.2942672967910767},{filterbank:`gammatone`,temporal:!0,lag_samples:0,gain_db:1.2940363883972168}],calibration_max_abs_error:9313225746154785e-25,stereo_seeded_snr_db:[144.7753749391922,145.30626070677846],lengths_silence_seed_reproducibility:`pass`},cases:[{signal:`harmonic_am`,audiogram:`normal`,filterbank:`butterworth`,stage:`expander`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:10.678320833333336},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:16.453985000000014},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:16.047334999999997},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`butterworth`,stage:`smearing`,snr_db:140.2464254138228,exact_float32_match:!1,wasm_ms_per_audio_second:18.871296666666666},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:139.27953893556702,exact_float32_match:!1,wasm_ms_per_audio_second:26.860840833333366},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:138.85164923230295,exact_float32_match:!1,wasm_ms_per_audio_second:26.456577500000005},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`gammatone`,stage:`expander`,snr_db:180.4726237043451,exact_float32_match:!1,wasm_ms_per_audio_second:128.48330750000002},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:172.4678685069796,exact_float32_match:!1,wasm_ms_per_audio_second:114.86071416666667},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:182.8700311828676,exact_float32_match:!1,wasm_ms_per_audio_second:112.43594000000002},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`gammatone`,stage:`smearing`,snr_db:130.39067163204726,exact_float32_match:!1,wasm_ms_per_audio_second:123.89193916666666},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:130.5892217203714,exact_float32_match:!1,wasm_ms_per_audio_second:131.1875366666667},{signal:`harmonic_am`,audiogram:`normal`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:130.3737442747784,exact_float32_match:!1,wasm_ms_per_audio_second:131.13804},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`butterworth`,stage:`expander`,snr_db:146.46491156043643,exact_float32_match:!1,wasm_ms_per_audio_second:53.165830833333345},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:146.1822452109033,exact_float32_match:!1,wasm_ms_per_audio_second:61.936198333333344},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:146.07203872506565,exact_float32_match:!1,wasm_ms_per_audio_second:62.35521583333333},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`butterworth`,stage:`smearing`,snr_db:137.03310627616202,exact_float32_match:!1,wasm_ms_per_audio_second:64.04041083333333},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:137.22718387523196,exact_float32_match:!1,wasm_ms_per_audio_second:72.43066916666669},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:136.18259129837472,exact_float32_match:!1,wasm_ms_per_audio_second:72.6896275},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`gammatone`,stage:`expander`,snr_db:144.75539919901522,exact_float32_match:!1,wasm_ms_per_audio_second:175.48807333333335},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:144.68911658940698,exact_float32_match:!1,wasm_ms_per_audio_second:161.84761083333333},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:144.76444029824944,exact_float32_match:!1,wasm_ms_per_audio_second:165.79679083333332},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`gammatone`,stage:`smearing`,snr_db:130.79898709574408,exact_float32_match:!1,wasm_ms_per_audio_second:171.78774583333328},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:131.0573108613764,exact_float32_match:!1,wasm_ms_per_audio_second:176.47300083333334},{signal:`harmonic_am`,audiogram:`mild`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:130.8265215306457,exact_float32_match:!1,wasm_ms_per_audio_second:178.68400083333333},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`butterworth`,stage:`expander`,snr_db:145.59853176363208,exact_float32_match:!1,wasm_ms_per_audio_second:53.397859999999994},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:145.38052494633993,exact_float32_match:!1,wasm_ms_per_audio_second:62.97585666666668},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:145.23534053274005,exact_float32_match:!1,wasm_ms_per_audio_second:63.63719083333334},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`butterworth`,stage:`smearing`,snr_db:132.29611278700577,exact_float32_match:!1,wasm_ms_per_audio_second:65.25680833333335},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:132.77601807417665,exact_float32_match:!1,wasm_ms_per_audio_second:72.91680999999997},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:131.9272697668002,exact_float32_match:!1,wasm_ms_per_audio_second:73.37795250000002},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`gammatone`,stage:`expander`,snr_db:145.4464330854886,exact_float32_match:!1,wasm_ms_per_audio_second:178.47601333333336},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:145.3713045550435,exact_float32_match:!1,wasm_ms_per_audio_second:162.1593891666667},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:145.71550429046675,exact_float32_match:!1,wasm_ms_per_audio_second:163.13773583333335},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`gammatone`,stage:`smearing`,snr_db:128.68502232106115,exact_float32_match:!1,wasm_ms_per_audio_second:214.19259166666677},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:128.73160553838036,exact_float32_match:!1,wasm_ms_per_audio_second:177.46843333333337},{signal:`harmonic_am`,audiogram:`moderate`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:128.65335785369942,exact_float32_match:!1,wasm_ms_per_audio_second:178.39278916666672},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`butterworth`,stage:`expander`,snr_db:145.26456549056152,exact_float32_match:!1,wasm_ms_per_audio_second:45.02389250000003},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:145.1096021764618,exact_float32_match:!1,wasm_ms_per_audio_second:53.674220000000005},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:145.07833863094163,exact_float32_match:!1,wasm_ms_per_audio_second:53.398077499999985},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`butterworth`,stage:`smearing`,snr_db:138.79668622718918,exact_float32_match:!1,wasm_ms_per_audio_second:58.39440916666668},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:138.81209746149167,exact_float32_match:!1,wasm_ms_per_audio_second:62.894627499999984},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:138.2090637305826,exact_float32_match:!1,wasm_ms_per_audio_second:64.5391433333333},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`gammatone`,stage:`expander`,snr_db:152.3356315579257,exact_float32_match:!1,wasm_ms_per_audio_second:170.01511250000004},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:151.88395692617746,exact_float32_match:!1,wasm_ms_per_audio_second:155.9667916666666},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:152.1183575038039,exact_float32_match:!1,wasm_ms_per_audio_second:155.7415016666666},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`gammatone`,stage:`smearing`,snr_db:131.42447058467278,exact_float32_match:!1,wasm_ms_per_audio_second:162.2800083333333},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:131.70321306451416,exact_float32_match:!1,wasm_ms_per_audio_second:168.48323166666665},{signal:`harmonic_am`,audiogram:`steep`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:131.36438695407375,exact_float32_match:!1,wasm_ms_per_audio_second:169.65762833333335},{signal:`pink_noise`,audiogram:`normal`,filterbank:`butterworth`,stage:`expander`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:10.157349166666688},{signal:`pink_noise`,audiogram:`normal`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:10.649345000000022},{signal:`pink_noise`,audiogram:`normal`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:10.665344166666676},{signal:`pink_noise`,audiogram:`normal`,filterbank:`butterworth`,stage:`smearing`,snr_db:138.37480146621476,exact_float32_match:!1,wasm_ms_per_audio_second:19.117311666666648},{signal:`pink_noise`,audiogram:`normal`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:138.32382975101018,exact_float32_match:!1,wasm_ms_per_audio_second:22.241038333333332},{signal:`pink_noise`,audiogram:`normal`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:138.49294219028448,exact_float32_match:!1,wasm_ms_per_audio_second:22.119090833333317},{signal:`pink_noise`,audiogram:`normal`,filterbank:`gammatone`,stage:`expander`,snr_db:171.75212087641967,exact_float32_match:!1,wasm_ms_per_audio_second:32.49124666666665},{signal:`pink_noise`,audiogram:`normal`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:181.17547284667768,exact_float32_match:!1,wasm_ms_per_audio_second:35.639302499999985},{signal:`pink_noise`,audiogram:`normal`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:175.52245152108657,exact_float32_match:!1,wasm_ms_per_audio_second:36.15778833333335},{signal:`pink_noise`,audiogram:`normal`,filterbank:`gammatone`,stage:`smearing`,snr_db:130.58042103854723,exact_float32_match:!1,wasm_ms_per_audio_second:45.336143333333325},{signal:`pink_noise`,audiogram:`normal`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:130.50186307297665,exact_float32_match:!1,wasm_ms_per_audio_second:47.67557416666669},{signal:`pink_noise`,audiogram:`normal`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:130.5086384265963,exact_float32_match:!1,wasm_ms_per_audio_second:48.171998333333335},{signal:`pink_noise`,audiogram:`mild`,filterbank:`butterworth`,stage:`expander`,snr_db:145.15690223349372,exact_float32_match:!1,wasm_ms_per_audio_second:50.43282000000001},{signal:`pink_noise`,audiogram:`mild`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:145.29415545412908,exact_float32_match:!1,wasm_ms_per_audio_second:55.139854166666666},{signal:`pink_noise`,audiogram:`mild`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:145.17689231249523,exact_float32_match:!1,wasm_ms_per_audio_second:54.09062416666667},{signal:`pink_noise`,audiogram:`mild`,filterbank:`butterworth`,stage:`smearing`,snr_db:136.3286119945122,exact_float32_match:!1,wasm_ms_per_audio_second:63.8292566666667},{signal:`pink_noise`,audiogram:`mild`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:136.23241829734047,exact_float32_match:!1,wasm_ms_per_audio_second:67.1069525},{signal:`pink_noise`,audiogram:`mild`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:136.48267125919233,exact_float32_match:!1,wasm_ms_per_audio_second:66.9994725},{signal:`pink_noise`,audiogram:`mild`,filterbank:`gammatone`,stage:`expander`,snr_db:145.51218015349968,exact_float32_match:!1,wasm_ms_per_audio_second:76.76295416666672},{signal:`pink_noise`,audiogram:`mild`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:145.45821047816392,exact_float32_match:!1,wasm_ms_per_audio_second:79.29122166666669},{signal:`pink_noise`,audiogram:`mild`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:145.467150704081,exact_float32_match:!1,wasm_ms_per_audio_second:79.11072749999998},{signal:`pink_noise`,audiogram:`mild`,filterbank:`gammatone`,stage:`smearing`,snr_db:130.03690517086352,exact_float32_match:!1,wasm_ms_per_audio_second:89.95249166666667},{signal:`pink_noise`,audiogram:`mild`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:129.7307040246661,exact_float32_match:!1,wasm_ms_per_audio_second:91.9981416666667},{signal:`pink_noise`,audiogram:`mild`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:130.09767911639872,exact_float32_match:!1,wasm_ms_per_audio_second:91.71683416666663},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`butterworth`,stage:`expander`,snr_db:146.8469129192515,exact_float32_match:!1,wasm_ms_per_audio_second:51.17836250000001},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:146.26250362992695,exact_float32_match:!1,wasm_ms_per_audio_second:56.39514416666667},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:146.56879440607852,exact_float32_match:!1,wasm_ms_per_audio_second:54.259389999999996},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`butterworth`,stage:`smearing`,snr_db:131.61377033115957,exact_float32_match:!1,wasm_ms_per_audio_second:64.0590775},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:131.4860484344102,exact_float32_match:!1,wasm_ms_per_audio_second:73.02968916666667},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:132.0457497848067,exact_float32_match:!1,wasm_ms_per_audio_second:66.85569833333338},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`gammatone`,stage:`expander`,snr_db:145.8513539963841,exact_float32_match:!1,wasm_ms_per_audio_second:77.07154666666663},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:145.98939789179096,exact_float32_match:!1,wasm_ms_per_audio_second:79.95402833333333},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:146.08687953468169,exact_float32_match:!1,wasm_ms_per_audio_second:80.23271999999999},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`gammatone`,stage:`smearing`,snr_db:127.80542781095832,exact_float32_match:!1,wasm_ms_per_audio_second:89.35699416666671},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:127.99209870711661,exact_float32_match:!1,wasm_ms_per_audio_second:93.6977458333333},{signal:`pink_noise`,audiogram:`moderate`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:128.56279956244222,exact_float32_match:!1,wasm_ms_per_audio_second:94.11039666666667},{signal:`pink_noise`,audiogram:`steep`,filterbank:`butterworth`,stage:`expander`,snr_db:144.94464469926618,exact_float32_match:!1,wasm_ms_per_audio_second:40.56754500000002},{signal:`pink_noise`,audiogram:`steep`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:144.90524179379054,exact_float32_match:!1,wasm_ms_per_audio_second:44.51441166666669},{signal:`pink_noise`,audiogram:`steep`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:144.81541442880462,exact_float32_match:!1,wasm_ms_per_audio_second:44.65567249999997},{signal:`pink_noise`,audiogram:`steep`,filterbank:`butterworth`,stage:`smearing`,snr_db:138.2874733187423,exact_float32_match:!1,wasm_ms_per_audio_second:53.412865000000004},{signal:`pink_noise`,audiogram:`steep`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:138.22706814195672,exact_float32_match:!1,wasm_ms_per_audio_second:56.93367499999999},{signal:`pink_noise`,audiogram:`steep`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:138.42653664919538,exact_float32_match:!1,wasm_ms_per_audio_second:56.38590416666669},{signal:`pink_noise`,audiogram:`steep`,filterbank:`gammatone`,stage:`expander`,snr_db:152.03962683734983,exact_float32_match:!1,wasm_ms_per_audio_second:67.03958749999998},{signal:`pink_noise`,audiogram:`steep`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:151.9046296393388,exact_float32_match:!1,wasm_ms_per_audio_second:70.51628833333335},{signal:`pink_noise`,audiogram:`steep`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:152.1178930859544,exact_float32_match:!1,wasm_ms_per_audio_second:70.17106750000002},{signal:`pink_noise`,audiogram:`steep`,filterbank:`gammatone`,stage:`smearing`,snr_db:130.9165758160444,exact_float32_match:!1,wasm_ms_per_audio_second:79.98337000000002},{signal:`pink_noise`,audiogram:`steep`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:130.50954905261707,exact_float32_match:!1,wasm_ms_per_audio_second:83.06327416666667},{signal:`pink_noise`,audiogram:`steep`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:130.82842942327346,exact_float32_match:!1,wasm_ms_per_audio_second:82.16566166666667},{signal:`tone_pips`,audiogram:`normal`,filterbank:`butterworth`,stage:`expander`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:21.02031916666668},{signal:`tone_pips`,audiogram:`normal`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:53.12269416666671},{signal:`tone_pips`,audiogram:`normal`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:46.27775750000001},{signal:`tone_pips`,audiogram:`normal`,filterbank:`butterworth`,stage:`smearing`,snr_db:137.60164329396662,exact_float32_match:!1,wasm_ms_per_audio_second:28.81321083333333},{signal:`tone_pips`,audiogram:`normal`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:137.86441635202985,exact_float32_match:!1,wasm_ms_per_audio_second:55.58807249999997},{signal:`tone_pips`,audiogram:`normal`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:138.64202486223326,exact_float32_match:!1,wasm_ms_per_audio_second:57.68255416666667},{signal:`tone_pips`,audiogram:`normal`,filterbank:`gammatone`,stage:`expander`,snr_db:null,exact_float32_match:!0,wasm_ms_per_audio_second:247.01360833333337},{signal:`tone_pips`,audiogram:`normal`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:172.40411716431336,exact_float32_match:!1,wasm_ms_per_audio_second:243.66442583333338},{signal:`tone_pips`,audiogram:`normal`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:173.4145850315916,exact_float32_match:!1,wasm_ms_per_audio_second:261.0763616666666},{signal:`tone_pips`,audiogram:`normal`,filterbank:`gammatone`,stage:`smearing`,snr_db:130.29484160152845,exact_float32_match:!1,wasm_ms_per_audio_second:246.208205},{signal:`tone_pips`,audiogram:`normal`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:130.72087344271677,exact_float32_match:!1,wasm_ms_per_audio_second:269.11302500000005},{signal:`tone_pips`,audiogram:`normal`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:130.61296931398874,exact_float32_match:!1,wasm_ms_per_audio_second:270.71462166666686},{signal:`tone_pips`,audiogram:`mild`,filterbank:`butterworth`,stage:`expander`,snr_db:147.4173970191756,exact_float32_match:!1,wasm_ms_per_audio_second:66.46000749999999},{signal:`tone_pips`,audiogram:`mild`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:147.29431869682492,exact_float32_match:!1,wasm_ms_per_audio_second:93.54017666666664},{signal:`tone_pips`,audiogram:`mild`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:147.34066709338083,exact_float32_match:!1,wasm_ms_per_audio_second:91.90254250000001},{signal:`tone_pips`,audiogram:`mild`,filterbank:`butterworth`,stage:`smearing`,snr_db:137.64754145189332,exact_float32_match:!1,wasm_ms_per_audio_second:74.6077958333333},{signal:`tone_pips`,audiogram:`mild`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:137.15072190494453,exact_float32_match:!1,wasm_ms_per_audio_second:110.2271725},{signal:`tone_pips`,audiogram:`mild`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:136.811567532116,exact_float32_match:!1,wasm_ms_per_audio_second:102.94330416666668},{signal:`tone_pips`,audiogram:`mild`,filterbank:`gammatone`,stage:`expander`,snr_db:147.79098726259315,exact_float32_match:!1,wasm_ms_per_audio_second:303.87704666666673},{signal:`tone_pips`,audiogram:`mild`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:147.73064717535757,exact_float32_match:!1,wasm_ms_per_audio_second:293.31419250000005},{signal:`tone_pips`,audiogram:`mild`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:147.28302194997514,exact_float32_match:!1,wasm_ms_per_audio_second:279.64894416666675},{signal:`tone_pips`,audiogram:`mild`,filterbank:`gammatone`,stage:`smearing`,snr_db:130.2078958421428,exact_float32_match:!1,wasm_ms_per_audio_second:300.84904499999993},{signal:`tone_pips`,audiogram:`mild`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:131.45995911632826,exact_float32_match:!1,wasm_ms_per_audio_second:323.1727333333333},{signal:`tone_pips`,audiogram:`mild`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:130.43365875186217,exact_float32_match:!1,wasm_ms_per_audio_second:326.93960749999997},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`butterworth`,stage:`expander`,snr_db:146.5838485463257,exact_float32_match:!1,wasm_ms_per_audio_second:67.17517166666663},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:146.36996552438086,exact_float32_match:!1,wasm_ms_per_audio_second:93.36111916666673},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:146.6387741365802,exact_float32_match:!1,wasm_ms_per_audio_second:93.38016833333334},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`butterworth`,stage:`smearing`,snr_db:134.0671706435022,exact_float32_match:!1,wasm_ms_per_audio_second:74.78456833333331},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:132.67911066293289,exact_float32_match:!1,wasm_ms_per_audio_second:103.01890833333337},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:132.6654893429739,exact_float32_match:!1,wasm_ms_per_audio_second:102.7932175},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`gammatone`,stage:`expander`,snr_db:147.37990236547571,exact_float32_match:!1,wasm_ms_per_audio_second:300.22466583333335},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:147.32669612875495,exact_float32_match:!1,wasm_ms_per_audio_second:290.39758},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:146.99274253846554,exact_float32_match:!1,wasm_ms_per_audio_second:281.1188816666666},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`gammatone`,stage:`smearing`,snr_db:127.87053546357349,exact_float32_match:!1,wasm_ms_per_audio_second:303.0650233333333},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:129.01962198961166,exact_float32_match:!1,wasm_ms_per_audio_second:327.61488750000007},{signal:`tone_pips`,audiogram:`moderate`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:127.86521774455422,exact_float32_match:!1,wasm_ms_per_audio_second:323.09115833333334},{signal:`tone_pips`,audiogram:`steep`,filterbank:`butterworth`,stage:`expander`,snr_db:142.15948348359012,exact_float32_match:!1,wasm_ms_per_audio_second:56.64209166666666},{signal:`tone_pips`,audiogram:`steep`,filterbank:`butterworth`,stage:`temporal_zero`,snr_db:142.13362258844558,exact_float32_match:!1,wasm_ms_per_audio_second:83.59556833333335},{signal:`tone_pips`,audiogram:`steep`,filterbank:`butterworth`,stage:`temporal_jitter`,snr_db:142.09617675150992,exact_float32_match:!1,wasm_ms_per_audio_second:84.60553583333336},{signal:`tone_pips`,audiogram:`steep`,filterbank:`butterworth`,stage:`smearing`,snr_db:138.9248258221407,exact_float32_match:!1,wasm_ms_per_audio_second:66.02304333333336},{signal:`tone_pips`,audiogram:`steep`,filterbank:`butterworth`,stage:`combined_zero`,snr_db:139.0336338236799,exact_float32_match:!1,wasm_ms_per_audio_second:93.56244666666669},{signal:`tone_pips`,audiogram:`steep`,filterbank:`butterworth`,stage:`combined_jitter`,snr_db:138.71778175615822,exact_float32_match:!1,wasm_ms_per_audio_second:92.64541833333331},{signal:`tone_pips`,audiogram:`steep`,filterbank:`gammatone`,stage:`expander`,snr_db:150.68816782903338,exact_float32_match:!1,wasm_ms_per_audio_second:289.49688083333336},{signal:`tone_pips`,audiogram:`steep`,filterbank:`gammatone`,stage:`temporal_zero`,snr_db:151.11311646380136,exact_float32_match:!1,wasm_ms_per_audio_second:278.7793008333333},{signal:`tone_pips`,audiogram:`steep`,filterbank:`gammatone`,stage:`temporal_jitter`,snr_db:149.87741726052332,exact_float32_match:!1,wasm_ms_per_audio_second:267.70762500000006},{signal:`tone_pips`,audiogram:`steep`,filterbank:`gammatone`,stage:`smearing`,snr_db:131.1339350739197,exact_float32_match:!1,wasm_ms_per_audio_second:283.90250000000003},{signal:`tone_pips`,audiogram:`steep`,filterbank:`gammatone`,stage:`combined_zero`,snr_db:132.2188647289756,exact_float32_match:!1,wasm_ms_per_audio_second:310.27708333333334},{signal:`tone_pips`,audiogram:`steep`,filterbank:`gammatone`,stage:`combined_jitter`,snr_db:131.195422997337,exact_float32_match:!1,wasm_ms_per_audio_second:310.5260841666668}],cpu:`Intel(R) Core(TM) i5-3437U CPU @ 1.90GHz`,ziglang_version:`0.17.1`,wasm_sha256:`5d0da358a1e1d9492f32cc2912e30d59f946bd131bf48849142235a94c0ed57a`,reference_compile_flags:`-target x86_64-linux-gnu -O2 -std=c++14 -ffp-contract=off (libc++)`,worst_extra_snr_db:125.88051466677658,worst_all_snr_db:125.88051466677658},G={reference:`WHIS v3.02 (WHISv302, SynthMethod DTVF) + GCFB v2.34, Octave 10.3 + signal 1.4.8, MATLAB-compatible hanning shim`,equiv_0db_spl:120,min_snr_db:60,worst_snr_db:151.08837164257667,core_48k:[{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:0,spl_db:65,snr_db:151.82803698964085,f32_floor_snr_db:151.82803698964085,ref_level_change_db:-.00874612380339448},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:0,spl_db:65,snr_db:151.89932184236005,f32_floor_snr_db:151.89932184236005,ref_level_change_db:-7.168645779805165},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:0,spl_db:65,snr_db:151.6312807735341,f32_floor_snr_db:151.6312807735341,ref_level_change_db:-25.056705587410274},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:0,spl_db:65,snr_db:152.18332869209328,f32_floor_snr_db:152.18332869209328,ref_level_change_db:-9.59211895954207},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:0,spl_db:75,snr_db:151.86392477962232,f32_floor_snr_db:151.86392477962232,ref_level_change_db:-.8976925434065985},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:0,spl_db:75,snr_db:151.79269983304127,f32_floor_snr_db:151.79269983304127,ref_level_change_db:-9.026546108782028},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:0,spl_db:75,snr_db:152.16901400215963,f32_floor_snr_db:152.16901400215963,ref_level_change_db:-24.19194509383047},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:0,spl_db:75,snr_db:152.00753877607127,f32_floor_snr_db:152.00753877607127,ref_level_change_db:-11.631040339548084},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:0,spl_db:50,snr_db:153.00192022854708,f32_floor_snr_db:153.0019202285471,ref_level_change_db:.00872553924598667},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:0,spl_db:50,snr_db:152.17837089469944,f32_floor_snr_db:152.17837089469944,ref_level_change_db:-10.658572069640083},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:0,spl_db:50,snr_db:152.57202695714045,f32_floor_snr_db:152.57202695715026,ref_level_change_db:-46.0333413385353},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:0,spl_db:50,snr_db:151.08837164257667,f32_floor_snr_db:151.08837164257667,ref_level_change_db:-14.146118549243083},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:.5,spl_db:65,snr_db:151.82803698964085,f32_floor_snr_db:151.82803698964085,ref_level_change_db:-.00874612380339448},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:.5,spl_db:65,snr_db:151.88046410536282,f32_floor_snr_db:151.88046410536282,ref_level_change_db:-7.148065954554911},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:.5,spl_db:65,snr_db:151.40334240070322,f32_floor_snr_db:151.40334240070322,ref_level_change_db:-24.66157788300275},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:.5,spl_db:65,snr_db:152.18142407752958,f32_floor_snr_db:152.18142407752958,ref_level_change_db:-9.426666564814134},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:.5,spl_db:75,snr_db:151.86392477962232,f32_floor_snr_db:151.86392477962232,ref_level_change_db:-.8976925434065985},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:.5,spl_db:75,snr_db:151.82211402751304,f32_floor_snr_db:151.82211402751304,ref_level_change_db:-9.119617868345019},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:.5,spl_db:75,snr_db:152.11598393880655,f32_floor_snr_db:152.11598393880655,ref_level_change_db:-24.16361015037808},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:.5,spl_db:75,snr_db:151.98414185153257,f32_floor_snr_db:151.98414185153257,ref_level_change_db:-11.8248784027406},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:.5,spl_db:50,snr_db:153.00192022854708,f32_floor_snr_db:153.0019202285471,ref_level_change_db:.00872553924598667},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:.5,spl_db:50,snr_db:152.16493722699082,f32_floor_snr_db:152.16493722699082,ref_level_change_db:-10.583588541767455},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:.5,spl_db:50,snr_db:151.1585872128982,f32_floor_snr_db:151.15858721290138,ref_level_change_db:-43.37311172751376},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:.5,spl_db:50,snr_db:151.19733250879975,f32_floor_snr_db:151.19733250879975,ref_level_change_db:-13.822048232071689},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:1,spl_db:65,snr_db:151.8280369873217,f32_floor_snr_db:151.8280369873217,ref_level_change_db:-.00874612380339448},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:1,spl_db:65,snr_db:152.2477716814083,f32_floor_snr_db:152.2477716814083,ref_level_change_db:-8.25416360672431},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:1,spl_db:65,snr_db:151.91970786696513,f32_floor_snr_db:151.91970786696513,ref_level_change_db:-24.784643585900874},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:1,spl_db:65,snr_db:151.78757454102166,f32_floor_snr_db:151.78757454102166,ref_level_change_db:-10.733005802076846},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:1,spl_db:75,snr_db:151.86392477276368,f32_floor_snr_db:151.86392477276368,ref_level_change_db:-.8976925434065985},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:1,spl_db:75,snr_db:151.89013287230063,f32_floor_snr_db:151.89013287230063,ref_level_change_db:-10.677315797260585},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:1,spl_db:75,snr_db:152.146249560785,f32_floor_snr_db:152.146249560785,ref_level_change_db:-24.28635505216491},{outer_middle_ear_fir:`high`,signal:`pink_noise`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:1,spl_db:75,snr_db:151.97790654994225,f32_floor_snr_db:151.97790654994225,ref_level_change_db:-13.22175313404905},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:1,spl_db:50,snr_db:153.00192022138776,f32_floor_snr_db:153.0019202213878,ref_level_change_db:.008725539245984742},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:1,spl_db:50,snr_db:151.48011083949496,f32_floor_snr_db:151.48011083949496,ref_level_change_db:-10.73183574325791},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:1,spl_db:50,snr_db:151.35282639904642,f32_floor_snr_db:151.35282639905068,ref_level_change_db:-44.582698234655346},{outer_middle_ear_fir:`high`,signal:`tone_pips`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:1,spl_db:50,snr_db:151.87495734194957,f32_floor_snr_db:151.87495734194957,ref_level_change_db:-15.092920499096667},{outer_middle_ear_fir:`octave`,signal:`harmonic_am`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:.5,spl_db:65,snr_db:151.84888658440434,f32_floor_snr_db:151.84888658440434,ref_level_change_db:-.008745690911658078},{outer_middle_ear_fir:`octave`,signal:`harmonic_am`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:.5,spl_db:65,snr_db:151.90355965610203,f32_floor_snr_db:151.90355965610203,ref_level_change_db:-6.8609128500308305},{outer_middle_ear_fir:`octave`,signal:`harmonic_am`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:.5,spl_db:65,snr_db:151.81891506148975,f32_floor_snr_db:151.81891506148975,ref_level_change_db:-24.629711114168714},{outer_middle_ear_fir:`octave`,signal:`harmonic_am`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:.5,spl_db:65,snr_db:152.16974175244064,f32_floor_snr_db:152.16974175244064,ref_level_change_db:-9.09439670569016},{outer_middle_ear_fir:`octave`,signal:`pink_noise`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:.5,spl_db:75,snr_db:151.95285696049686,f32_floor_snr_db:151.95285696049686,ref_level_change_db:-.8976927439482408},{outer_middle_ear_fir:`octave`,signal:`pink_noise`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:.5,spl_db:75,snr_db:151.86935392241446,f32_floor_snr_db:151.86935392241446,ref_level_change_db:-8.857054145503078},{outer_middle_ear_fir:`octave`,signal:`pink_noise`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:.5,spl_db:75,snr_db:152.57259600873132,f32_floor_snr_db:152.57259600873132,ref_level_change_db:-24.176370291610255},{outer_middle_ear_fir:`octave`,signal:`pink_noise`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:.5,spl_db:75,snr_db:151.98305777305666,f32_floor_snr_db:151.98305777305666,ref_level_change_db:-11.460489917348673},{outer_middle_ear_fir:`octave`,signal:`tone_pips`,audiogram:`normal`,hl_db:[0,0,0,0,0,0,0],alpha:.5,spl_db:50,snr_db:152.8855495565797,f32_floor_snr_db:152.8855495565797,ref_level_change_db:.008730112174117769},{outer_middle_ear_fir:`octave`,signal:`tone_pips`,audiogram:`mild_iso7029_70m`,hl_db:[8,8,9,10,19,43,59],alpha:.5,spl_db:50,snr_db:152.1364966133621,f32_floor_snr_db:152.1364966133621,ref_level_change_db:-10.716265657421438},{outer_middle_ear_fir:`octave`,signal:`tone_pips`,audiogram:`moderate_flat`,hl_db:[40,40,45,50,55,60,65],alpha:.5,spl_db:50,snr_db:151.25620457829402,f32_floor_snr_db:151.25620457829726,ref_level_change_db:-43.3855122707987},{outer_middle_ear_fir:`octave`,signal:`tone_pips`,audiogram:`steep_sloping`,hl_db:[10,10,15,30,55,70,80],alpha:.5,spl_db:50,snr_db:151.11536523091044,f32_floor_snr_db:151.11536523091044,ref_level_change_db:-13.816549343803604}],outer_middle_ear_sensitivity:`see whis-outmid-sensitivity.json`,stages:[{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`normal`,alpha:.5,level_estimate_max_abs_diff_db:3801179985885028e-21,gain_reduction_max_abs_diff_db:7365652033609893e-27},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`mild_iso7029_70m`,alpha:.5,level_estimate_max_abs_diff_db:380021312196277e-20,gain_reduction_max_abs_diff_db:38131338726543618e-22},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`moderate_flat`,alpha:.5,level_estimate_max_abs_diff_db:3209276457027954e-21,gain_reduction_max_abs_diff_db:3814676460933697e-21},{outer_middle_ear_fir:`high`,signal:`harmonic_am`,audiogram:`steep_sloping`,alpha:.5,level_estimate_max_abs_diff_db:3209276457027954e-21,gain_reduction_max_abs_diff_db:38146109631043146e-22},{outer_middle_ear_fir:`octave`,signal:`harmonic_am`,audiogram:`steep_sloping`,alpha:.5,level_estimate_max_abs_diff_db:3190593247381912e-21,gain_reduction_max_abs_diff_db:3814583308781039e-21}],app_path_44k1:[{signal:`harmonic_am`,audiogram:`normal`,alpha:.5,snr_db:151.8481859659237},{signal:`harmonic_am`,audiogram:`mild_iso7029_70m`,alpha:.5,snr_db:151.92092868821462},{signal:`harmonic_am`,audiogram:`moderate_flat`,alpha:.5,snr_db:152.1807327153689},{signal:`harmonic_am`,audiogram:`steep_sloping`,alpha:.5,snr_db:152.15502695460037},{signal:`pink_noise`,audiogram:`steep_sloping`,alpha:0,snr_db:151.944134145332}],runtime_ms_per_second:{app_44k1:202.4113824,core_48k:198.19142059999996,octave_reference_median:9064}},te=t(`<li><strong> </strong> <!></li>`),ne=t(`<h3 class="svelte-1q1r64t">Processing stages</h3> <ol></ol>`,1),re=t(`<tr><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td></tr>`),ie=t(`<p>Our engine and pyclarity's <code class="svelte-1q1r64t">Ear.process</code> <strong> </strong> <code class="svelte-1q1r64t">validation/compare_msbg.py</code>.</p> <details class="svelte-1q1r64t"><summary class="svelte-1q1r64t"> </summary> <table class="data svelte-1q1r64t"><thead class="svelte-1q1r64t"><tr><th class="svelte-1q1r64t">Signal</th><th class="svelte-1q1r64t">Audiogram</th><th class="svelte-1q1r64t">Source</th><th class="svelte-1q1r64t">Severity</th><th class="svelte-1q1r64t">SNR (dB)</th></tr></thead><tbody></tbody></table></details> <p class="small muted">Documented reference quirk: the overlap-add loop of the reference smearing routine reads new input with a
				fixed 192-sample (4.4 ms) lag. We reproduce it exactly and compensate the latency in the app, so the
				simulated and original tracks stay time-aligned.</p>`,1),ae=t(`<p> <code class="svelte-1q1r64t">validation/compare_whis.py</code>.</p> <p class="small">Deliberate deviation: GCFB's 600th-order outer/middle-ear filter cannot be designed in Octave, whose fallback is a
				25-tap filter that is off by up to 5 dB near 100 Hz. The engine uses an accurate 200-tap design made with GCFB's own
				method; the unmodified Octave behaviour remains available and was validated as well. See the model card.</p>`,1),oe=t(`<tr><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td></tr>`),se=t(`<p>The shipped WebAssembly module and the native C++ toolkit (commit <code class="svelte-1q1r64t"> </code> <strong> </strong>, the float32 precision of the toolkit; random jitter
				is reproduced exactly from the seeded generator. Reproduce with <code class="svelte-1q1r64t">validation/compare_3dti.py</code>.</p> <table class="data svelte-1q1r64t"><thead class="svelte-1q1r64t"><tr><th class="svelte-1q1r64t">Filterbank</th><th class="svelte-1q1r64t">Stages</th><th class="svelte-1q1r64t">Worst SNR (dB)</th><th class="svelte-1q1r64t">ms per s of audio</th></tr></thead><tbody></tbody></table>`,1),ce=t(`<li> </li>`),le=t(`<h3 class="svelte-1q1r64t">Limitations</h3> <ul></ul>`,1),ue=t(`<section class="svelte-1q1r64t"><h2 class="svelte-1q1r64t"> <span class="status svelte-1q1r64t"> </span></h2> <p> <!></p> <!> <h3 class="svelte-1q1r64t">Validation</h3> <p> </p> <!> <!></section>`),de=t(`<tr><td class="svelte-1q1r64t"><a target="_blank" rel="noopener"> </a></td><td class="svelte-1q1r64t"> </td></tr>`),fe=t(`<table class="data svelte-1q1r64t"><thead class="svelte-1q1r64t"><tr><th class="svelte-1q1r64t">Work</th><th class="svelte-1q1r64t">Licence</th></tr></thead><tbody></tbody></table>`),pe=t(`<div class="app svelte-1q1r64t"><div class="top svelte-1q1r64t"><a class="btnlink svelte-1q1r64t">← Simulator</a> <span class="secondary svelte-1q1r64t">Documentation: science, validation and references</span></div> <div class="doc svelte-1q1r64t"><div class="page svelte-1q1r64t"><h1 class="svelte-1q1r64t">Science and references</h1> <p>This simulator only ships processing that is described in peer-reviewed literature, and every engine is
	checked against a reference implementation. This page documents what each engine does, how it was
	validated, and what it cannot do.</p> <section class="svelte-1q1r64t"><h2 class="svelte-1q1r64t">What a hearing-loss simulation can and cannot show</h2> <p>Sensorineural hearing loss from cochlear damage does more than make sounds softer. Loss of outer hair cells
		raises thresholds and removes the cochlea's compression, so loudness grows abnormally fast above threshold
		(<em>loudness recruitment</em>) <!>. It also broadens the auditory
		filters, reducing frequency selectivity <!>.
		Simulations play these effects to a <strong>normal-hearing</strong> listener by processing the sound so that
		their own healthy cochlea receives an approximation of the impaired ear's representation.</p> <p>Other consequences of hearing loss have no validated perceptual simulation yet and are <strong>not</strong> simulated here: loss of temporal fine-structure sensitivity <!>, cochlear synaptopathy or
		"hidden hearing loss" <!>, tinnitus, and central or cognitive effects.
		The simulation also adds to the listener's own hearing, so it is only accurate for listeners with normal
		hearing.</p> <h3 class="svelte-1q1r64t">Why calibration matters</h3> <p>Audiograms are in dB HL, which is absolute: 0 dB HL is the median threshold of young normal-hearing adults <!>. Recruitment in particular depends on the level of the sound, so
		the simulator must know (a) the level the sound should have at the listener (the presentation level) and (b)
		how loud the playback device is (the calibration). Without calibration the result is only approximate.
		Deutsch et al. stress that the accuracy of simulated thresholds is the key property of a simulator <!>.</p></section> <!> <section class="svelte-1q1r64t"><h2 class="svelte-1q1r64t">Roadmap</h2> <ul><li>Hearing-aid simulation feeding into the hearing-loss simulation: NAL-R and CAM2 prescriptions <!>.</li> <li>Cochlear-implant simulation: noise/sine vocoders and the SPIRAL vocoder <!>. Vocoders only
			approximate CI hearing <!>.</li></ul></section> <section class="svelte-1q1r64t"><h2 class="svelte-1q1r64t">Sound credits</h2> <p>The built-in sounds are public-domain recordings, cut and level-normalised by <code class="svelte-1q1r64t">scripts/build_samples.py</code>.</p> <!></section> <section class="svelte-1q1r64t"><h2 class="svelte-1q1r64t">References</h2> <p class="small muted">Bibliographic data checked against Crossref and publisher records; see <code class="svelte-1q1r64t">references/VERIFICATION.md</code> in the repository.</p> <!></section></div></div></div>`);function K(t,l){S(l,!0);let O=G.core_48k,k=G.app_path_44k1,j=e=>`${Math.min(...e).toFixed(1)}–${Math.max(...e).toFixed(1)}`,M=m(null);a(()=>{fetch(E(`samples/manifest.json`)).then(e=>e.json()).then(e=>p(M,e,!0)).catch(()=>{})});let N=U.cases,P=Math.max(...N.map(e=>e.snr_db));var F=pe();_(`1q1r64t`,e=>{n(()=>{d.title=`Documentation · Hearing Loss Simulator`})});var I=i(F),L=i(I);b(2),v(I);var R=s(I,2),B=i(R),V=s(i(B),4),H=s(i(V),2),K=s(i(H),3);z(K,{keys:[`moore1993simulation`]}),z(s(K,2),{keys:[`glasberg1990derivation`,`baer1993spectral`]}),b(3),v(H);var q=s(H,2),J=s(i(q),3);z(J,{keys:[`pichorafuller2007temporal`,`lopezpoveda2013perception`]}),z(s(J,2),{keys:[`kujawa2009adding`]}),b(),v(q);var Y=s(q,4),X=s(i(Y));z(X,{keys:[`iso389_1`,`iso389_7`]}),z(s(X,2),{keys:[`deutsch2026evaluation`]}),b(),v(Y),v(V);var me=s(V,2);C(me,17,()=>D,e=>e.id,(t,n)=>{var a=ue(),l=i(a),d=i(l),p=s(d),m=y(p,!0);v(l);var g=s(l,2),_=i(g),S=s(_);{let t=e(()=>o(n).references.slice(0,3));z(S,{get keys(){return o(t)}})}v(g);var T=s(g,2),E=e=>{var t=ne(),a=s(c(t),2);C(a,21,()=>o(n).stages,w,(e,t)=>{var n=te(),a=i(n),c=y(a),l=s(a);z(s(l),{get keys(){return o(t).refs}}),v(n),f(()=>{r(c,`${o(t).name??``}.`),r(l,` ${o(t).description??``} `)}),u(e,n)}),v(a),u(e,t)};h(T,e=>{o(n).stages.length&&e(E)});var D=s(T,4),A=y(D,!0),M=s(D,2),F=e=>{var t=ie(),n=c(t),a=s(i(n),2),l=s(a),d=y(l),p=s(l);b(2),v(n);var m=s(n,2),h=i(m),g=y(h),_=s(h,2),x=s(i(_));C(x,21,()=>N,w,(e,t)=>{var n=re(),a=i(n),c=y(a,!0),l=s(a),d=y(l,!0),p=s(l),m=y(p,!0),h=s(p),g=y(h,!0),_=s(h),b=y(_,!0);v(n),f(e=>{r(c,o(t).signal),r(d,o(t).audiogram),r(m,o(t).src_pos),r(g,o(t).severity),r(b,e)},[()=>o(t).snr_db.toFixed(1)]),u(e,n)}),v(x),v(_),v(m),b(2),f((e,t)=>{r(a,` were run on ${N.length??``} cases (3 test signals × 4
				audiograms × 3 source positions, covering every severity class). The difference between the outputs is at
				least `),r(d,`${e??``} dB`),r(p,` below the reference signal (best
				${t??``} dB). That is the precision limit of 32-bit float audio: the two implementations are
				numerically equivalent. Reproduce with `),r(g,`All ${N.length??``} cases`)},[()=>U.worst_snr_db.toFixed(1),()=>P.toFixed(1)]),u(e,t)},I=e=>{var t=ae(),n=c(t),a=i(n);b(2),v(n),b(2),f((e,t,n,i,o)=>r(a,`The shipped WebAssembly module and the original MATLAB code run in Octave (${G.reference??``}) were compared on
				${O.length??``} cases at 48 kHz (3 test signals × 4 audiograms × compression health 0, 0.5 and 1, with both
				outer/middle-ear filter variants) and ${k.length??``} cases through the app's 44.1 kHz path including resampling.
				Results: ${e??``} dB at 48 kHz and ${t??``} dB for the
				app path; each case equals the reference's own float32 rounding floor. Internal level estimates and gain reductions
				agree within ${n??``} dB.
				Runtime: ${i??``} ms per second of audio (the Octave reference
				needs about ${o??``} s). Reproduce with `),[()=>j(O.map(e=>e.snr_db)),()=>j(k.map(e=>e.snr_db)),()=>Math.max(...G.stages.map(e=>e.level_estimate_max_abs_diff_db)).toExponential(0),()=>G.runtime_ms_per_second.app_44k1.toFixed(0),()=>(G.runtime_ms_per_second.octave_reference_median/1e3).toFixed(0)]),u(e,t)},L=e=>{var t=se(),n=c(t),a=s(i(n)),l=y(a,!0),d=s(a),p=s(d),m=y(p);b(3),v(n);var h=s(n,2),g=s(i(h));C(g,21,()=>W.summary,w,(e,t)=>{var n=oe(),a=i(n),c=y(a,!0),l=s(a),d=y(l,!0),p=s(l),m=y(p,!0),h=s(p),g=y(h,!0);v(n),f((e,n,i)=>{r(c,o(t).filterbank),r(d,e),r(m,n),r(g,i)},[()=>o(t).stage.replaceAll(`_`,` `),()=>o(t).worst_snr_db.toFixed(1),()=>o(t).median_wasm_ms_per_audio_second.toFixed(0)]),u(e,n)}),v(g),v(h),f((e,t)=>{r(l,e),r(d,`,
				compiled with Zig/clang) were run on ${W.cases.length??``} cases: 3 test signals × 4 audiograms × 2 filterbanks ×
				6 stage combinations, plus ${W.sanity.edge_cases.length??``} edge cases. Worst case: `),r(m,`${t??``} dB`)},[()=>W.toolkit_commit.slice(0,7),()=>W.worst_all_snr_db.toFixed(1)]),u(e,t)};h(M,e=>{o(n).id===`msbg`?e(F):o(n).id===`whis`?e(I,1):o(n).id===`tdti`&&e(L,2)});var R=s(M,2),B=e=>{var t=le(),i=s(c(t),2);C(i,21,()=>o(n).limitations,w,(e,t)=>{var n=ce(),i=y(n,!0);f(()=>r(i,o(t))),u(e,n)}),v(i),u(e,t)};h(R,e=>{o(n).limitations.length&&e(B)}),v(a),f(()=>{x(a,`id`,o(n).id),r(d,`${o(n).name??``} `),r(m,o(n).status===`available`?`(available)`:`(planned)`),r(_,`${o(n).summary??``} `),r(A,o(n).validationNote)}),u(t,a)});var Z=s(me,2),he=s(i(Z),2),Q=i(he);z(s(i(Q)),{keys:[`byrne1986national`,`moore2010development`]}),b(),v(Q);var ge=s(Q,2),_e=s(i(ge));z(_e,{keys:[`shannon1995speech`,`grange2017cochlear`,`greenwood1990cochlear`]}),z(s(_e,2),{keys:[`dorman2017sound`]}),b(),v(ge),v(he),v(Z);var $=s(Z,2),ve=s(i($),4),ye=e=>{var t=fe(),n=s(i(t));C(n,21,()=>Object.values(o(M).sources),w,(e,t)=>{var n=de(),a=i(n),c=i(a),l=y(c,!0);v(a);var d=s(a),p=y(d,!0);v(n),f(()=>{x(c,`href`,o(t).item),r(l,o(t).work),r(p,o(t).license)}),u(e,n)}),v(n),v(t),u(e,t)};h(ve,e=>{o(M)&&e(ye)}),v($);var be=s($,2),xe=s(i(be),4);{let t=e(()=>[...A.keys()]);ee(xe,{get keys(){return o(t)}})}v(be),v(B),v(R),v(F),f(e=>x(L,`href`,e),[()=>T(`/`)]),u(t,F),g()}export{K as component};