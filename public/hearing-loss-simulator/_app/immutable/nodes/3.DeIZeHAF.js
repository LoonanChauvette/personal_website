import{$ as e,A as t,B as n,E as r,G as i,J as a,K as o,O as s,P as c,Q as l,R as u,U as d,V as f,W as p,Y as m,Z as h,_ as g,g as _,m as v,nt as y,o as b,tt as x,v as S,w as C,z as w}from"../chunks/Cw-SS104.js";import{n as T,t as E}from"../chunks/CB9V4EnK.js";import{t as D}from"../chunks/BNUL0ZGP.js";function O(e,t){for(;/\s/.test(e[t]);)t++;if(e[t]===`{`){let n=0,r=t+1;for(;t<e.length;t++)if(e[t]===`{`)n++;else if(e[t]===`}`&&--n===0)return[e.slice(r,t),t+1]}else if(e[t]===`"`){let n=e.indexOf(`"`,t+1);return[e.slice(t+1,n),n+1]}let n=/^[^,}\s]+/.exec(e.slice(t)),r=n?n[0]:``;return[r,t+r.length]}function k(e){let t=[],n=/@(\w+)\s*\{\s*([^,\s]+)\s*,/g,r;for(;r=n.exec(e);){let i=r[1].toLowerCase();if(i===`comment`||i===`string`||i===`preamble`)continue;let a={},o=n.lastIndex;for(;;){for(;o<e.length&&/[\s,]/.test(e[o]);)o++;if(o>=e.length||e[o]===`}`)break;let t=/^([\w-]+)\s*=/.exec(e.slice(o));if(!t)break;o+=t[0].length;let[n,r]=O(e,o),i=t[1].toLowerCase();i===`author`&&/^\{[^{}]*\}$/.test(n.trim())&&(a.corporate=`true`),a[i]=n.replace(/[{}]/g,``).replace(/\s+/g,` `).trim(),o=r}t.push({key:r[2],type:i,fields:a}),n.lastIndex=o}return t}var A=new Map(k(`% references.bib — hearing-loss-simulation
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
`).map(e=>[e.key,e]));function j(e){return e.replace(/\\&/g,`&`).replace(/--/g,`–`).replace(/\\["'`^~]\s*(\w)/g,(e,t)=>t).replace(/\\[a-z]+\s*/gi,``)}function M(e){if(!e)return``;let t=e.split(/\s+and\s+/).map(e=>j(e.includes(`,`)?e.split(`,`)[0]:e.split(` `).at(-1)));return t.length===1?t[0]:t.length===2?`${t[0]} & ${t[1]}`:`${t[0]} et al.`}function N(e){let t=A.get(e);if(!t)return`[missing: ${e}]`;let n=(t.fields.corporate?j(t.fields.organization??t.fields.author):M(t.fields.author))||j(t.fields.organization??t.fields.publisher??t.fields.institution??t.fields.title??e);return t.fields.year?`${n} (${t.fields.year})`:n}function P(e){let t=A.get(e);if(!t)return{text:`[missing reference: ${e}]`};let n=Object.fromEntries(Object.entries(t.fields).map(([e,t])=>[e,j(t)])),r=[n.author?n.corporate?n.author:n.author.split(/\s+and\s+/).join(`, `):n.organization??n.institution,n.year&&`(${n.year})`,n.title&&`${n.title}.`,n.journal??n.booktitle??n.publisher,n.volume&&(n.number?`${n.volume}(${n.number})`:n.volume),n.pages&&`${n.pages}`].filter(Boolean),i=n.doi?`https://doi.org/${n.doi}`:n.url;return{text:r.join(` `).replace(/\s+\./g,`.`),url:i}}var F=s(`<a target="_blank" rel="noopener"> </a>`),I=s(`<span> </span>`),L=s(`<!><!>`,1),R=s(`<span class="cite svelte-19975rj">(<!>)</span>`);function z(n,a){e(a,!0);var s=R(),u=o(d(s));_(u,17,()=>a.keys,g,(e,n,a)=>{let s=h(()=>P(c(n)));var l=L(),u=p(l),d=e=>{var n=t(`;\xA0`);r(e,n)};S(u,e=>{a>0&&e(d)});var f=o(u),m=e=>{var t=F(),a=i(t,!0);w(e=>{b(t,`href`,c(s).url),b(t,`title`,c(s).text),C(a,e)},[()=>N(c(n)).replace(/[()]/g,``)]),r(e,t)},g=e=>{var t=I(),a=i(t,!0);w(e=>{b(t,`title`,c(s).text),C(a,e)},[()=>N(c(n)).replace(/[()]/g,``)]),r(e,t)};S(f,e=>{c(s).url?e(m):e(g,-1)}),r(e,l)}),x(),y(s),r(n,s),l()}var B=s(`<a target="_blank" rel="noopener" class="svelte-1japjpd"> </a>`),V=s(`<li class="svelte-1japjpd"> <!></li>`),H=s(`<ol class="refs svelte-1japjpd"></ol>`);function ee(t,n){e(n,!0);let a=h(()=>[...new Set(n.keys)].map(e=>({k:e,...P(e)})).sort((e,t)=>e.text.localeCompare(t.text)));var s=H();_(s,21,()=>c(a),e=>e.k,(e,t)=>{var n=V(),a=d(n),s=o(a),l=e=>{var n=B(),a=i(n,!0);w(e=>{b(n,`href`,c(t).url),C(a,e)},[()=>c(t).url.replace(`https://`,``)]),r(e,n)};S(s,e=>{c(t).url&&e(l)}),y(n),w(()=>{b(n,`id`,`ref-${c(t).k??``}`),C(a,`${c(t).text??``} `)}),r(e,n)}),y(s),r(t,s),l()}var U={min_snr_db:60,worst_snr_db:121.59721878071979,cases:[{signal:`harmonic_am`,audiogram:`none`,src_pos:`ff`,severity:`NOTHING`,snr_db:148.5066392529836},{signal:`harmonic_am`,audiogram:`none`,src_pos:`df`,severity:`NOTHING`,snr_db:148.5520189784782},{signal:`harmonic_am`,audiogram:`none`,src_pos:`ITU`,severity:`NOTHING`,snr_db:148.48199640292128},{signal:`harmonic_am`,audiogram:`clarity_mild`,src_pos:`ff`,severity:`MILD`,snr_db:121.59721878071979},{signal:`harmonic_am`,audiogram:`clarity_mild`,src_pos:`df`,severity:`MILD`,snr_db:128.62939303518323},{signal:`harmonic_am`,audiogram:`clarity_mild`,src_pos:`ITU`,severity:`MILD`,snr_db:132.40614683862776},{signal:`harmonic_am`,audiogram:`clarity_moderate`,src_pos:`ff`,severity:`MODERATE`,snr_db:121.75945237645445},{signal:`harmonic_am`,audiogram:`clarity_moderate`,src_pos:`df`,severity:`MODERATE`,snr_db:131.2685085319105},{signal:`harmonic_am`,audiogram:`clarity_moderate`,src_pos:`ITU`,severity:`MODERATE`,snr_db:135.75615659249883},{signal:`harmonic_am`,audiogram:`clarity_mod_severe`,src_pos:`ff`,severity:`SEVERE`,snr_db:122.03975763639535},{signal:`harmonic_am`,audiogram:`clarity_mod_severe`,src_pos:`df`,severity:`SEVERE`,snr_db:128.57215247025184},{signal:`harmonic_am`,audiogram:`clarity_mod_severe`,src_pos:`ITU`,severity:`SEVERE`,snr_db:134.44257923862722},{signal:`pink_noise`,audiogram:`none`,src_pos:`ff`,severity:`NOTHING`,snr_db:147.04214276626794},{signal:`pink_noise`,audiogram:`none`,src_pos:`df`,severity:`NOTHING`,snr_db:147.0687084710679},{signal:`pink_noise`,audiogram:`none`,src_pos:`ITU`,severity:`NOTHING`,snr_db:147.06126544159838},{signal:`pink_noise`,audiogram:`clarity_mild`,src_pos:`ff`,severity:`MILD`,snr_db:150.61980621244618},{signal:`pink_noise`,audiogram:`clarity_mild`,src_pos:`df`,severity:`MILD`,snr_db:150.58183144049738},{signal:`pink_noise`,audiogram:`clarity_mild`,src_pos:`ITU`,severity:`MILD`,snr_db:150.6438437763423},{signal:`pink_noise`,audiogram:`clarity_moderate`,src_pos:`ff`,severity:`MODERATE`,snr_db:150.86666951873138},{signal:`pink_noise`,audiogram:`clarity_moderate`,src_pos:`df`,severity:`MODERATE`,snr_db:150.84464177956087},{signal:`pink_noise`,audiogram:`clarity_moderate`,src_pos:`ITU`,severity:`MODERATE`,snr_db:151.09868258614833},{signal:`pink_noise`,audiogram:`clarity_mod_severe`,src_pos:`ff`,severity:`SEVERE`,snr_db:151.40636096456115},{signal:`pink_noise`,audiogram:`clarity_mod_severe`,src_pos:`df`,severity:`SEVERE`,snr_db:151.37234155817654},{signal:`pink_noise`,audiogram:`clarity_mod_severe`,src_pos:`ITU`,severity:`SEVERE`,snr_db:151.46417409706874},{signal:`tone_pips`,audiogram:`none`,src_pos:`ff`,severity:`NOTHING`,snr_db:149.5902177459825},{signal:`tone_pips`,audiogram:`none`,src_pos:`df`,severity:`NOTHING`,snr_db:149.74121781063107},{signal:`tone_pips`,audiogram:`none`,src_pos:`ITU`,severity:`NOTHING`,snr_db:149.55993300210488},{signal:`tone_pips`,audiogram:`clarity_mild`,src_pos:`ff`,severity:`MILD`,snr_db:138.58851736482993},{signal:`tone_pips`,audiogram:`clarity_mild`,src_pos:`df`,severity:`MILD`,snr_db:139.64260034386558},{signal:`tone_pips`,audiogram:`clarity_mild`,src_pos:`ITU`,severity:`MILD`,snr_db:141.8130775820199},{signal:`tone_pips`,audiogram:`clarity_moderate`,src_pos:`ff`,severity:`MODERATE`,snr_db:138.32397795657656},{signal:`tone_pips`,audiogram:`clarity_moderate`,src_pos:`df`,severity:`MODERATE`,snr_db:139.9049931011237},{signal:`tone_pips`,audiogram:`clarity_moderate`,src_pos:`ITU`,severity:`MODERATE`,snr_db:143.77546827639046},{signal:`tone_pips`,audiogram:`clarity_mod_severe`,src_pos:`ff`,severity:`SEVERE`,snr_db:136.97416162644146},{signal:`tone_pips`,audiogram:`clarity_mod_severe`,src_pos:`df`,severity:`SEVERE`,snr_db:138.9624072655154},{signal:`tone_pips`,audiogram:`clarity_mod_severe`,src_pos:`ITU`,severity:`SEVERE`,snr_db:144.57813602479402}]},te=s(`<li><strong> </strong> <!></li>`),ne=s(`<h3 class="svelte-1q1r64t">Processing stages</h3> <ol></ol>`,1),re=s(`<tr><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td><td class="svelte-1q1r64t"> </td></tr>`),ie=s(`<p>Our engine and pyclarity's <code class="svelte-1q1r64t">Ear.process</code> <strong> </strong> <code class="svelte-1q1r64t">validation/compare_msbg.py</code>.</p> <details class="svelte-1q1r64t"><summary class="svelte-1q1r64t"> </summary> <table class="data svelte-1q1r64t"><thead class="svelte-1q1r64t"><tr><th class="svelte-1q1r64t">Signal</th><th class="svelte-1q1r64t">Audiogram</th><th class="svelte-1q1r64t">Source</th><th class="svelte-1q1r64t">Severity</th><th class="svelte-1q1r64t">SNR (dB)</th></tr></thead><tbody></tbody></table></details> <p class="small muted">Documented reference quirk: the overlap-add loop of the reference smearing routine reads new input with a
				fixed 192-sample (4.4 ms) lag. We reproduce it exactly and compensate the latency in the app, so the
				simulated and original tracks stay time-aligned.</p>`,1),ae=s(`<li> </li>`),oe=s(`<h3 class="svelte-1q1r64t">Limitations</h3> <ul></ul>`,1),se=s(`<section class="svelte-1q1r64t"><h2 class="svelte-1q1r64t"> <span class="status svelte-1q1r64t"> </span></h2> <p> <!></p> <!> <h3 class="svelte-1q1r64t">Validation</h3> <p> </p> <!> <!></section>`),ce=s(`<tr><td class="svelte-1q1r64t"><a target="_blank" rel="noopener"> </a></td><td class="svelte-1q1r64t"> </td></tr>`),le=s(`<table class="data svelte-1q1r64t"><thead class="svelte-1q1r64t"><tr><th class="svelte-1q1r64t">Work</th><th class="svelte-1q1r64t">Licence</th></tr></thead><tbody></tbody></table>`),ue=s(`<div class="app svelte-1q1r64t"><div class="top svelte-1q1r64t"><a class="btnlink svelte-1q1r64t">← Simulator</a> <span class="secondary svelte-1q1r64t">Documentation: science, validation and references</span></div> <div class="doc svelte-1q1r64t"><div class="page svelte-1q1r64t"><h1 class="svelte-1q1r64t">Science and references</h1> <p>This simulator only ships processing that is described in peer-reviewed literature, and every engine is
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
		Deutsch et al. stress that the accuracy of simulated thresholds is the key property of a simulator <!>.</p></section> <!> <section class="svelte-1q1r64t"><h2 class="svelte-1q1r64t">Roadmap</h2> <ul><li>WHIS v3 engine with separate outer/inner hair-cell loss <!>.</li> <li>3D Tune-In engine for real-time and binaural use <!>.</li> <li>Hearing-aid simulation feeding into the hearing-loss simulation: NAL-R and CAM2 prescriptions <!>.</li> <li>Cochlear-implant simulation: noise/sine vocoders and the SPIRAL vocoder <!>. Vocoders only
			approximate CI hearing <!>.</li></ul></section> <section class="svelte-1q1r64t"><h2 class="svelte-1q1r64t">Sound credits</h2> <p>The built-in sounds are public-domain recordings, cut and level-normalised by <code class="svelte-1q1r64t">scripts/build_samples.py</code>.</p> <!></section> <section class="svelte-1q1r64t"><h2 class="svelte-1q1r64t">References</h2> <p class="small muted">Bibliographic data checked against Crossref and publisher records; see <code class="svelte-1q1r64t">references/VERIFICATION.md</code> in the repository.</p> <!></section></div></div></div>`);function W(t,s){e(s,!0);let O=m(null);n(()=>{fetch(E(`samples/manifest.json`)).then(e=>e.json()).then(e=>a(O,e,!0)).catch(()=>{})});let k=U.cases,j=Math.max(...k.map(e=>e.snr_db));var M=ue();v(`1q1r64t`,e=>{u(()=>{f.title=`Documentation · Hearing Loss Simulator`})});var N=d(M),P=d(N);x(2),y(N);var F=o(N,2),I=d(F),L=o(d(I),4),R=o(d(L),2),B=o(d(R),3);z(B,{keys:[`moore1993simulation`]}),z(o(B,2),{keys:[`glasberg1990derivation`,`baer1993spectral`]}),x(3),y(R);var V=o(R,2),H=o(d(V),3);z(H,{keys:[`pichorafuller2007temporal`,`lopezpoveda2013perception`]}),z(o(H,2),{keys:[`kujawa2009adding`]}),x(),y(V);var W=o(V,4),G=o(d(W));z(G,{keys:[`iso389_1`,`iso389_7`]}),z(o(G,2),{keys:[`deutsch2026evaluation`]}),x(),y(W),y(L);var K=o(L,2);_(K,17,()=>D,e=>e.id,(e,t)=>{var n=se(),a=d(n),s=d(a),l=o(s),u=i(l,!0);y(a);var f=o(a,2),m=d(f),v=o(m);{let e=h(()=>c(t).references.slice(0,3));z(v,{get keys(){return c(e)}})}y(f);var T=o(f,2),E=e=>{var n=ne(),a=o(p(n),2);_(a,21,()=>c(t).stages,g,(e,t)=>{var n=te(),a=d(n),s=i(a),l=o(a);z(o(l),{get keys(){return c(t).refs}}),y(n),w(()=>{C(s,`${c(t).name??``}.`),C(l,` ${c(t).description??``} `)}),r(e,n)}),y(a),r(e,n)};S(T,e=>{c(t).stages.length&&e(E)});var D=o(T,4),O=i(D,!0),A=o(D,2),M=e=>{var t=ie(),n=p(t),a=o(d(n),2),s=o(a),l=i(s),u=o(s);x(2),y(n);var f=o(n,2),m=d(f),h=i(m),v=o(m,2),b=o(d(v));_(b,21,()=>k,g,(e,t)=>{var n=re(),a=d(n),s=i(a,!0),l=o(a),u=i(l,!0),f=o(l),p=i(f,!0),m=o(f),h=i(m,!0),g=o(m),_=i(g,!0);y(n),w(e=>{C(s,c(t).signal),C(u,c(t).audiogram),C(p,c(t).src_pos),C(h,c(t).severity),C(_,e)},[()=>c(t).snr_db.toFixed(1)]),r(e,n)}),y(b),y(v),y(f),x(2),w((e,t)=>{C(a,` were run on ${k.length??``} cases (3 test signals × 4
				audiograms × 3 source positions, covering every severity class). The difference between the outputs is at
				least `),C(l,`${e??``} dB`),C(u,` below the reference signal (best
				${t??``} dB). That is the precision limit of 32-bit float audio: the two implementations are
				numerically equivalent. Reproduce with `),C(h,`All ${k.length??``} cases`)},[()=>U.worst_snr_db.toFixed(1),()=>j.toFixed(1)]),r(e,t)};S(A,e=>{c(t).id===`msbg`&&e(M)});var N=o(A,2),P=e=>{var n=oe(),a=o(p(n),2);_(a,21,()=>c(t).limitations,g,(e,t)=>{var n=ae(),a=i(n,!0);w(()=>C(a,c(t))),r(e,n)}),y(a),r(e,n)};S(N,e=>{c(t).limitations.length&&e(P)}),y(n),w(()=>{b(n,`id`,c(t).id),C(s,`${c(t).name??``} `),C(u,c(t).status===`available`?`(available)`:`(planned)`),C(m,`${c(t).summary??``} `),C(O,c(t).validationNote)}),r(e,n)});var q=o(K,2),J=o(d(q),2),Y=d(J);z(o(d(Y)),{keys:[`irino2023whis`]}),x(),y(Y);var X=o(Y,2);z(o(d(X)),{keys:[`cuevasrodriguez20193d`]}),x(),y(X);var Z=o(X,2);z(o(d(Z)),{keys:[`byrne1986national`,`moore2010development`]}),x(),y(Z);var Q=o(Z,2),de=o(d(Q));z(de,{keys:[`shannon1995speech`,`grange2017cochlear`,`greenwood1990cochlear`]}),z(o(de,2),{keys:[`dorman2017sound`]}),x(),y(Q),y(J),y(q);var $=o(q,2),fe=o(d($),4),pe=e=>{var t=le(),n=o(d(t));_(n,21,()=>Object.values(c(O).sources),g,(e,t)=>{var n=ce(),a=d(n),s=d(a),l=i(s,!0);y(a);var u=o(a),f=i(u,!0);y(n),w(()=>{b(s,`href`,c(t).item),C(l,c(t).work),C(f,c(t).license)}),r(e,n)}),y(n),y(t),r(e,t)};S(fe,e=>{c(O)&&e(pe)}),y($);var me=o($,2),he=o(d(me),4);{let e=h(()=>[...A.keys()]);ee(he,{get keys(){return c(e)}})}y(me),y(I),y(F),y(M),w(e=>b(P,`href`,e),[()=>T(`/`)]),r(t,M),l()}export{W as component};