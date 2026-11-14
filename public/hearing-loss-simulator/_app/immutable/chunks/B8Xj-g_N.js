import{C as e,G as t,N as n,Q as r,Y as i,Z as a,at as o,ct as s,it as c,j as l,k as u,l as d,rt as f,x as p,z as m}from"./z8nYvVer.js";function h(e,t){for(;/\s/.test(e[t]);)t++;if(e[t]===`{`){let n=0,r=t+1;for(;t<e.length;t++)if(e[t]===`{`)n++;else if(e[t]===`}`&&--n===0)return[e.slice(r,t),t+1]}else if(e[t]===`"`){let n=e.indexOf(`"`,t+1);return[e.slice(t+1,n),n+1]}let n=/^[^,}\s]+/.exec(e.slice(t)),r=n?n[0]:``;return[r,t+r.length]}function g(e){let t=[],n=/@(\w+)\s*\{\s*([^,\s]+)\s*,/g,r;for(;r=n.exec(e);){let i=r[1].toLowerCase();if(i===`comment`||i===`string`||i===`preamble`)continue;let a={},o=n.lastIndex;for(;;){for(;o<e.length&&/[\s,]/.test(e[o]);)o++;if(o>=e.length||e[o]===`}`)break;let t=/^([\w-]+)\s*=/.exec(e.slice(o));if(!t)break;o+=t[0].length;let[n,r]=h(e,o),i=t[1].toLowerCase();i===`author`&&/^\{[^{}]*\}$/.test(n.trim())&&(a.corporate=`true`),a[i]=n.replace(/[{}]/g,``).replace(/\s+/g,` `).trim(),o=r}t.push({key:r[2],type:i,fields:a}),n.lastIndex=o}return t}var _=new Map(g(`% references.bib — hearing-loss-simulation
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

@standard{ansi_s3_6_2018,
  author       = {{Acoustical Society of America}},
  title        = {{ASA/ANSI} S3.6-2018 American National Standard Specification for Audiometers},
  organization = {ANSI/ASA},
  year         = {2018},
  type         = {Standard},
  number       = {ASA/ANSI S3.6-2018},
  note         = {Standard not read. The speech reference used by the app (1 kHz speech-circuit calibration tone, read on the VU meter, 12.5 dB above the 1 kHz reference threshold of the transducer) is taken from the Etymotic ER-3C data sheet, which quotes the ANSI rule. Applying it to a loudspeaker with the free-field 1 kHz threshold is our extension.},
}

@article{killion2009comparison,
  author    = {Killion, Mead C.},
  title     = {Comparison of vu-meter-based and rms-based calibration of speech levels},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {2009},
  volume    = {126},
  number    = {3},
  pages     = {EL97--EL99},
  doi       = {10.1121/1.3204155},
}

@article{masalski2014biological,
  author    = {Masalski, Marcin and Grysi{\\'n}ski, Tomasz and Kr{\\k{e}}cicki, Tomasz},
  title     = {Biological calibration for web-based hearing tests: evaluation of the methods},
  journal   = {Journal of Medical Internet Research},
  year      = {2014},
  volume    = {16},
  number    = {1},
  pages     = {e11},
  doi       = {10.2196/jmir.2798},
  note      = {Test--retest SD 3.87 dB for the B{\\'e}k{\\'e}sy-style method with a modulated signal; SD of the difference from clinical audiometry 7.3--10.4 dB depending on the method (25 young adults).},
}

@standard{iso226_2003,
  author       = {{International Organization for Standardization}},
  title        = {{ISO} 226:2003 Acoustics --- Normal equal-loudness-level contours},
  organization = {ISO},
  year         = {2003},
  type         = {Standard},
  number       = {ISO 226:2003},
  note         = {Table 1, threshold of hearing T_f (free field, frontal incidence, binaural) at the one-third-octave frequencies 20 Hz--12.5 kHz; values read from the ISO preview of the standard. Superseded by ISO 226:2023 for the contours; the threshold values are those of ISO 389-7.},
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

@article{cornelisse1995input,
  author    = {Cornelisse, Leonard E. and Seewald, Richard C. and Jamieson, Donald G.},
  title     = {The input/output formula: A theoretical approach to the fitting of personal amplification devices},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {1995},
  volume    = {97},
  number    = {3},
  pages     = {1854--1864},
  doi       = {10.1121/1.412980},
}

@article{sherlock2005estimates,
  author    = {Sherlock, LaGuinn P. and Formby, Craig},
  title     = {Estimates of Loudness, Loudness Discomfort, and the Auditory Dynamic Range: Normative Estimates, Comparison of Procedures, and Test-Retest Reliability},
  journal   = {Journal of the American Academy of Audiology},
  year      = {2005},
  volume    = {16},
  number    = {2},
  pages     = {85--100},
  doi       = {10.3766/jaaa.16.2.4},
}

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

@article{johnson2013prescriptive,
  author    = {Johnson, Earl E.},
  title     = {Prescriptive Amplification Recommendations for Hearing Losses with a Conductive Component and Their Impact on the Required Maximum Power Output: An Update with Accompanying Clinical Explanation},
  journal   = {Journal of the American Academy of Audiology},
  year      = {2013},
  volume    = {24},
  number    = {6},
  pages     = {452--460},
  doi       = {10.3766/jaaa.24.6.2},
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

@article{moore1998use,
  author    = {Moore, Brian C. J. and Glasberg, Brian R.},
  title     = {Use of a Loudness Model for Hearing-Aid Fitting. {I}. Linear Hearing Aids},
  journal   = {British Journal of Audiology},
  year      = {1998},
  volume    = {32},
  number    = {5},
  pages     = {317--335},
  doi       = {10.3109/03005364000000083},
}

@article{moore1999use,
  author    = {Moore, Brian C. J. and Alc{\\'a}ntara, Jos{\\'e} I. and Stone, Michael A. and Glasberg, Brian R.},
  title     = {Use of a loudness model for hearing aid fitting: {II}. Hearing aids with multi-channel compression},
  journal   = {British Journal of Audiology},
  year      = {1999},
  volume    = {33},
  number    = {3},
  pages     = {157--170},
  doi       = {10.3109/03005369909090095},
}

@article{byrne1994international,
  author    = {Byrne, Denis and Dillon, Harvey and Tran, Khanh and Arlinger, Stig and Wilbraham, Keith and Cox, Robyn and Hagerman, Bj{\\"o}rn and Hetu, Raymond and Kei, Joseph and Lui, C. and Kiessling, J{\\"u}rgen and Kotby, M. Nasser and Nasser, Nasser H. A. and El Kholy, Wafaa A. H. and Nakanishi, Yasuko and Oyer, Herbert and Powell, Richard and Stephens, Dafydd and Meredith, Rhys and Sirimanna, Tony and Tavartkiladze, George and Frolenkov, Gregory I. and Westerman, Soren and Ludvigsen, Carl},
  title     = {An international comparison of long-term average speech spectra},
  journal   = {The Journal of the Acoustical Society of America},
  year      = {1994},
  volume    = {96},
  number    = {4},
  pages     = {2108--2120},
  doi       = {10.1121/1.410152},
}

@article{linkwitz1976active,
  author    = {Linkwitz, Siegfried H.},
  title     = {Active Crossover Networks for Noncoincident Drivers},
  journal   = {Journal of the Audio Engineering Society},
  year      = {1976},
  volume    = {24},
  number    = {1},
  pages     = {2--8},
  note      = {Not in Crossref; see references/VERIFICATION.md},
}

@inproceedings{dappolito1984active,
  author    = {D'Appolito, Joseph A.},
  title     = {Active Realization of Multiway All-Pass Crossover Systems},
  booktitle = {Audio Engineering Society Convention 76},
  year      = {1984},
  month     = oct,
  note      = {Cited as in pyclarity's crossover module; not in Crossref; see references/VERIFICATION.md},
}

@article{keidser2011nal,
  author    = {Keidser, Gitte and Dillon, Harvey and Flax, Matthew and Ching, Teresa and Brewer, Scott},
  title     = {The {NAL-NL2} Prescription Procedure},
  journal   = {Audiology Research},
  year      = {2011},
  volume    = {1},
  number    = {1},
  pages     = {e24},
  doi       = {10.4081/audiores.2011.e24},
}

@article{keidser2012nal,
  author    = {Keidser, Gitte and Dillon, Harvey and Carter, Lyndal and O'Brien, Anna},
  title     = {{NAL-NL2} Empirical Adjustments},
  journal   = {Trends in Amplification},
  year      = {2012},
  volume    = {16},
  number    = {4},
  pages     = {211--223},
  doi       = {10.1177/1084713812468511},
}

@article{johnson2011comparison,
  author    = {Johnson, Earl E. and Dillon, Harvey},
  title     = {A Comparison of Gain for Adults from Generic Hearing Aid Prescriptive Methods: Impacts on Predicted Loudness, Frequency Bandwidth, and Speech Intelligibility},
  journal   = {Journal of the American Academy of Audiology},
  year      = {2011},
  volume    = {22},
  number    = {7},
  pages     = {441--459},
  doi       = {10.3766/jaaa.22.7.5},
}

@article{ching2001maximizing,
  author    = {Ching, Teresa Y. C. and Dillon, Harvey and Katsch, Richard and Byrne, Denis},
  title     = {Maximizing Effective Audibility in Hearing Aid Fitting},
  journal   = {Ear and Hearing},
  year      = {2001},
  volume    = {22},
  number    = {3},
  pages     = {212--224},
  doi       = {10.1097/00003446-200106000-00005},
}

@article{moore2004revised,
  author    = {Moore, Brian C. J. and Glasberg, Brian R.},
  title     = {A revised model of loudness perception applied to cochlear hearing loss},
  journal   = {Hearing Research},
  year      = {2004},
  volume    = {188},
  number    = {1--2},
  pages     = {70--88},
  doi       = {10.1016/S0378-5955(03)00347-2},
}

@article{moore1997model,
  author    = {Moore, Brian C. J. and Glasberg, Brian R. and Baer, Thomas},
  title     = {A Model for the Prediction of Thresholds, Loudness, and Partial Loudness},
  journal   = {Journal of the Audio Engineering Society},
  year      = {1997},
  volume    = {45},
  number    = {4},
  pages     = {224--240},
  note      = {Not in Crossref; details from the paper itself},
}

@article{kitterick2026nal,
  author    = {Kitterick, P{\\'a}draig T. and Monaghan, Jessica J. M. and Zakis, Justin A. and Gavrilis, Jason and Croteau, Matthew and Mishra, Debabrata and Boothalingam, Sriram and Kwok, Catherine and Rutledge, Kate L. and Gilliver, Megan and Weiss, Michelle and Milner, Stacey and Flynn, Christopher and Nakad, Phillip and Chesnaye, Michael and Brewer, Scott and Ozonuk, Riza and Zhang, Vicky W. and Nguyen, Giao and Meng, Qingqing and Oliver, Jane and Incerti, Paola and Edwards, Brent},
  title     = {The {NAL-NL3} Prescription},
  journal   = {International Journal of Audiology},
  year      = {2026},
  pages     = {1--23},
  doi       = {10.1080/14992027.2026.2743347},
}

@article{kitterick2026evolving,
  author    = {Kitterick, P{\\'a}draig T. and Zakis, Justin A. and Edwards, Brent},
  title     = {Evolving the philosophy: from the {NAL} rule to {NAL-NL3}},
  journal   = {International Journal of Audiology},
  year      = {2026},
  pages     = {1--10},
  doi       = {10.1080/14992027.2026.2690236},
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
`).map(e=>[e.key,e]));function v(e){return e.replace(/\\&/g,`&`).replace(/--/g,`–`).replace(/\\["'`^~]\s*(\w)/g,(e,t)=>t).replace(/\\k\s*(\w)/g,`$1`).replace(/\\[a-z]+\s*/gi,``)}function y(e){if(!e)return``;let t=e.split(/\s+and\s+/).map(e=>v(e.includes(`,`)?e.split(`,`)[0]:e.split(` `).at(-1)));return t.length===1?t[0]:t.length===2?`${t[0]} & ${t[1]}`:`${t[0]} et al.`}function b(e){let t=_.get(e);if(!t)return`[missing: ${e}]`;let n=(t.fields.corporate?v(t.fields.organization??t.fields.author):y(t.fields.author))||v(t.fields.organization??t.fields.publisher??t.fields.institution??t.fields.title??e);return t.fields.year?`${n} (${t.fields.year})`:n}function x(e){let t=_.get(e);if(!t)return{text:`[missing reference: ${e}]`};let n=Object.fromEntries(Object.entries(t.fields).map(([e,t])=>[e,v(t)])),r=[n.author?n.corporate?n.author:n.author.split(/\s+and\s+/).join(`, `):n.organization??n.institution,n.year&&`(${n.year})`,n.title&&`${n.title}.`,n.journal??n.booktitle??n.publisher,n.volume&&(n.number?`${n.volume}(${n.number})`:n.volume),n.pages&&`${n.pages}`].filter(Boolean),i=n.doi?`https://doi.org/${n.doi}`:n.url;return{text:r.join(` `).replace(/\s+\./g,`.`),url:i}}var ee=n(`<a target="_blank" rel="noopener" class="svelte-1japjpd"> </a>`),te=n(`<li class="svelte-1japjpd"> <!></li>`),ne=n(`<ol class="refs svelte-1japjpd"></ol>`);function re(n,h){o(h,!0);let g=f(()=>[...new Set(h.keys)].map(e=>({k:e,...x(e)})).sort((e,t)=>e.text.localeCompare(t.text)));var _=ne();p(_,21,()=>m(g),e=>e.k,(n,o)=>{var c=te(),f=i(c),p=r(f),h=e=>{var n=ee(),r=a(n,!0);t(e=>{d(n,`href`,m(o).url),u(r,e)},[()=>m(o).url.replace(`https://`,``)]),l(e,n)};e(p,e=>{m(o).url&&e(h)}),s(c),t(()=>{d(c,`id`,`ref-${m(o).k??``}`),u(f,`${m(o).text??``} `)}),l(n,c)}),s(_),l(n,_),c()}var ie=`# Model card: 3D Tune-In hearing-loss simulator

| | |
|---|---|
| Engine id | \`3dti\` (Rust module and TS method: \`tdti\`) |
| Implementation | \`crates/hls-core/src/tdti/\` (dependency-free Rust → WebAssembly) |
| Reference implementation | 3D Tune-In Audio Toolkit, commit \`5a87918b4b3c179f94f37b56c8b33f6f2db24a13\`, LGPL-3.0 |
| Publication | Cuevas-Rodríguez et al. 2019, PLOS ONE 14(3), e0211899 [\`cuevasrodriguez20193d\`] |
| Status | See the measured Validation results below. |
| Sample rate | 44.1 kHz only; other rates are rejected. |

Citation keys refer to \`references/references.bib\`; source provenance is [\`tdtiToolkit2026\`]. This is the hearing-loss chain,
not the toolkit's HRTF spatializer or its hearing-aid simulator.

## What it simulates

The toolkit's \`CHearingLossSim::Process\` applies these stages in order:

1. **Temporal distortion**: fourth-order low/high-pass splits at 1600 Hz, integer
   sample jitter of the low band, delayed high band, then another identical pair
   of split filters and summation. The jitter is Gaussian noise passed through a
   500 Hz low-pass biquad, Q = 0.707. The configured jitter amount is the Gaussian
   source standard deviation in milliseconds **before** filtering, not the output
   delay standard deviation. Delay offsets are clamped to ±(block/2 − 1) samples;
   the fractional read index is truncated, with no interpolation.
2. **Frequency smearing**, optionally: the toolkit's Graf/3DTI method. A symmetric
   Hann window covers the previous and current block. The magnitudes of a
   double-precision FFT (rounded to float32) are convolved with a normalized,
   asymmetric Gaussian kernel; phases are retained, followed by inverse FFT and
   overlap-add. This smears **magnitude**, not power. We preserve the toolkit's
   kernel indexing, doubled centre bin, nominal bin bandwidth \`fs/(4*block)\`, and
   1e-7 rounding-to-zero thresholds. These are reference behaviours, not corrected
   alternatives. The Baer/Moore smearing class is not included in this port.
3. **Audiogram/expansion**: nine octave audiometry points, 62.5–16000 Hz. Our
   adapter interpolates the supplied audiogram linearly in Hz and holds endpoints
   constant, then the toolkit caps hearing levels at 99 dB HL. For hearing loss
   \`H\`, the toolkit uses attenuation \`A = 20*H*0.01\` dB, expansion threshold
   \`T = 80 + (20*H)*0.01\` dB SPL, and ratio
   \`R = 80 / (80 − 80*H*0.01)\`. Expansion below T applies gain
   \`10^((R−1)*(20*log10(envelope)−T_dBFS)/20)\`, followed by the attenuation.
   This loss law differs from MSBG's catch-up-level law.

Both supported filterbanks use **grouped** expansion:

- **Butterworth** (adapter default): three second-order bandpass filters per
  octave, grouped into nine expanders, correction gain sqrt(2)/2. Filter
  frequencies, Q, and the toolkit's second-block startup crossfade are retained.
- **Gammatone**: fourth-order complex demodulating filters with Glasberg ERBs,
  spanning the toolkit's 20–20000 Hz range, one ERB apart (including its extra
  endpoint filter). Boundaries are geometric means of adjacent audiometry octave
  frequencies. The first/last group's parameter frequencies are 0/30000 Hz,
  matching \`SetGroups\`. Filter outputs are summed within each group, multiplied
  by 4, expanded and attenuated.

The peak-envelope follower uses \`exp(1000*ln(0.01)/(time_ms*fs))\`, with separate
attack/release coefficients; it is not an RMS detector. The port preserves float32
state and arithmetic boundaries. The toolkit's biquad states, oscillator phases,
and filter-design calculations use double precision and remain double here.

## Defaults and their provenance

The current toolkit API requires the caller to install a filterbank and choose
calibration and buffer size; there is **no single current constructor default**
that specifies the entire chain. The older documented example in
\`docs/examples/example.md\` supplies 100 dB SPL at 0 dBFS, initial frequency 62.5 Hz,
nine bands, three filters per band, and a 256-sample buffer. Its \`Setup\` signature
predates the current filterbank injection API. Our Butterworth configuration
follows that documented legacy three-filter layout; Gammatone grouping is an
explicit adapter choice. Neither is described as a uniquely mandated default.

Current toolkit constants and \`Setup\` establish 20 ms attack, 100 ms release,
ratio 1 / threshold 0 before setting the audiogram, temporal stage **enabled at
0 ms jitter**, 1600 Hz split, noise synchronicity 0, and frequency smearing
**disabled**. Enabling the temporal stage at 0 ms still applies its split filters
and block/2 delay. Enabling smearing with zero widths uses an impulse kernel, but
still applies the symmetric Hann analysis/synthesis and its block delay.

Our defaults match those constants: \`temporal_distortion=true\`, \`jitter_ms=0\`,
\`frequency_smearing=false\`, widths 0 Hz, one kernel bin per side. To get audible
smearing, enable it and choose nonzero widths **and** more bins, e.g. down/up
80/120 Hz and 16 bins. Bins alone do not imply a specified hearing-loss severity.

## Levels and calibration

The public API follows MSBG's app convention: RMS 1 = \`equiv_0db_spl\`, default
120 dB SPL. The reference toolkit's example calibration remains **100 dB SPL at
0 dBFS**. The adapter multiplies input by
\`10^((equiv_0db_spl − 100)/20)\` before processing, and divides the output by the
same factor. A signal's internal SPL is therefore exactly
\`20*log10(RMS(input)) + equiv_0db_spl\`. No normalization, clipping or playback gain
is performed. At the default equivalence the input multiplier is 10.

\`Ear::process\` pads the final block and flushes two zero blocks, removes the
delay \`(temporal ? block/2 : 0) + (smearing ? block : 0) + (gammatone ? 22 : 0)\`, and returns
exactly the input length. The extra 22 samples compensate the Gammatone bank’s
nominal broadband peak lag, verified with the deterministic broadband alignment
signal. IIR phase/group delay is frequency dependent and is
preserved; there is no signal-dependent fitted lag or gain. \`process_raw\` retains
the block-padded output and flushing tail for reference work. Stereo is two mono
calls, with separate audiograms and seeds; left/right synchronization controls
are not exposed. Using the same seed for both ears gives correlated jitter.

## Validation

\`validation/compare_3dti.py\` runs the **shipped** \`web/src/lib/wasm/hls_wasm.wasm\`
through the app's \`HlsWasm.tdti\`, and the actual native \`CHearingLossSim\` via
\`validation/3dti/reference.cpp\`. Stimuli: harmonic AM speech-like signal, pink
noise, tone pips, each with overall level 65 dB SPL. Audiograms: normal, mild,
moderate, steeply sloping. Both filterbanks are tested with expander only,
zero-jitter temporal, 0.5 ms jitter, smearing only, smearing + zero-jitter temporal,
and smearing + nonzero jitter. There is no fitted alignment or gain correction.

**All 144 main cases passed the 60 dB target; worst main-case SNR 127.81 dB.**
Ten cases matched float32 output exactly (stored with \`snr_db: null\` and
\`exact_float32_match: true\`, representing mathematical SNR +∞).
SNR values below are the minimum over the 12 stimulus/audiogram pairs per row;
runtimes are medians over those same pairs.

| Stages | Butterworth SNR (dB) | Gammatone SNR (dB) | Butterworth ms/s | Gammatone ms/s |
|---|---:|---:|---:|---:|
| Expander only | 142.16 | 144.76 | 50.8 | 172.8 |
| Temporal, 0 ms jitter | 142.13 | 144.69 | 55.8 | 158.9 |
| Temporal, 0.5 ms jitter | 142.10 | 144.76 | 54.2 | 159.4 |
| Smearing only | 131.61 | 127.81 | 63.9 | 167.0 |
| Smearing + temporal, 0 ms | 131.49 | 127.99 | 69.8 | 172.5 |
| Smearing + temporal, 0.5 ms | 131.93 | 127.87 | 66.9 | 174.0 |

Timing is milliseconds per second of **mono** audio, Node v26.13.0 on an Intel
Core i5-3437U @ 1.90 GHz, under shared machine load. Each 1.2-second case gets one
warmup and three timed complete wrapper calls (median), including state setup,
allocation and copies, excluding file I/O and module instantiation. Default
Butterworth costs **55.8 ms per audio second** (~0.056× real time); nonzero
smearing + jitter costs 66.9 ms/s. Gammatone costs 158.9 ms/s by default temporal
settings and 174.0 ms/s with all stages. These are development-machine timings,
not a browser/mobile guarantee.

Eight extra cases cover blocks 64/1024, zero-width smearing, 0/0.5 ms jitter,
seed 72, attack 0 ms and release 7 ms: **worst SNR 125.88 dB**. The seeded stereo
harness check gives **144.78 / 145.31 dB** (left/right), using seeds 17/18.
Broadband normal-hearing alignment is **0 samples for both banks**, with temporal
processing on/off; normal-hearing output gains range +1.00 to +1.63 dB (the
reference filterbanks are not perfect-reconstruction unity-gain banks).
A calibration-equivalence check (120 dB input vs tenfold samples at 100 dB) has
maximum absolute sample error **9.31e-10**. Empty/non-block/silent lengths, finite
output and seed repeatability pass. Fifteen Rust WASI unit tests and the TS
API/error smoke check pass; the appended TS wrapper also passes standalone tsc.
The existing MSBG quick regression passes all six cases at **≥121.9 dB SNR**.

Full per-case output and wasm SHA-256:
\`validation/results/3dti-vs-reference.json\`. Run \`node validation/check_3dti.ts\`
for argument/error recovery checks; the Python comparator also performs alignment
and level sanity checks. No reference-normalized output or fitted shifts are used.


The reference uses Zig C++/libc++ with \`-O2 -ffp-contract=off\`. Its only source
instrumentation, in a temporary build copy, replaces \`random_device\` seeding with
a supplied seed (left seed, right seed+1). All toolkit DSP and C++ distribution
code is unchanged. Rust reproduces libc++'s \`minstd_rand\` (48271, modulus
2147483647) and \`normal_distribution<float>\` polar transform. Seeded repeatability
is an intentional change from the toolkit's nondeterministic initialization;
no claim is made about matching a libstdc++ or MSVC RNG. Different platform math
libraries can still round transcendental functions differently.

## Public API

\`\`\`rust
pub enum Filterbank { Gammatone = 0, Butterworth = 1 }
pub struct TdtiConfig {
    pub sample_rate: u32,           // 44100 only
    pub equiv_0db_spl: f32,         // 120; 40..=160
    pub filterbank: Filterbank,     // Butterworth
    pub block_size: usize,         // 256; power of two, 64..=2048
    pub attack_ms: f32,             // 20; 0..=10000
    pub release_ms: f32,            // 100; 0..=10000
    pub temporal_distortion: bool, // true
    pub jitter_ms: f32,             // 0; 0..=10
    pub frequency_smearing: bool,  // false
    pub smearing_down_hz: f32,      // 0; 0..=20000
    pub smearing_up_hz: f32,        // 0; 0..=20000
    pub smearing_bins: usize,      // 1; 1..=block_size
    pub seed: u32,                 // 1
}
impl Ear {
    pub fn new(audiogram: &Audiogram, config: TdtiConfig) -> Result<Self, TdtiError>;
    pub fn process(&self, input: &[f32]) -> Result<Vec<f32>, TdtiError>;
    pub fn process_raw(&self, input: &[f32]) -> Result<Vec<f32>, TdtiError>;
    pub fn latency(&self) -> usize;
    pub fn octave_levels(&self) -> &[f32; 9];
}
\`\`\`

\`tdti::TdtiConfig::validate()\` and \`latency()\` are also public. \`Ear\` calls reset
all filter/RNG states; it is an offline API, not a streaming session.

\`\`\`c
int32_t hls_3dti_process(
    const float *input, size_t n,
    const double *freqs, const double *levels, size_t n_aud,
    double equiv_0db_spl, uint32_t filterbank, size_t block_size,
    float attack_ms, float release_ms, uint32_t temporal_distortion,
    float jitter_ms, uint32_t frequency_smearing,
    float smearing_down_hz, float smearing_up_hz, size_t smearing_bins,
    uint32_t seed, uint32_t sample_rate);
\`\`\`

WASM \`size_t\` is 32-bit. Bank: 0 Gammatone, 1 Butterworth. Flags: 0/1. All
arguments are explicit; defaults belong to Rust/TS. Returns 0 on success,
−1 for invalid arguments/configuration, −2 for invalid input samples. Results and
errors use the existing \`hls_result_*\` / \`hls_error_*\` ABI. The new function clears
stale output/error state at entry. ABI version remains 1 (additive export).

\`\`\`ts
hls.tdti(input: Float32Array, audiogram: AudiogramData,
         opts?: TdtiOptions): Float32Array
\`\`\`

\`TdtiOptions\` fields map one-to-one to Rust with these names and defaults:
\`sampleRate=44100\`, \`equiv0dbSpl=120\`, \`filterbank='butterworth'\` (or \`'gammatone'\`),
\`blockSize=256\`, \`attackMs=20\`, \`releaseMs=100\`, \`temporalDistortion=true\`,
\`jitterMs=0\`, \`frequencySmearing=false\`, \`smearingDownHz=0\`, \`smearingUpHz=0\`,
\`smearingBins=1\`, \`seed=1\`. Invalid configuration throws \`HlsError\`. Input is
mono; it must already be resampled to 44.1 kHz. No existing API was changed.

## Limitations

- This is a simulation for normal-hearing listeners, not an individualized
  prediction of impaired perception or a clinical device. The toolkit paper
  describes the broader toolkit, not a clinical validation of this Rust port.
- Grouped expansion only; individual per-filter expanders, custom group
  boundaries, selectable temporal split frequencies, Baer/Moore smearing,
  binaural synchronicity and the toolkit's live enable/disable transitions are
  not exposed. Graf/3DTI smearing is supported instead.
- Hearing levels 0–120 dB HL are accepted, then capped at 99 as upstream; negative
  audiogram levels are rejected rather than interpreted as expansion ratios <1.
- Buffering delay and nominal broadband Gammatone lag are removed; frequency-dependent filter phase remains.
  The output is not a sample-identical passthrough at a normal audiogram.
- Block size changes smearing resolution and maximum jitter; changing it changes
  the simulated model, not merely runtime efficiency. Large jitter is clamped.
- Float32 rounding and fixed absolute 1e-7 cutoffs can suppress very soft output.
- Not modeled: synaptopathy, tinnitus, or central hearing effects. A conductive part is simulated separately in
  front of the engine ([conductive.md](conductive.md)).
- Ported code retains LGPL-3.0 notices and a copy of the license in
  \`LICENSES/LGPL-3.0-only.txt\`; the application remains GPL-3.0-or-later.
`,ae=`# Model card: auditory filter broadening (spectral smearing)

| | |
|---|---|
| Id | a stage in front of every engine (toolbar toggle "Broadening"; Options ▸ Filter broadening and jitter settings); not an engine itself |
| Implementation | \`crates/hls-core/src/broadening.rs\`, smearing in \`crates/hls-core/src/msbg/smearing.rs\` |
| Reference implementation | the smearing is MSBG's (port of pyclarity \`smear3\` / \`make_smear_mat3\`, validated with MSBG); per-frequency factors have none |
| Status | **Port + own extension**. With the default setting ("Model's own") every engine runs exactly as validated |
| Sample rate | the app's 44.1 kHz (any 8–96 kHz) |

Citation keys refer to \`references/references.bib\`.

## What it simulates

Cochlear hearing loss widens the auditory filters, mainly through the loss of outer-hair-cell amplification: a
listener with a moderate loss has filters two to four times wider than normal. Spectral detail (formant peaks and
valleys, resolved harmonics) is then blurred, which degrades speech perception especially in noise, beyond what
loss of audibility explains.

Baer & Moore [\`baer1993spectral\`, \`baer1994spectral\`] simulated this for normal-hearing listeners by **spectral
smearing**: each short-time power spectrum is multiplied by a matrix chosen so that the excitation pattern of the
smeared sound, heard through normal auditory filters, matches the excitation pattern of the original sound through
broadened filters; the original phases are kept. MSBG includes this stage, with lower/upper broadening factors chosen
from a severity class of the audiogram. WHIS v3 and 3D Tune-In do not simulate filter broadening this way (3D
Tune-In has its own, simpler Gaussian magnitude smearing, off by default).

This stage applies the same smearing to the sound in front of any engine, after the hearing aid and the conductive
part, so that reduced frequency selectivity can be added to WHIS or 3D Tune-In, or set independently in MSBG.

## Settings

| Setting | Broadening |
|---|---|
| Model's own (default) | MSBG: its smearing by severity class; 3D Tune-In: its own smearing option; WHIS: none. Every engine runs as validated |
| None | no smearing, including MSBG's and 3D Tune-In's own |
| From the audiogram, per frequency | Moore & Glasberg (2004) [\`moore2004revised\`], see below |
| MSBG classes | MSBG's factors for the class of the mean 2–8 kHz loss, the same at every frequency: mild 1.6/1.1, moderate 2.4/1.6, severe 4.0/2.0 (lower/upper) |
| Custom factors | lower and upper factors (1–8), the same at every frequency |

The toolbar toggle shows whether the sound is smeared with the current model; clicking it switches between None and
the last setting that smears (by default per frequency from the audiogram).

With any setting other than "Model's own", MSBG's and 3D Tune-In's own smearing is switched off so that the sound is
not smeared twice. MSBG's gammatone filterbank (whose width also depends on its class) is unchanged.

### Per-frequency factors

From the cochlear part of the audiogram, as in the loss model of Moore & Glasberg (2004) used by the NAL-style
prescriptions (\`crates/hls-core/src/ha/nal/loudness.rs\`, function \`filter_broadening\`):

1. the audiometric threshold is corrected for the wider excitation of an impaired ear (their eqs. 19–22): 1.054·HL
   up to 65 dB HL, HL + 3.51 above;
2. 90 % of it is attributed to outer hair cells, at most the largest outer-hair-cell loss (about 57.6 dB at and above
   500 Hz, less below);
3. both slopes of the filter at that frequency are broadened by B = 10^{0.01·OHC} (below 500 Hz the exponent is
   reduced by the factor 1 − (f/1 kHz − 0.5)²/1.23).

| Loss (dB HL) | 20 | 30 | 40 | 50 | 60 | ≥ 70 |
|---|---|---|---|---|---|---|
| B at ≥ 500 Hz | 1.55 | 1.93 | 2.40 | 2.98 | 3.71 | 3.77 |

Each smearing filter (one per FFT bin, 86 Hz apart) gets the factor at its centre frequency; the audiogram is
interpolated linearly in frequency and held beyond its ends. The smearing matrix is then solved exactly as MSBG's,
with these per-row factors.

## Implementation

* Frames of 256 samples (5.8 ms at 44.1 kHz), hop 64, 512-point FFT, the window and overlap-add of \`smear3\`.
* The matrix is the minimum-norm least-squares solution of MSBG's \`make_smear_mat3\`, generalised to a factor per
  filter (\`audfilt_rows\`, \`make_smear_mat_rows\`). With constant factors the matrices are identical to MSBG's (unit
  test \`rows_with_constant_factors_reproduce_msbg_smearing\`).
* The stage is time-aligned (the 192-sample delay of \`smear3\` is removed), keeps the input length, and returns the
  input unchanged when no filter is broadened (normal hearing).
* Chunked processing: the frames are kept on the whole signal's 64-sample grid (the chunk is padded in front to the
  grid), so that chunks reproduce whole-signal processing.

## Validation

| Check | Result |
|---|---|
| Matrix with constant factors vs MSBG's | identical (bit-exact) |
| Factors vs Moore & Glasberg (2004) | 50 dB HL: 10^{0.01·0.9·52.7} exactly; capped near 3.77 |
| Spectral contrast of a 1 kHz harmonic complex (2–4.5 kHz, 256-sample spectra) | 39.8 dB → 28.7 dB (30 dB HL) → 26.0 dB (70 dB HL); MSBG's severe class gives 26.7 dB |
| Level change | −0.9 dB on white noise, −3.1 dB on the harmonic complex (MSBG's severe class: −2.6 dB), as in MSBG |
| Time alignment | a click stays within 2 samples of its position |
| MSBG, its classes as this stage vs its own smearing | 36 dB SNR (mild), 14–17 dB (severe); with smearing off instead: 17 and 2–6 dB. The stage runs before MSBG's outer/middle-ear filter instead of after it |
| Chunked vs whole-signal (\`validation/check_chunking.ts\`) | WHIS: identical; MSBG ≥ 174.6 dB SNR; 3D Tune-In at its own floor (≥ 158 dB with 0.5 s context) |

## Limitations

* Short-time spectra of 5.8 ms resolve formants but hardly harmonics below about 700 Hz spacing, so the smearing blurs
  formant structure more than individual harmonics; keeping the original phases restores part of the detail over
  longer times. This is inherent to Baer & Moore's method as used in MSBG.
* The matrix does not preserve the level exactly (see Validation), as in MSBG.
* The per-frequency rule is the loudness model's, derived for steady sounds; Moore & Glasberg give it for low levels
  (at high levels their lower slope flattens further, which smearing at a fixed width cannot follow).
* In front of WHIS and 3D Tune-In, the smearing is added to models whose own filterbanks keep their normal or
  level-dependent widths; the combination has not been checked perceptually.
`,oe=`# Model card: conductive part of a hearing loss

| | |
|---|---|
| Id | used by every engine when an audiogram has bone-conduction (BC) thresholds; not an engine itself |
| Implementation | \`crates/hls-core/src/conductive.rs\` (filter), \`web/src/lib/dsp/conductive.ts\` (air–bone gap) |
| Reference implementation | none: a linear filter, checked against its specification (see Validation) |
| Status | **Own implementation**. The validated engines run unchanged on the cochlear part of the loss |
| Sample rate | any from 8 kHz; the app runs at 44.1 kHz |

Citation keys refer to \`references/references.bib\`.

## What it simulates

A conductive hearing loss (outer or middle ear: e.g. otitis media with effusion, otosclerosis, a perforated eardrum)
attenuates sound before it reaches the cochlea. Bone conduction bypasses the outer and middle ear, so the BC
thresholds measure the cochlear (sensorineural) part of a loss, and the **air–bone gap** ABG = AC − BC measures the
conductive part. A conductive attenuation is linear: it does not depend on level and causes no loudness recruitment,
no loss of frequency selectivity and no change in discomfort levels other than the shift by the gap itself.

The simulation therefore splits each ear's audiogram:

1. **Conductive part**: a fixed linear-phase filter with gain −ABG(f) in front of the engine.
2. **Cochlear part**: the thresholds AC − ABG, given to the selected engine (MSBG, WHIS or 3D Tune-In) instead of the
   air-conduction thresholds.

A purely conductive loss (normal BC) is a normal cochlea behind an attenuator: speech is quieter but clear, and
turning it up restores it. A sensorineural loss with the same air-conduction audiogram stays distorted when turned
up. Mixed losses combine both.

### Air–bone gap

From the BC thresholds entered on the audiogram (\`bc\`, null where not measured; 250 Hz – 8 kHz in the editor):

* At a frequency with a BC threshold: ABG = max(0, AC − BC). A BC threshold worse than the AC threshold is common
  in practice (test–retest variability) and means no conductive part there; it is not flagged.
* Between measured frequencies the gap is interpolated linearly on a log-frequency axis; below the lowest and above
  the highest measured frequency it is held at that value (BC is often measured over a narrower range than AC).
  The audiogram shows the resulting sensorineural part as a dotted line, so this assumption is visible.
* The gap is capped at 80 dB (a complete conductive block causes about 60 dB).

Without BC thresholds the gap is zero, the filter is skipped (bit-identical output) and every engine behaves exactly
as validated.

### Filter

Frequency-sampling FIR (\`fir2\`, the design MSBG uses for its outer/middle-ear filter) on a grid of 24 points per
octave from 16 Hz, gains from the log-frequency interpolation above, constant to DC and Nyquist. Length 2·25 ms + 1
sample (2207 taps at 44.1 kHz), Kaiser window β = 6. Its 25 ms delay is removed, so the output stays aligned with
the input.

### Discomfort levels

Discomfort levels (UCL) entered on the audiogram are air-conduction values. The engines get UCL − ABG. Where no UCL
is set, the cochlear default (105 dB HL) applies, i.e. an air-conduction UCL of 105 dB HL + ABG. The hearing aid's
UCL-based output limit uses the air-conduction values.

### Hearing aid

Placed before the conductive filter (aid → ear canal → middle ear → cochlea). The aid sees the air-conduction
audiogram; how it is fitted to a gap is a setting (\`airBoneGap\`, see the hearing-aid card), after
[\`johnson2013prescriptive\`]:

| Setting | Prescription computed from | Extra linear gain |
|---|---|---|
| \`bc75\` (default) | cochlear part (AC − ABG) | 75 % of ABG (NAL, since NAL-NL1) |
| \`ac25\` | air conduction | 25 % of ABG (Lybarger) |
| \`ac\` | air conduction | none |

The extra gain is a filter of the same design applied after the prescription and before the output limiter, so
CAMFIT's compression follows the sensorineural loss and the gap is compensated linearly.

## Derived values

The derived-values table adds, per ear with BC thresholds: the PTA (0.5–4 kHz) of the sensorineural part, the mean
air–bone gap over the same frequencies, and a type label (rule of thumb): sensorineural if the mean gap is below
10 dB, otherwise conductive if the sensorineural PTA is below 20 dB HL (WHO 2021 normal limit), otherwise mixed.
MSBG's severity class, WHIS's active/passive split and the engines' range checks use the sensorineural part.

## Validation

Rust unit tests (\`crates/hls-core/src/conductive.rs\`, \`ha/mod.rs\`):

* tone attenuation within 1 dB of the gap at 250 Hz – 8 kHz for a flat 30 dB gap, a low-frequency (stiffness) gap of
  40 → 10 dB, and a steep gap rising 0 → 60 dB between 1 and 4 kHz;
* interpolation between and holding beyond the measured frequencies (within 0.5 dB);
* zero gap: output identical to the input; time alignment of an impulse;
* the hearing aid's extra gain adds within 1 dB to the prescription for tones, adds exactly to the displayed
  insertion gains, and stays below the output limiter.

Web tests (\`web/src/tests/features.test.ts\`): the gap rule, the cochlear audiogram and UCLs, share links, MSBG on a
purely conductive loss identical to MSBG with normal hearing on the attenuated input, and the three fitting rules.
Chunked processing (\`validation/check_chunking.ts\`, entries \`conductive+*\`, a mixed loss with a 20 dB gap up to
4 kHz): with the app's contexts, MSBG ≥ 178 dB, 3D Tune-In ≥ 163 dB (171–172 dB without the gap) and WHIS ≥ 315 dB
SNR against whole-signal processing; the filter's 25 ms half-length is well inside every context.

## Limitations

* The gap is a single attenuation per frequency. Not simulated: the phase changes of a middle-ear disorder,
  bone-conducted sound (own voice, occlusion), and differences between ears through cross-hearing.
* BC thresholds are taken at face value. The Carhart notch of otosclerosis (BC worse around 2 kHz for mechanical
  reasons) makes the sensorineural part look larger than it is; no correction is applied.
* The extrapolation beyond the measured BC frequencies is an assumption.
* Not validated perceptually.
`,se=`# Model card: hearing-aid simulation

| | |
|---|---|
| Id | \`aid\` option of every engine (\`EngineOptions.aid\`); not an engine itself |
| Implementation | \`crates/hls-core/src/ha/\` (Rust → WebAssembly) |
| Reference implementation | pyclarity 0.9.0 (MIT): \`clarity.enhancer.nalr\`, \`clarity.enhancer.gha\` (gain rule), \`clarity.enhancer.multiband_compressor.crossover\` [\`pyclarity\`, \`graetzer2021clarity\`] |
| Status | **Validated port** for NAL-R, the CAMFIT gain tables and the crossover. The compressor's dynamics are an own implementation without a reference (see Validation) |
| Sample rate | any from 8 kHz (NAL-R needs > 12 kHz, CAMFIT > 17.5 kHz); the app runs at 44.1 kHz |

Citation keys refer to \`references/references.bib\`.

## What it simulates

A hearing aid fitted to each ear's audiogram with a published prescription. Its output is passed to the selected
hearing-loss engine with the same audiogram, so the listener hears the aided sound through the simulated loss. That
is the pipeline of the Clarity challenges, where the enhanced signal is passed to MSBG.

Gains are **real-ear insertion gains**, i.e. relative to the open ear. The engines take the free-field sound at the
listener as input, so the aided input is the aid applied to that free-field sound. Ear-mould acoustics, venting,
the receiver and the microphones are not modelled.

### NAL-R (linear)

\`G(f) = X + 0.31·HL(f) + k(f)\` at 250, 500, 1000, 2000, 4000 and 6000 Hz with \`X = 0.05·(HL₅₀₀ + HL₁ₖ + HL₂ₖ)\`
(\`X = 9 + 0.116·(sum − 180)\` above a 180 dB sum) and \`k = −17, −8, 1, −1, −2, −2\` dB; negative gains become 0
[\`byrne1986national\`]. The audiogram is interpolated on a log-frequency axis and held flat beyond its ends. The gain
curve, linear in Hz between the six points, is realised as a 220-tap linear-phase FIR (\`fir2\` frequency sampling,
Hamming window), as in the Clarity baselines. Without any loss the filter is a pure delay. The app removes the FIR's
110-sample delay.

The 220-tap (5 ms) filter smooths the prescription: at a 50 dB HL flat loss it gives 23.3 dB instead of 24 dB at the
1 kHz peak, and it cannot follow the steep gain change below 500 Hz.

### CAMFIT (multichannel compression)

The compressive Cambridge rule [\`moore1999use\`], with the band layout and settings of the hearing aid of the first
Clarity enhancement challenge (pyclarity \`GHAHearingAid\`, \`get_gaintable\`, \`format_gaintable\`):

1. Nine bands, centres 177, 297, 500, 841, 1414, 2378, 4000, 6727 and 11314 Hz, edges 229, 385, 648, 1091, 1834,
   3084, 5187 and 8724 Hz.
2. Per band, the long-term level of 65 dB SPL speech \`L_mid\` comes from the international long-term average speech
   spectrum [\`byrne1994international\`] (one-third-octave intensities summed by overlap, −5 dB from 70 to 65 dB).
3. The softest speech that should be audible is \`L_min = L_mid − 38\` dB; it gets the gain
   \`G_min = HL + T_ff − L_min\` that puts it at threshold (\`T_ff\`: free-field threshold, ISO 226:2003 [\`iso226_2003\`]).
4. 65 dB speech gets CAMFIT's linear insertion gain \`IG = max(0, 0.48·HL + intercept(f))\` [\`moore1998use\`]. The
   compression ratio is \`CR = 38 / max(13, 38 + IG − G_min)\`, at least 1, so at most 2.9.
5. Gain at input level \`L\`: \`G(L) = G_min + (L − L_min)·(1/CR − 1)\`, never negative, and reduced so that \`L + G\`
   stays at or below 100 dB SPL. Normal hearing (an audiogram that is 0 dB HL everywhere) gets no gain.
6. Below each band's compression threshold (38, 38, 36, 37, 32, 26, 23, 22 and 8 dB SPL) the gain stays at its value
   at the threshold (pyclarity's noise gate with slope 0).
7. The top band (above 8.7 kHz) gets no gain, as in the Clarity hearing aid's configuration.

The result is a gain table per band on −10…110 dB SPL in 1 dB steps.

### Filterbank and compressor

* **Crossover.** Fourth-order Linkwitz–Riley sections [\`linkwitz1976active\`] at the eight band edges, arranged as
  D'Appolito's all-pass tree [\`dappolito1984active\`]: band k = LP_k · ∏_{m<k} HP_m · ∏_{m>k} AP_m. The bands sum to an
  all-pass, so with equal gains the aid has a flat magnitude response (and a frequency-dependent delay of a few ms at
  low frequencies, as a real multiband aid). pyclarity builds AP_m = LP_m + HP_m as an 8th-order polynomial; we use
  the identical second-order all-pass \`Ã(z)/A(z)\` (A: the Butterworth denominator), which is numerically better
  conditioned.
* **Level detector**, per band: the band's power is smoothed with a 5 ms one-pole filter, and its level in dB SPL
  follows that power with an attack time constant (default 20 ms) when it rises and a release time constant
  (default 100 ms) when it falls. The defaults are the \`tau_attack\` / \`tau_decay\` of the Clarity hearing aid's openMHA
  configuration. For a steady sound the detector reads the band's RMS level, so the static input/output function is
  the gain table.
* **Gain**: the band is multiplied by the table gain at the detector's level (linear interpolation, clamped to the
  table), and the bands are summed.

The Clarity hearing aid ran in openMHA (FFT filterbank and the \`dc\` plugin). The crossover and detector here are an
independent design, not a port of openMHA, so the dynamics are not those of that aid.

### NAL-NL2- and NAL-NL3-style (approximations)

NAL-NL2 and NAL-NL3 are licensed by the National Acoustic Laboratories; neither the formulas nor
target tables are published, so they cannot be ported. The \`nal-nl2\` and \`nal-nl3\` prescriptions
(\`crates/hls-core/src/ha/nal/\`) are **re-derivations from NAL's published method** and are named
"NAL-NL2-style" and "NAL-NL3-style" accordingly. They are not NAL's targets.

**Method** (Keidser et al. 2011 [\`keidser2011nal\`]; Kitterick et al. 2026 [\`kitterick2026nal\`]). For each
speech level (overall ILTASS level 40, 50, … 100 dB SPL), the insertion gains at 11 frequencies (125 Hz –
8 kHz, interpolated on a log-frequency axis and falling to 0 dB at 50 Hz and 16 kHz, NAL-NL2's anchors)
maximise predicted intelligibility subject to the aided speech being no louder for the impaired ear than the
unaided speech is for a normal ear:

* **Intelligibility**: ANSI S3.5-1997 one-third-octave SII (\`sii.rs\`) with the ILTASS as speech, in which
  audibility is replaced by NAL's effective audibility. Johnson & Dillon (2011) [\`johnson2011comparison\`] print
  a frequency-independent NAL-NL2 formula; NAL-NL1's frequency-dependent model (Ching et al. 2001
  [\`ching2001maximizing\`], eqs. 4–7, Table 1) reproduces the published NAL-NL2 targets better (5.0 vs 6.8 dB
  RMS) and is used. Both are implemented.
* **Loudness**: Moore, Glasberg & Baer (1997) [\`moore1997model\`] with the extension to cochlear hearing loss of
  Moore & Glasberg (2004) [\`moore2004revised\`] (\`loudness.rs\`), diffuse-field presentation, outer-hair-cell share
  0.9 of the loss (as Johnson & Dillon used). Two inputs that the papers give only as figures are
  reconstructed: the threshold excitation below 500 Hz from the four values in the caption of Fig. 8 of the
  1997 paper, and the middle-ear transfer from the model's own calibration rule (a tone at the ISO 389-7
  threshold produces the threshold excitation). The level that sets each auditory filter's lower slope is the
  input level per ERB around the *component* (Glasberg & Moore 1990), which is needed for the model's
  16-fold loudness increase from 40 to 80 dB SPL.
* **Optimiser** (\`prescribe.rs\`): projected gradient ascent on the 11 gains, starting from the best of
  "gain = threshold − c" (c = 0…60 dB), the loudness constraint enforced by a uniform reduction. The
  objective is SII − 0.2 · (aided loudness / normal loudness) − 0.001 · (mean gain in dB): NAL's procedure adds
  no gain that does not improve intelligibility, and without these two small terms gain that buys nothing
  (where effective audibility is flat) is left wherever the search started. The two constants are not
  published; they were chosen by comparison with the published NAL-NL2 targets (see Validation).
* **Rules** applied to the optimised gains: no compression below 50 dB SPL speech; gain not rising with level;
  NAL-NL2's limit on low-frequency gain (it may rise below 500 Hz by at most half the threshold rise);
  compression between 50 and 80 dB SPL at most 3:1 (NAL-NL2 limits fast compression "generally to 3:1 or
  lower"; its frequency- and loss-dependent limits are only published as a figure).
* **Adjustments** (Keidser et al. 2012 [\`keidser2012nal\`]): ±1 dB for male/female; experience (Fig. 4): new users
  lose up to 7 dB (from a four-frequency average of 40 to 60 dB HL), experienced users gain up to 3 dB (50 to
  70 dB HL); bilateral correction (Eq. 1): a bilateral fitting gets max(0, G − T) with T half of 2–6 dB rising
  with input level, shrinking with interaural asymmetry. The app always fits both ears.

**NAL-NL3-style** adds the NAL-NL3 Prescription's constraints (Kitterick et al. 2026): between 4 and 8 kHz the
gain may rise by at most half the threshold rise and may not exceed the NL2-style gain; for reverse-slope
audiograms (thresholds ≥ 20 dB better at 4 kHz than at 250 Hz) a quarter-gain limit at 125 and 250 Hz and gain
falling from 1 to 4 kHz; compression at most 2.5:1, enforced on the final targets by lowering only gains below
80 dB SPL. NAL-NL3's deep-network targets, its modules (minimal hearing loss, comfort in noise), its
treatment of bone conduction (PCHIP interpolation) and its MPO procedure are not reproduced.

The targets drive the same nine-band compressor as CAMFIT: each band's gain table maps the band input level
to the overall speech level (band level − band level of 65 dB ILTASS + 65) and takes the target gain at the
band centre. Prescribing one ear takes about 1.5 s (NL3-style about 3 s) in the browser; the app prescribes
both ears in parallel and caches the result.

### Conductive and mixed losses

With bone-conduction thresholds (see [conductive.md](conductive.md)), the \`airBoneGap\` setting chooses how the aid is
fitted to the air–bone gap [\`johnson2013prescriptive\`]: by default (\`bc75\`, NAL since NAL-NL1) the prescription is
computed from the sensorineural part (AC − ABG) and 75 % of the gap is added as linear gain; \`ac25\` uses the
air-conduction thresholds plus 25 % of the gap (Lybarger); \`ac\` uses the air-conduction thresholds unchanged. The
extra gain (\`HearingAidConfig::extra_gain\`) is a linear-phase FIR of the conductive filter's design, applied after the
prescription and before the output limiter, with its delay removed; it is included in the displayed insertion gains.
NAL-R and CAMFIT as ported have no rule of their own for a conductive part. With the UCL-based output limit, ears
without measured UCLs get 105 dB HL + ABG.

### Volume

\`gainOffsetDb\` (±20 dB in the app) adds a broadband gain: to the NAL-R filter, or to every gain-table entry.

### Output limiter (maximum power output)

After either prescription, an optional wideband limiter (\`limiter.rs\`) holds the output below a maximum output
curve MPO(f):

* **Fixed** (default): 100 dB SPL at every frequency (the level CAMFIT's tables are capped at in the Clarity aid).
* **Discomfort levels**: the listener's UCL at each audiogram frequency converted to dB SPL with the free-field
  threshold (UCL + T_ff(f), the conversion CAMFIT uses for thresholds), interpolated on a log-frequency axis and
  held flat beyond the audiogram. Where no UCLs are set, 105 dB HL (the app's normal-hearing default).
* **None**: the aid is not limited (needed to reproduce pyclarity's NAL-R output).

The level detector's input is weighted by −MPO(f) with a 257-tap linear-phase FIR (at 44.1 kHz) whose delay is
compensated (offline look-ahead), so a tone at frequency f is held at MPO(f) and a broadband sound is limited when
its weighted power sum reaches the curve. Detector: the 5 ms power smoothing of the compressor, then attack 1 ms /
release 50 ms on the level in dB (own choice, typical of output-limiting compression); the gain reduction is the
whole excess (infinite ratio).

Why not one limiter per crossover band: with Linkwitz–Riley skirts of 24 dB/octave, a loud tone exceeds the limit in
several bands at once, each band is clamped to the limit, and their in-phase sum lands ~10 dB above it (measured:
94–99 dB SPL for an 85 dB limit, 500 Hz–4 kHz). The weighted wideband detector does not have that problem.

### Aided speech on the audiogram

With a hearing aid, the audiogram also shows the one-third-octave band levels of the aid's output for the
current stimulus (before the hearing loss), converted to dB HL like the stimulus display (\`web/src/lib/audio/bands.ts\`).
This is the usual "speech mapping" view of a fitting: where the aided band levels lie above the thresholds, the aid
makes that part of the sound audible. It is computed at the actual presentation level, since a compressor's output
does not shift by the same amount as its input.

## Levels and calibration

Same convention as the engines: RMS 1.0 ≙ \`equiv_0db_spl\` (120 dB SPL in the app). Band levels in the CAMFIT
detector are in dB SPL on that scale. The aid needs correct absolute levels just like the engines: a compressor
gives less gain to loud input.

## Validation

\`validation/compare_ha.py\` runs the shipped wasm (via \`validation/run_ha_wasm.ts\`) against pyclarity 0.9.0 for ten
audiograms: normal, Clarity mild/moderate/moderately severe, flat 40 dB, steeply sloping, flat 75 dB (the
> 180 dB NAL-R branch), negative low-frequency thresholds, a single-frequency loss, and a 125 Hz – 16 kHz audiogram.
Results in \`validation/results/ha-vs-pyclarity.json\`:

| Component | Reference | Result |
|---|---|---|
| NAL-R FIR coefficients | \`NALR(220, 44100).build\` | ≥ 148.6 dB SNR (exact for normal hearing) |
| NAL-R output, 0.8 s speech-like signal | \`np.convolve\`, delay removed | ≥ 151.3 dB SNR |
| CAMFIT gain table, Clarity HA settings | \`gainrule_camfit_compr\` + \`multifit_apply_noisegate\` | max \\|Δ\\| 3.8·10⁻⁶ dB |
| CAMFIT gain table, pyclarity defaults (gate 45 dB, slope 1) | same | max \\|Δ\\| 1.9·10⁻⁶ dB |
| CAMFIT gain table as used (top band zeroed) | \`get_gaintable\` + \`format_gaintable\` | max \\|Δ\\| 3.3·10⁻⁶ dB |
| Crossover, 9 bands | exact SOS reference of the same structure, AP = LP + HP in parallel | ≥ 152 dB SNR per band |
| Crossover, 9 bands | pyclarity \`Crossover\` (information only) | 76, 124, then ≥ 146 dB SNR |

These are float32 output precision. The pyclarity crossover deviates from the exact filter in its two lowest bands
because of its 8th-order polynomial all-passes (checked separately: evaluating pyclarity's own phase-compensation
polynomials as second-order sections gives 64 dB in band 0), so pass/fail uses the exact reference.

Behavioural checks (Rust unit tests in \`crates/hls-core/src/ha/\`):

* the compressor's static input/output function equals its gain table within 0.15 dB for tones from 250 Hz to
  4 kHz and 40–90 dB SPL;
* attack is faster than release (55 → 90 → 55 dB SPL steps);
* the crossover sums to an all-pass (unit energy and unit magnitude);
* normal hearing is transparent (0 dB gain), NAL-R tone gains are within 1 dB of the prescription at 1 and 2 kHz;
* the output limiter holds tones from 125 Hz to 6 kHz within 0.6 dB of a flat limit and within 1 dB of a sloping
  one, leaves sounds 6 dB below the limit untouched, and holds 80 and 95 dB SPL tones (500 Hz–4 kHz) through both
  prescriptions within 0.6 dB of an 85 dB SPL limit.

Chunked processing (\`validation/check_chunking.ts\`, entries \`aid-*\`): NAL-R needs no extra context (≥ 180 dB). The
CAMFIT detectors need about 0.5 s: 86–116 dB SNR against whole-signal processing with 0.5 s context, 25–48 dB with
0.1 s. With the output limiter engaged (NAL-R, 80 dB SPL limit), 0.25 s of context gives ≥ 180 dB and 0.1 s 69 dB.
The pool therefore widens the chunk context to 0.5 s for CAMFIT and to 0.25 s when a limiter is on.

Not validated: the dynamic behaviour against a reference hearing aid, and the perceptual result of the aided
simulation.

### NAL-style prescriptions

\`validation/check_nal.ts\` (results in \`validation/results/nal-style.json\`), through the shipped wasm:

| Check | Reference | Result |
|---|---|---|
| Loudness of a 1 kHz tone at 40 dB SPL, binaural | 1 sone (the model's calibration) | 1.006 sone |
| Loudness increase from 40 to 80 dB SPL | ×16 (the model's calibration) | ×16.01 |
| Binaural thresholds 125 Hz – 8 kHz (0.003 sone) | ISO 389-7 | within 0.4 dB |
| 65 dB SPL ILTASS, diffuse field, binaural | 18.6 sones, Moore & Glasberg's program (Johnson & Dillon 2011) | 20.1 sones |
| 1 kHz threshold shift, flat 60 dB HL loss | 60 dB | 60.1 dB |
| SII, 400 random cases (ANSI and NAL-NL2 formula) | procedure of the CRAN package \`SII\` 1.3.0 | max \\|Δ\\| 3·10⁻⁸ |
| NL2-style gains at 65 dB SPL, audiograms A-1…A-5 | NAL-NL2 targets of Johnson & Dillon (2011), Figs. 3–4 (read from the figures, ±2 dB) | 2.4–7.3 dB RMS per audiogram, 5.0 dB overall, mean +0.9 dB |
| NL2-style compression ratios (500 Hz, 2 kHz) | Johnson & Dillon (2011) Table 1 | RMS 0.9; ours higher for the flat and reverse-slope losses (3.1–3.4 vs 1.4–2.7) |
| NL3-style design rules | Kitterick et al. (2026) | all hold |

The NL2-style comparison is not an independent test: the loudness-cost and gain-cost constants and the choice
of the Ching et al. (2001) audibility model were made with the same five audiograms. The largest differences
are too much gain at 2–3 kHz and 8 kHz for the steeply sloping loss A-4 (10–18 dB). No published NAL-NL3
targets were available for comparison.

## Provenance and licences

* NAL-R and the crossover: ports of pyclarity (MIT).
* CAMFIT gain rule: port of pyclarity (MIT). pyclarity's docstrings describe these functions as translations of
  openMHA's MATLAB gain rules (openMHA is AGPL-3.0). The rule itself is published [\`moore1998use\`, \`moore1999use\`];
  the port follows pyclarity's code so that the tables match it exactly. Whether that makes the code a derivative of
  openMHA has not been assessed.
* Level detector, gain-table compressor and output limiter: own implementation.
* NAL-style prescriptions: own implementation from the published descriptions (no NAL code, software or target
  tables). The ANSI S3.5 tables are standard data (as distributed in the CRAN package \`SII\`, GPL-3); the
  Ching et al. (2001) parameters are their Table 1.

## Limitations

* Amplification only: no directional microphones, noise reduction, feedback, receiver response or venting.
* NAL-R is linear up to the output limit.
* The output limiter is not validated against a reference device; its time constants are typical values.
* CAMFIT's prescription is for speech; the compressor's dynamics are not validated against a reference aid.
* Prescriptions are first fits. Real fittings are fine-tuned to the listener.
* The NAL-style prescriptions are approximations of NAL-NL2 and NAL-NL3, not those prescriptions: 5 dB RMS
  from published NAL-NL2 targets and more compression; NL3-style is unvalidated against NAL-NL3 targets;
  tonal-language, paediatric and unilateral options and NAL's MPO procedure are not implemented.
* The aid is fitted to the same audiogram the engine simulates; there is no separate "fitting audiogram".
* The air–bone-gap corrections are clinical conventions; the 75 % rule's perceptual benefit is not tested here.
`,ce=`# Model card: temporal jitter (degraded temporal fine structure)

| | |
|---|---|
| Id | a stage in front of every engine (toolbar toggle "Jitter"; Options ▸ Filter broadening and jitter settings); not an engine itself |
| Implementation | \`crates/hls-core/src/jitter.rs\`; jitter source from \`crates/hls-core/src/tdti/temporal.rs\` |
| Reference implementation | none for the stage as a whole (own implementation after Pichora-Fuller et al. 2007); the jitter source is the 3D Tune-In toolkit's |
| Status | **Own implementation**. Off by default: every engine runs as validated |
| Sample rate | 44.1 kHz |

Citation keys refer to \`references/references.bib\`.

## What it simulates

Auditory nerve fibres phase-lock to the temporal fine structure (TFS) of sounds below a few kHz. Ageing and some
hearing losses reduce this synchrony, which degrades pitch, binaural (interaural time) cues and speech perception in
noise, often with a near-normal audiogram. Pichora-Fuller et al. [\`pichorafuller2007temporal\`] simulated this loss of
synchrony in young listeners by **jittering** speech in time: the low frequencies (0–1.2 kHz) are read with a randomly
varying delay d(t), band-limited noise: y(t) = x(t − d(t)).

## Processing

1. **Split**: linear-phase low-pass at 1.2 kHz (Kaiser-windowed sinc, 535 taps, β = 6: transition about 300 Hz, stopband
   about 60 dB). The high band is the complement.
2. **Jitter**: the low band is read at the fractional positions n − d(n) with cubic Lagrange interpolation. d(n) is
   Gaussian noise low-passed at 500 Hz (biquad, Q 0.707), the jitter source of the 3D Tune-In Toolkit's
   \`TemporalDistortionSimulator\`, limited to ±128 samples (2.9 ms) as there.
3. **Recombination**: the jittered low band is low-passed again, removing the jitter's spectral splatter above the
   split, and added to the high band: y = x − LP(LP(x)) + LP(J(LP(x))). Without jitter, y = x.

The amount is the **RMS of the delay** d(n) in ms, the quantity Pichora-Fuller et al. report (the source deviation is
derived from it through the 500 Hz low-pass's noise gain). The two ears get independent jitter (one seed per ear), which
also degrades interaural timing. The noise is a function of the absolute sample position, so that chunks processed
separately reproduce whole-signal processing. With 3D Tune-In, its own jitter setting is replaced while this stage is on.

### Why not the toolkit's stage

The first version ran the 3D Tune-In stage itself: fourth-order Butterworth split at 1.6 kHz (applied twice),
integer-sample offsets. Its jittered and unjittered bands overlap over about an octave above the split, and their sum
fluctuates there at the jitter's rate: a rough, "raspy" sound in the 1.4–2.8 kHz octave, where speech is most audible.
Error-to-speech ratio by octave on a speech recording (\`speech-1\`, 6 s; error = output − output without jitter):

| Octave (Hz) | 250 | 500 | 1000 | 2000 | 4000 | 8000 |
|---|---|---|---|---|---|---|
| Toolkit stage, 0.25 ms | −10.1 | −5.5 | +2.8 | **−3.9** | −35.9 | −59.4 |
| This stage, 0.25 ms | −9.3 | −5.7 | +2.6 | **−55.8** | −59.3 | −64.3 |
| This stage, 0.1 ms | −16.7 | −13.3 | −4.4 | −67.4 | −70.0 | −74.9 |
| This stage, 0.05 ms | −22.7 | −19.3 | −10.3 | −74.8 | −77.1 | −81.9 |

Below the split both stages jitter the same; above it, this stage leaves the sound unchanged.

## Amount

Not derived from the audiogram: TFS sensitivity varies widely among listeners with the same thresholds. An early
report of Pichora-Fuller et al.'s work (Acoustical Society of America lay-language paper, 1999,
<https://acoustics.org/pressroom/httpdocs/137th/fuller.html>) describes word recognition close to normal with
0.05 ms RMS jitter (500 Hz bandwidth) and about halved with 0.25 ms; the published paper's conditions have not been
checked here. A delay of fixed RMS is a phase jitter growing with frequency (2πf·d), so it is strongest just below the
split. The toggle's default is 0.1 ms; the setting accepts 0–2 ms.

## Validation

| Check | Result |
|---|---|
| Delay RMS vs setting (0.05, 0.25, 1 ms; 10 s) | within 3 % |
| Gaussian source (200 000 values) | mean < 0.01, variance within 2 % of 1 |
| No jitter | output = input within 10⁻⁶ |
| Tones at 1.6, 2 and 5 kHz, 0.25 ms | correlation with the input > 0.9999 |
| 400 Hz tone, 0.25 ms | correlation 0.75–0.9 (theory for phase jitter: exp(−(2π·400·0.25 ms)²/2) ≈ 0.82), less at 0.5 ms; level within 0.5 dB |
| Speech, by octave | table above |
| Chunked vs whole-signal (\`validation/check_chunking.ts\`, Rust unit test) | WHIS: identical; MSBG ≥ 175 dB SNR (0.1 s context); 3D Tune-In ≥ 153 dB with its 0.5 s context |

## Limitations

* A jitter of the waveform is a stand-in for loss of neural synchrony; it also changes the spectrum below the split
  (spectral splatter around low-frequency components), which Pichora-Fuller et al. controlled for with spectrally
  matched smearing.
* Fixed split (1.2 kHz) and jitter bandwidth (500 Hz).
* No link to the audiogram or age; the amount is a free parameter.
`,le=`# Model card: MSBG hearing-loss simulator

| | |
|---|---|
| Engine id | \`msbg\` |
| Implementation | \`crates/hls-core/src/msbg/\` (Rust → WebAssembly) |
| Reference implementation | pyclarity 0.9.0, \`clarity.evaluator.msbg\` (MIT), from the Clarity challenges [\`graetzer2021clarity\`, \`pyclarity\`] |
| Status | **Validated port**: numerically equivalent to the reference (see Validation) |
| Sample rate | 44.1 kHz only. The browser resamples input when it decodes it. |

Citation keys refer to \`references/references.bib\`.

## What it simulates

The model was developed by Moore, Stone, Baer and Glasberg at Cambridge. It simulates three consequences of
cochlear (outer-hair-cell) damage for a normal-hearing listener:

1. **Threshold elevation and loudness recruitment** [\`moore1993simulation\`, \`nejime1997simulation\`]. The signal is
   split into gammatone channels. In each channel the envelope is expanded by the ratio
   \`E = C / (C − HL(cf))\`, where \`C\` = 105 dB SPL is the loudness catch-up level and \`HL(cf)\` is the audiogram
   interpolated linearly in Hz and held flat beyond its ends. The gain is \`(env / env_max)^(E − 1)\`, where
   \`env_max\` is the envelope of a \`C\` dB SPL signal. Sounds near \`C\` therefore keep their normal level, and soft
   sounds are attenuated by up to HL dB.
2. **Reduced frequency selectivity** [\`baer1993spectral\`, \`baer1994spectral\`]. Each 256-sample STFT frame (64-sample
   hop, 512-point FFT) has its power spectrum multiplied by a smearing matrix. That matrix maps the excitation of
   normal roex auditory filters [\`glasberg1990derivation\`] onto the excitation of filters broadened by
   (lower, upper) factors. The factors depend on the severity class:

   | Severity (mean HL 2–8 kHz) | Smearing (lower, upper) | Gammatone bank |
   |---|---|---|
   | NOTHING (≤ 15 dB) | none | 36 ch, broadening 1.5, spacing 1.1 ERB |
   | MILD (15–35 dB] | 1.6, 1.1 | 36 ch, broadening 1.5, spacing 1.1 ERB |
   | MODERATE (35–56 dB] | 2.4, 1.6 | 28 ch, broadening 2.0, spacing 1.5 ERB |
   | SEVERE (> 56 dB) | 4.0, 2.0 | 19 ch, broadening 3.0, spacing 2.3 ERB |

   In the app this smearing can be switched off or replaced by the separate filter-broadening stage, for example
   with factors per frequency from the audiogram ([broadening.md](broadening.md)); the gammatone bank is unchanged.
   The default ("Model's own") is the pyclarity behaviour.

3. **Outer and middle ear**. A linear-phase FIR (1015 taps) maps the sound field to the cochlea and is inverted at
   the output. The field is free-field frontal [\`shaw1974transformation\`], diffuse-field, or the ITU ear reference
   point [\`itup58\`]. A final 133-tap low-pass at 18 kHz removes processing noise.

The gammatone filter coefficients are the original Cambridge designs (2013), copied verbatim from pyclarity into
\`tables.rs\` by \`validation/gen_msbg_tables.py\`. The same script precomputes the envelope smoothing filters with
the scipy call the reference uses (2nd-order elliptic, 0.25 dB ripple, 35 dB stop band, cut-off
0.75 · min(100 Hz, ERBn(cf))).

## Levels and calibration

Inside the model, a signal with RMS 1.0 corresponds to \`equiv_0db_spl\` = 120 dB SPL. That is the pyclarity
default: 100 dB plus a 20 dB "artificially high reference". The app:

1. measures the active speech level of the input with the MSBG \`measure_rms\` procedure (10 ms frames, frames
   within 12 dB of the overall RMS);
2. scales the input so that its active level equals the chosen presentation level (default 62.35 dB SPL,
   "normal" vocal effort, ANSI S3.5-1997);
3. after processing, multiplies both tracks by \`10^((120 − F)/20)\`, where \`F\` is the playback calibration: the
   dB SPL produced by an RMS-1.0 signal at the user's volume setting.

If \`F\` is not measured, the app assumes 100 dB SPL and flags the result as uncalibrated.

## Validation

\`validation/compare_msbg.py\` runs pyclarity's \`Ear.process\` and our \`hls_msbg_process_clarity_compat\` (the
shipped \`.wasm\`, run through Node). The cases are 3 signals (harmonic complex with AM and gaps, pink noise,
tone pips) × 4 audiograms (normal and Clarity mild / moderate / moderate-severe, which covers all 4 severity
classes) × 3 source positions, 36 cases in total.

**Result: worst-case error 121.6 dB below the reference signal, typically 140–150 dB** (results in
\`validation/results/msbg-vs-pyclarity.json\`). This is the precision floor of 32-bit float output, so the port is
numerically equivalent to the reference.

One difference from the reference: the smearing matrix is solved by Householder QR (minimum-norm least
squares), where numpy uses an SVD. The system's condition number is about 3 × 10⁵. The two solutions differ by
about 1e-8 relative, which is far below the audio precision.

\`validation/check_alignment.ts\` checks that the calibrated app path (\`Ear::process\`) is time-aligned with its
input (cross-correlation lag of 0 to 4 samples) and preserves level when hearing is normal.

## Extension: per-frequency discomfort levels (not in pyclarity)

The catch-up level \`C\` = 105 dB is in effect an assumed uncomfortable loudness level (UCL): a channel reaches
normal loudness there. Real listeners differ. Normal-hearing adults have loudness discomfort levels around
100 dB HL with a large spread [\`sherlock2005estimates\`], and impaired ears can have much less range between
threshold and discomfort. The app therefore accepts an optional UCL per audiogram frequency and ear.

The UCL is interpolated to each channel like the audiogram. The channel's range [HL, UCL] is then mapped
linearly in dB onto the normal range [0, C]. This is the threshold-to-discomfort mapping that DSL[i/o] uses in
the opposite direction to fit hearing aids [\`cornelisse1995input\`]:

- \`E = C / (UCL − HL)\`;
- the envelope ceiling \`env_max\` is the envelope of a UCL dB SPL signal (instead of \`C\`);
- the channel output is multiplied by \`10^((C − UCL)/20)\`, so that a sound at the UCL comes out at \`C\`.

With UCL = C everywhere this is exactly the pyclarity law. The engine test \`default_ucl_is_pyclarity\` checks that
the output is bit-identical, and \`validation/compare_msbg.py\` still passes (worst case 121.9 dB). The UCL is
clamped to \`[HL + 5, HL + C]\` per channel. The lower bound keeps a 5 dB minimum range. The upper bound keeps
E ≥ 1: the simulation never expands a sound to above-normal loudness below the UCL. Above the UCL, a lower UCL
makes sounds louder than normal (by \`C − UCL\`), as it should for an ear that finds them uncomfortable. Like
pyclarity, the law compares channel envelope levels in dB SPL with hearing levels in dB HL without a
threshold-curve conversion.

Overall level of the simulated output for a speech-like signal through the Bisgaard N3 audiogram, relative to
the normal-hearing output at the same input level (dB):

| Input (dB SPL) | UCL 105 (default) | UCL 100 | UCL 95 | UCL 90 |
|---|---|---|---|---|
| 50 | −34.6 | −34.4 | −34.2 | −33.9 |
| 70 | −24.5 | −22.0 | −19.1 | −15.6 |
| 90 | −14.4 | −9.6 | −3.9 | +2.8 |
| 110 | −4.2 | +3.0 | +10.0 | +15.5 |

The UCL only changes MSBG. WHIS derives loudness growth from its compression-health parameter α, and the
3D Tune-In law has a fixed growth. Chunked processing with UCLs stays within float rounding of whole-signal
processing (≥ 175 dB, \`validation/check_chunking.ts msbg-ucl\`).

## Known quirks of the reference (reproduced deliberately)

- **Smearing latency.** After the first frame, the reference \`smear3\` places newly read input at the end of the
  frame buffer starting from sample 64 instead of 256. The result is a constant 192-sample (4.35 ms) delay and a
  repeat of about 4 ms of input at the very start. \`Ear::latency()\` includes this delay and the app removes it,
  so the original and simulated tracks stay aligned.
- **Smearing flush.** The final overlap-add flush reads one stale frame slot. This affects only the padded tail
  beyond the input length.
- **Level normalisation in \`Ear.process\`.** pyclarity rescales the signal so that its *active* RMS equals its
  former *overall* RMS, using channel 0 for both channels. \`process_clarity_compat\` reproduces this. The app path
  does not use it and sets levels explicitly instead.

## Limitations

- Cochlear loss only. A conductive part (air–bone gap from bone-conduction thresholds) is simulated separately in
  front of the engine ([conductive.md](conductive.md)), which then gets the sensorineural part. Not simulated:
  temporal fine-structure loss
  [\`pichorafuller2007temporal\`, \`lopezpoveda2013perception\`], synaptopathy [\`kujawa2009adding\`], tinnitus, central
  effects.
- Audiogram levels must stay below the catch-up level (105 dB). pyclarity warns that results above 80–90 dB HL
  are unrealistic.
- The UCL extension is a principled mapping, but it has not been validated perceptually against listeners
  with measured UCLs.
- The severity class is a step function of the mean 2–8 kHz loss, so smearing changes in steps.
- A simulation for normal-hearing listeners: it adds to the listener's own hearing.
- A 2026 comparison found that other simulators reproduce target thresholds more accurately
  [\`deutsch2026evaluation\`]. WHIS is planned as a second engine for that reason.
`,ue=`# Model card: WHIS hearing-impairment simulator (v3.02)

| | |
|---|---|
| Engine id | \`whis\` |
| Implementation | \`crates/hls-core/src/whis/\` (Rust → WebAssembly) |
| Reference implementation | WHIS v3.02 (\`WHISv302\`, CC0) [\`whis2023github\`] with the gammachirp filterbank GCFB v2.34 (Apache-2.0) [\`gcfb2023github\`], by Toshio Irino (Wakayama University). Repository commits used: WHIS 33f5c29 (2024-08-27), GCFB c3dc7db (2026-11-09). |
| Publications | Irino 2023 [\`irino2023whis\`] (primary), preprint [\`irino2022whisarxiv\`]; filterbank [\`irino2006dynamic\`, \`irino2001compressive\`, \`patterson2003extending\`] |
| Status | **Validated port**: numerically equivalent to the reference run in Octave (see Validation). One documented, deliberate deviation in the default configuration: the outer/middle-ear FIR (see that section). |
| Sample rate | WHIS runs at 48 kHz. \`Whis::process\` accepts any integer rate from 8 to 192 kHz and resamples (44.1 kHz ↔ 48 kHz for the app). |

Citation keys refer to \`references/references.bib\`.

## What it simulates

WHIS models a cochlear hearing loss as a loss of *active* (outer-hair-cell, OHC) gain and compression plus a
*passive* (inner-hair-cell / transmission, IHC) attenuation, and plays back the excitation pattern a
hearing-impaired listener would have to a normal-hearing listener [\`irino2023whis\`]. Per ear, at 48 kHz:

1. **Level calibration.** The signal is scaled to the filterbank's "Meddis hair-cell level", where an RMS of 1
   corresponds to 30 dB SPL (\`Eqlz2MeddisHCLevel\`).
2. **Outer/middle ear.** A minimum-phase FIR maps the free field to the cochlea (\`MkFilterField2Cochlea('FreeField')\`:
   free-field → eardrum and middle-ear tables named "Moore16" in GCFB, 0 dB at 1 kHz for the outer-ear part).
   It only feeds the level estimate; the output signal is filtered directly (step 6).
3. **Gammachirp filterbank and level estimate** (GCFB v2.34, dynamic, frame-based) [\`irino2006dynamic\`]. 100
   passive gammachirp channels (4th order, b₁ = 1.81, c₁ = −2.96), asymptotic frequencies Fr1 equally spaced on
   the ERB-rate scale between 100 Hz and 12 kHz. For each channel the level is estimated in 1 ms Hann frames
   every 0.5 ms (2 kHz frame rate) from the channel 1.5 ERB above (4 channels): the RMS of the passive gammachirp
   output and of the same output through a fixed high-pass asymmetric compensation filter (HP-AF; 4 biquads,
   \`frat\` = 1.08, b₂ = 2.17, c₂ = 2.2·α), each held by a 0.5 ms half-life decay, combined as
   \`0.5·Ref·(P/Ref)^1.5 + 0.5·Ref·(S/Ref)^0.5\` (Ref ≙ 50 dB) and converted to dB (−3 dB half-wave
   compensation).
4. **Active and passive loss** (\`GCFBv23_HearingLoss\`). The HP-AF input/output function of a channel is
   \`IO(Pin) = 20·log10(AF(Pin)/AF(100 dB)) + Pin\`, \`AF = exp(c₂·α·atan2(Fp1 − Fr2, b₂·ERBw(Fr2)))\`,
   \`Fr2 = (1 + 0.0109·(Pin − Pc))·Fp1\`. At each audiogram frequency the active loss is the input-level increase
   that makes the impaired IO function (compression health α) reach the healthy (α = 1) output at the 0 dB HL
   cochlear level (\`HL2PinCochlea\`: ANSI S3.6-2010 RETSPL + middle-ear table). The passive loss is the rest of the
   audiogram. If the active loss alone would exceed the audiogram value, α is raised at that frequency until it
   does not (so α acts as a maximum). Both are interpolated to the 100 channels on the ERB-rate scale (linear,
   extrapolated beyond 125 Hz and 8 kHz; α clipped to 0…1).
5. **Gain reduction per frame and channel.** \`ΔG = −(Pin − Pin_NH) − PAS\`, where \`Pin\` is the estimated level and
   \`Pin_NH\` the healthy input level giving the same IO output (inverse IO function by linear interpolation on a
   0.1 dB grid from −120 to 150 dB). The trajectories are advanced by \`fix(2 ms · 1 kHz/Fr1 · 2 kHz)\` frames to
   compensate the filter delays (\`GCFBv23_DelayCmpnst\`), then averaged with a 20 ms Hann window every 10 ms.
6. **Direct time-varying filtering (DTVF).** Every 10 ms, the gain spectrum (channel gains at Fr1, extended to
   0 Hz with +3 dB/oct and to 24 kHz with −3 dB/oct, interpolated log-linearly onto a 1024-point FFT grid) is
   turned into a minimum-phase FIR (real cepstrum; WHIS designs it for the square root of the amplitude
   spectrum and applies it twice, truncated to 10 ms). It filters a √Hann-windowed 20 ms frame of the input;
   frames are overlap-added with a √Hann synthesis window.

### Design note: which path was ported, and why

WHIS v3.02 offers two synthesis methods. **DTVF** is the default of the batch function \`WHISv30_Batch\` and the
only one the GUI uses (\`WHIS_GUI.m\` sets \`SynthMethod = 'DTVF'\`; its comment says this method sounds good);
\`FBAnaSyn\` (filterbank analysis/synthesis) is the alternative. We ported DTVF with the defaults \`WHISv302\`
applies: 48 kHz, 100 channels, 100 Hz–12 kHz, \`OutMidCrct = 'FreeField'\`, dynamic frame-based HP-AF, no
down-sampling (\`WHISv30_Batch\` forces \`AllowDownSampling = 0\`), no envelope-modulation loss (\`EMLoss\` is off unless
\`EMLoss.LPFfc\` is given). WHIS has no default compression health (it requires one); we use 0.5, GCFB's default for
impaired listeners and the value of WHIS's batch example. DTVF also avoids MATLAB's \`resample\`, whose filter
design differs between MATLAB and Octave; FBAnaSyn depends on it.

\`WHISv30_Batch\` additionally normalises the input to a calibration tone (−26 dB RMS ≙ \`CalibTone.SPLdB\`). That is
a single multiplication; the app path replaces it with the \`equiv_0db_spl\` convention (below).

## Parameters

| Parameter | Meaning | App default |
|---|---|---|
| audiogram | dB HL at any frequencies. Mapped to WHIS's grid 125, 250, 500, 1000, 2000, 4000, 8000 Hz by linear interpolation over log-frequency, constant extrapolation beyond the lowest/highest point (e.g. a 250–6000 Hz audiogram gives 125 Hz = value at 250 Hz, 8 kHz = value at 6 kHz), negative values clamped to 0 dB HL (the reference rejects negative levels). | – |
| \`compression_health\` α | 0 (OHC compression lost) … 1 (healthy). Upper limit of the active share of the loss; see step 4. | 0.5 |
| \`equiv_0db_spl\` | SPL of a signal with RMS 1. | 120 dB (as MSBG) |
| \`outer_middle_ear\` | \`HighOrder\` (default) or \`OctaveFallback\`; see below. | \`HighOrder\` |

Maximum active loss (α = 0) at 125 … 8000 Hz: 12.4, 24.8, 35.4, 40.4, 43.1, 43.1, 44.0 dB; with α = 0.5: 7.0, 15.4,
22.4, 25.0, 25.7, 27.0, 26.9 dB. (These agree with the table hard-coded in WHIS's \`WHISv30_InitParamHI.m\`,
12.36 … 43.95 dB, which Irino computed from the same functions.) \`HlsWasm.whisParams\` returns the split for an
audiogram.

## Extension: compression health from discomfort levels (not in WHIS)

In GCFB the active (OHC) part of a loss shrinks as the level rises. The gain difference between a compressive and
a less compressive channel vanishes at a cochlear input of 100 dB (\`ASYM_NORM_DB\`). The passive part is a
constant attenuation. How the audiogram is split therefore decides how much of the loss is left at high levels,
which is what a listener's uncomfortable loudness level (UCL) shows. Loudness-based estimates of the outer- versus
inner-hair-cell share of a loss rest on the same idea.

With *Compression health: From discomfort levels*, the app sets α separately at each of WHIS's seven audiogram
frequencies (\`hloss::alphas_from_ucl\`). α is chosen by bisection so that a tone at the impaired ear's UCL gives the
same normal-equivalent cochlear level, \`pin_NH(IO_α(pin(UCL))) − passive loss\`, as a tone at 105 dB HL in a normal
ear. That is the gain law of \`dtvf::gain_reduction_db\`. GCFB already handles α per frequency internally (its
consistency correction changes α frequency by frequency), and the per-frequency values go through the same split
(\`HearingLoss::with_alphas\`).

- UCL ≥ HL + 105 dB: α = 1 (the whole loss is passive, no recruitment).
- Lower UCLs need more active loss, so α falls. The active loss is capped at 12–44 dB (α = 0, table above). Once
  that cap is reached, lower UCLs make no further difference. WHIS cannot represent a reduced range beyond the
  maximum OHC loss: the rest of the loss stays passive.

Overall level of the output relative to the normal-hearing output, Bisgaard N3, speech-like signal (dB):

| Input (dB SPL) | α = 0.5 fixed | UCL 115 | UCL 105 | UCL 95 |
|---|---|---|---|---|
| 50 | −35.8 | −37.6 | −38.6 | −38.8 |
| 70 | −31.5 | −31.5 | −31.7 | −31.8 |
| 90 | −23.3 | −20.5 | −15.6 | −14.8 |
| 110 | −19.5 | −15.3 | −8.4 | −7.3 |

With a fixed α the output is bit-identical to the previous, validated build (checked sample by sample).

## Levels and calibration

Inside WHIS the signal level is given in dB SPL as the RMS (Leq) of the whole input (\`SrcSnd.SPLdB\`); the
filterbank input is scaled so that this equals the Meddis hair-cell level, i.e. by
\`10^(SPLdB/20) / (rms · 10^(30/20))\`. In the app convention (RMS 1.0 ≙ \`equiv_0db_spl\` dB SPL) that factor is the
constant \`10^((equiv_0db_spl − 30)/20)\`, independent of the signal, which is what \`Whis::process\` uses. The
output is the input filtered by the DTVF filters, so it is in the input's scale. Silent inputs are allowed in the
app path (the reference divides by the RMS).

The app's playback calibration is the same as for MSBG (see \`msbg.md\`, "Levels and calibration").

## Sample rate and time alignment

WHIS accepts only 48 or 24 kHz ("No 44100 Hz": the 0.5 ms frame shift must be an integer number of samples).
\`Whis::process\` resamples other rates to 48 kHz and back with a zero-phase polyphase filter
(\`dsp::resample::Resampler\`, semantics of \`scipy.signal.resample_poly\`, Kaiser β = 9, 32 zero crossings per side;
round-trip error < −80 dB for a 1 kHz tone). The DTVF output is aligned with its input by construction; the
minimum-phase filters add a frequency-dependent group delay of well under a sample at the cross-correlation peak:
\`validation/check_whis_alignment.ts\` measures a lag of **0 samples** for noise bursts and click trains at
0–60 dB HL. The output has exactly the input's length.

\`Whis::process\` appends 50 ms of zeros (at 48 kHz) before processing and drops them afterwards, so that two
end-of-signal artefacts of the reference fall outside the returned signal (see Known quirks).

## Validation

\`validation/compare_whis.py\` generates three test signals at 48 kHz, 1 s each (harmonic complex with AM and gaps
at 65 dB SPL, pink noise at 75 dB SPL, tone pips at 250/1000/4000 Hz at 50 dB SPL), runs the reference in Octave
(\`validation/octave/whis_ref.m\`, calling \`WHISv302\` with \`SynthMethod = 'DTVF'\`) and our shipped \`.wasm\` in Node
(\`validation/run_whis_wasm.ts\`), and reports \`SNR = 10·log10(Σref² / Σ(ours − ref)²)\`. Both sides get the same
float32-rounded input. Audiograms (at 125 … 8000 Hz): normal (0 dB HL), mild (WHIS/GCFB preset HL3, ISO 7029
70-year male: 8 8 9 10 19 43 59), moderate flat (40 40 45 50 55 60 65), steep sloping (10 10 15 30 55 70 80);
α = 0, 0.5, 1.

Reference environment: Octave 10.3 with signal 1.4.8, plus a MATLAB-compatible \`hanning\` (shim in
\`validation/octave/shim/\`: Octave's \`hanning\` includes the zero end points, MATLAB's does not; WHIS/GCFB use it for
the level-estimation window, the TVF window, gain smoothing and the FIR taper).

**Result: every case lies at the float32 output floor, worst case 151.1 dB, range 151.1–153.0 dB**
(\`validation/results/whis-vs-reference.json\`). Each SNR equals the SNR of the reference against its own float32
rounding to 0.1 dB, so the remaining error comes from the 32-bit wasm I/O and not from the port.

| Block | Cases | SNR range |
|---|---|---|
| Core 48 kHz, default FIR (injected into the reference) | 3 signals × 4 audiograms × α ∈ {0, 0.5, 1} = 36 | 151.1–153.0 dB |
| Core 48 kHz, unmodified reference vs \`OctaveFallback\` | 3 × 4 × α = 0.5 = 12 | 151.1–152.9 dB |
| App path 44.1 kHz (\`hls_whis_process\` vs \`resample_poly\` → reference → \`resample_poly\`, same resampling filter) | 5 | 151.8–152.2 dB |

The app-path block also checks the resampler: our polyphase implementation and scipy's \`resample_poly\` with the
same coefficients agree to the same floor.

Intermediate stages are compared too (level estimate \`GCresp.LvldBframe\` and the delay-compensated gain
reduction, all 100 channels × 0.5 ms frames): the largest difference is of the order of 1e-6 dB, which is the
float32 resolution of the exported values.

**Runtime** (shipped wasm in Node 26, one thread, best of 3 on a 10 s signal; shared, loaded machine):
**about 200 ms per second of audio** for the 44.1 kHz app path (202 ms, resampling included; 198 ms for the
48 kHz core), i.e. 5× faster than real time. The Octave reference needs about 9 s per second of audio. Stage
costs for 10 s of audio (WASI build, \`cargo run --release --example profile_whis --target wasm32-wasip1\`):
gammachirp filtering ≈ 1 s (FFT overlap-add sharing the input spectrum across channels, two channels per inverse
FFT), DTVF ≈ 0.25 s, level and gain computation ≈ 0.35 s, HP-AF biquads ≈ 0.2 s, frame RMS ≈ 0.14 s, resampling
≈ 0.1 s.

### Outer/middle-ear filter (the one deviation, and why)

GCFB designs the free-field → cochlea FIR with \`firpm\` of order 600 (MATLAB branch, 300-tap minimum-phase
result). Octave's \`firpm\` does not converge for orders ≥ 500 here, so GCFB falls back to its "for octave
compatibility" branch: order 50, a 25-tap filter. That filter misses the target response by up to 5 dB
(100–125 Hz: −9.8 dB instead of −15.1/−13.5 dB; 500 Hz: −7.4 instead of −4.7 dB; RMS error 0.8 dB over
100 Hz–12 kHz). Because the filter feeds the level estimate, this matters: WHIS outputs computed with the 25-tap
filter and with an accurate filter differ by **20–36 dB SNR** for impaired ears (≈0.3 dB in overall level for the
steep audiogram), and not at all for normal hearing (\`validation/octave/outmid_sensitivity.m\`,
\`validation/results/whis-outmid-sensitivity.json\`).

hls-core therefore uses an accurate filter by default (\`OuterMiddleEar::HighOrder\`): GCFB's MATLAB-branch method
(\`firpm\`, 20-sample Hann taper, \`rceps\`, first half) at order 400, the highest order Octave's \`firpm\` converges for
(200 taps, RMS error 0.02 dB). We cannot run MATLAB's order-600 design, but two different accurate designs
(minimax order 400 and least-squares order 600, 300 taps) give WHIS outputs that agree to 44–65 dB SNR, so any
accurate design, MATLAB's included, should be close to ours. The 25-tap filter is available as
\`OuterMiddleEar::OctaveFallback\`, and the validation checks both: the default against the reference with the
same FIR injected (\`whis_ref.m\`, \`outmid = 'high'\`), the fallback against the completely unmodified reference.

## Known quirks of the reference (reproduced deliberately)

- **End-of-signal gain.** The delay compensation shifts each channel's gain trajectory forward by up to 20 ms
  (100 Hz channel) and fills the end with 0 dB, i.e. *no* hearing loss; the last 10 ms smoothing frame can also be
  0 dB. In the reference, the last up to ~20 ms of a signal are therefore processed with less or no loss.
  \`process_core\`/\`process_reference\` reproduce this; the app path pads 50 ms of silence so it does not reach the
  returned samples.
- **Not transparent for normal hearing.** With a 0 dB HL audiogram the channel gains are 0 dB, but the extensions
  below 100 Hz (+3 dB/oct towards −3 dB at 0 Hz) and above 12 kHz (−3 dB/oct, ≈ −2.8 dB at 24 kHz) are not flat,
  and the minimum-phase filters add phase. Broadband signals lose 0.5–0.9 dB.
- **Sub-threshold attenuation.** The IO functions have no lower limit, so components below the impaired
  threshold are attenuated by more than the audiogram value (e.g. −23.7 dB for 70 dB SPL noise spread over all
  channels with a flat 20 dB HL loss and α = 0.5). They are inaudible to the impaired ear in either case.
- **α is corrected per frequency.** Where the audiogram is smaller than the active loss implied by α, GCFB raises
  α at that frequency (e.g. normal hearing always ends with α = 1). The passive loss can then come out slightly
  negative (≈ −0.1 dB); the reference accepts this.
- **Extrapolation above 8 kHz.** Losses and α are extrapolated linearly on the ERB-rate scale from the 4–8 kHz
  segment up to the 12 kHz channel.

## Limitations

- Only the DTVF path at 48 kHz with WHIS's defaults. Not ported: \`FBAnaSyn\` synthesis, the optional
  envelope-modulation (temporal) loss \`EMLoss\`, other outer-ear corrections (diffuse field, ITU, ear drum),
  24 kHz operation.
- Equivalence is shown against the reference running in Octave, not MATLAB. MATLAB-specific behaviour was
  reproduced where we know it (\`hanning\`); the outer/middle-ear FIR is the known difference (above). Others,
  if any, are unverified.
- Whole-signal processing: peak memory is roughly 50 bytes per 48 kHz sample (≈ 150 MB for 60 s; the shared
  filterbank input spectrum is about 20 bytes of it), and runtime is about 200 ms per second of audio.
- Audiogram frequencies outside 125 Hz–8 kHz are not used by WHIS; values between grid points are interpolated.
- Cochlear loss only (no temporal fine-structure loss, synaptopathy or central effects; a conductive part is
  simulated separately in front of the engine, see [conductive.md](conductive.md)), and a simulation for normal-hearing listeners: it adds to the listener's own hearing.
`;function de(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var S=de();function fe(e){S=e}var C={exec:()=>null};function w(e){let t=[];return n=>{let r=Math.max(0,Math.min(3,n-1)),i=t[r];return i||(i=e(r),t[r]=i),i}}function T(e,t=``){let n=typeof e==`string`?e:e.source,r={replace:(e,t)=>{let i=typeof t==`string`?t:t.source;return i=i.replace(E.caret,`$1`),n=n.replace(e,i),r},getRegex:()=>new RegExp(n,t)};return r}var pe=((e=``)=>{try{return!!RegExp(`(?<=1)(?<!1)`+e)}catch{return!1}})(),E={codeRemoveIndent:/^(?: {0,3}\t| {1,4})/gm,listInterruptsParagraph:/^ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,endingSpaceTabChar:/[ \t]$/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,leadingSpaceTab:/^[ \t]+/,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+)[ \t]*)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,blockquoteMarkerWhitespace:/^( {0,3}>)([ \t]+)/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\][ \t]+\S/,listReplaceTask:/^\[[ xX]\][ \t]+/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,numericCharacterReference:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/,numericCharacterReferenceOrAmpersand:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:w(e=>RegExp(`^ {0,${e}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:w(e=>RegExp(`^ {0,${e}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),fencesBeginRegex:w(e=>RegExp(`^ {0,${e}}(?:\`\`\`|~~~)`)),headingBeginRegex:w(e=>RegExp(`^ {0,${e}}#{1,6}(?:\\s|$)`)),pedanticHeadingBeginRegex:w(e=>RegExp(`^ {0,${e}}#`)),htmlBeginRegex:w(e=>RegExp(`^ {0,${e}}(?:</?(?:${k})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`,`i`)),blockquoteBeginRegex:w(e=>RegExp(`^ {0,${e}}>`)),nestedContainerMarkers:/^(?: {0,3}(?:(?:[*+-]|\d{1,9}[.)])[ \t]+|>[ \t]?))+/},me=/^(?:[ \t]*(?:\n|$))+/,he=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,ge=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}(?:(?=`)\1`*|(?=~)\1~*) *(?=\n|$)|$)/,D=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,_e=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,O=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,ve=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+)[ \t]*(?:\n+|$)/,ye=T(ve).replace(/bull/g,O).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,``).getRegex(),be=T(ve).replace(/bull/g,O).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),xe=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,Se=/^[^\n]+/,Ce=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+/,we=T(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace(`label`,Ce).replace(`title`,/(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\\n]|\n(?!\n))*'|\((?:\\[\s\S]|[^()\\])*\))/).getRegex(),Te=T(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,O).getRegex(),k=`address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul`,A=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Ee=T(`^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))`,`i`).replace(`comment`,A).replace(`tag`,k).replace(`attribute`,/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),De=e=>T(xe).replace(`hr`,D).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,e).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,k).getRegex(),Oe=De(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),ke=De(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),j={blockquote:T(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace(`paragraph`,ke).getRegex(),code:he,def:we,fences:ge,heading:_e,hr:D,html:Ee,lheading:ye,list:Te,newline:me,paragraph:Oe,table:C,text:Se},Ae=T(`^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)`).replace(`hr`,D).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`blockquote`,` {0,3}>`).replace(`code`,`(?: {4}| {0,3}	)[^\\n]`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,k).getRegex(),je={...j,lheading:be,table:Ae,paragraph:T(xe).replace(`hr`,D).replace(`heading`,` {0,3}#{1,6}(?:\\s|$)`).replace(`|lheading`,``).replace(`table`,Ae).replace(`blockquote`,` {0,3}>`).replace(`fences`," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace(`list`,` {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]`).replace(`html`,` {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`).replace(`tag`,k).getRegex()},Me={...j,html:T(`^ *(?:comment(?: *\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1>(?: *\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?>(?: *\\n{2,}|\\s*$))`).replace(`comment`,A).replace(/tag/g,`(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b`).getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:C,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:T(xe).replace(`hr`,D).replace(`heading`,` *#{1,6} *[^
]`).replace(`lheading`,ye).replace(`|table`,``).replace(`blockquote`,` {0,3}>`).replace(`|fences`,``).replace(`|list`,``).replace(`|html`,``).replace(`|tag`,``).getRegex()},Ne=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Pe=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Fe=/^( {2,}|\\)\n(?!\s*$)[ \t]*/,Ie=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,M=/[\p{P}\p{S}]/u,N=/[\s\p{P}\p{S}]/u,P=/[^\s\p{P}\p{S}]/u,Le=T(/^((?![*_])punctSpace)/,`u`).replace(/punctSpace/g,N).getRegex(),Re=/[\p{Pi}\p{Ps}"']/u,ze=/(?!~)[\p{P}\p{S}]/u,Be=/(?!~)[\s\p{P}\p{S}]/u,Ve=/(?:[^\s\p{P}\p{S}]|~)/u,He=T(/link|precode-code|html/,`g`).replace(`link`,/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace(`precode-`,pe?"(?<!`)()":"(^^|[^`])").replace(`code`,/(?<b>`+)[^`]+\k<b>(?!`)/).replace(`html`,/<(?! )[^<>]*?>/).getRegex(),Ue=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,We=T(Ue,`u`).replace(/punct/g,M).getRegex(),Ge=T(Ue,`u`).replace(/punct/g,ze).getRegex(),Ke=T(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,`u`).replace(/openQuote/g,Re).replace(/punct/g,M).getRegex(),qe=`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)`,Je=T(qe,`gu`).replace(/notPunctSpace/g,P).replace(/punctSpace/g,N).replace(/punct/g,M).getRegex(),Ye=T(qe,`gu`).replace(/notPunctSpace/g,Ve).replace(/punctSpace/g,Be).replace(/punct/g,ze).getRegex(),Xe=T(`^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,P).replace(/punctSpace/g,N).replace(/punct/g,M).getRegex(),Ze=T(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)`,`gu`).replace(/notPunctSpace/g,P).replace(/punctSpace/g,N).replace(/punct/g,M).getRegex(),Qe=T(`^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,P).replace(/punctSpace/g,N).replace(/punct/g,M).getRegex(),$e=T(/^~~?(?:((?!~)punct)|[^\s~])/,`u`).replace(/punct/g,M).getRegex(),et=T(`^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)`,`gu`).replace(/notPunctSpace/g,P).replace(/punctSpace/g,N).replace(/punct/g,M).getRegex(),tt=T(/\\(punct)/,`gu`).replace(/punct/g,M).getRegex(),nt=T(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/,`gu`).replace(/punct/g,M).getRegex(),rt=T(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace(`scheme`,/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace(`email`,/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),it=T(A).replace(`(?:-->|$)`,`-->`).getRegex(),at=T(`^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>`).replace(`comment`,it).replace(`attribute`,/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ot=/\[(?:\\[\s\S]|[^\[\]\\])*\]/,F=T(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace(`brackets`,ot).getRegex(),st=T(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace(`label`,F).replace(`href`,/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace(`title`,/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\((?:\\[\s\S]|[^)\\])*\)/).getRegex(),ct=T(/^!?\[(label)\]\[(ref)\]/).replace(`label`,F).replace(`ref`,Ce).getRegex(),lt=T(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,Ce).getRegex(),ut=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/,dt=T(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace(`brackets`,ot).getRegex(),ft=T(`reflink|nolink(?!\\()`,`g`).replace(`reflink`,T(/^!?\[(label)\]\[(ref)\]/).replace(`label`,dt).replace(`ref`,ut).getRegex()).replace(`nolink`,T(/^!?\[(ref)\](?:\[\])?/).replace(`ref`,ut).getRegex()).getRegex(),pt=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,mt=T(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g,/[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),I={_backpedal:C,anyPunctuation:tt,anyPunctuationOutsideCode:nt,autolink:rt,blockSkip:He,br:Fe,code:Pe,del:C,delLDelim:C,delRDelim:C,emStrongLDelim:We,emStrongRDelimAst:Je,emStrongRDelimUnd:Ze,escape:Ne,link:st,nolink:lt,punctuation:Le,reflink:ct,reflinkSearch:ft,tag:at,text:Ie,url:C},ht={...I,emStrongLDelim:Ke,emStrongRDelimAst:Xe,emStrongRDelimUnd:Qe,link:T(/^!?\[(label)\]\((.*?)\)/).replace(`label`,F).getRegex(),reflink:T(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace(`label`,F).getRegex()},L={...I,emStrongRDelimAst:Ye,emStrongLDelim:Ge,delLDelim:$e,delRDelim:et,url:T(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace(`emailProtocol`,mt).replace(`protocol`,pt).replace(`email`,/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:T(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|wwwStart|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace(`protocol`,pt).replace(/emailProtocol/g,/(?:mailto|xmpp):/).replace(`wwwStart`,pe?`(?<![^\\s*_~(])www\\.`:`www\\.`).getRegex()},gt={...L,br:T(Fe).replace(`{2,}`,`*`).getRegex(),text:T(L.text).replace(`\\b_`,`\\b_| {2,}\\n`).replace(/\{2,\}/g,`*`).getRegex()},R={normal:j,gfm:je,pedantic:Me},z={normal:I,gfm:L,breaks:gt,pedantic:ht},_t={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`},vt=e=>_t[e];function B(e,t){if(t){if(E.escapeTest.test(e))return e.replace(E.escapeReplace,vt)}else if(E.escapeTestNoEncode.test(e))return e.replace(E.escapeReplaceNoEncode,vt);return e}function yt(e){return E.numericCharacterReference.test(e)?e.replace(E.numericCharacterReferenceOrAmpersand,(e,t,n)=>{if(t===void 0&&n===void 0)return`&amp;`;let r=t===void 0?Number.parseInt(n,16):Number.parseInt(t,10);return r===0||r>1114111||r>=55296&&r<=57343?`�`:r===38?`&amp;`:String.fromCodePoint(r)}):e}function bt(e){try{e=encodeURI(e).replace(E.percentDecode,`%`)}catch{return null}return e}function xt(e,t){let n=e.replace(E.findPipe,(e,t,n)=>{let r=!1,i=t;for(;--i>=0&&n[i]===`\\`;)r=!r;return r?`|`:` |`}).split(E.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t){if(n.length>t)n.splice(t);else for(;n.length<t;)n.push(``)}for(;r<n.length;r++)n[r]=n[r].trim().replace(E.slashPipe,`|`);return n}function V(e,t,n){let r=e.length;if(r===0)return``;let i=0;for(;i<r;){let a=e.charAt(r-i-1);if(a===t&&!n)i++;else if(a!==t&&n)i++;else break}return e.slice(0,r-i)}function St(e){let t=e.split(`
`),n=t.length-1;for(;n>=0&&E.blankLine.test(t[n]);)n--;return t.length-n<=2?e:t.slice(0,n+1).join(`
`)}function H(e){return e.trim().replace(E.multipleSpaceGlobal,` `).toLowerCase().toUpperCase().toLowerCase()}function Ct(e,t){if(e.indexOf(t[0])===-1&&e.indexOf(t[1])===-1)return-1;let n=0;for(let r=0;r<e.length;r++)if(e[r]===`\\`)r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}var U=new WeakMap;function W(e){let t={"*":-1,_:-1},n=-1,r=e.length;for(let i=0;i<r;i++){let a=e[i];if(a!==`*`&&a!==`_`&&a!==`~`)continue;let o=i===0?`
`:e[i-1],s=i+1;for(;s<r&&e[s]===a;)s++;o!==` `&&o!==`	`&&o!==`
`&&o!==`\r`&&o!==`\f`&&(a===`~`?n=i:t[a]=i),i=s-1}return{maskedSrc:e,lastPossibleEmStrongCloserIndex:t,lastPossibleDelCloserIndex:n}}function wt(e,t){let n=W(t),r=U.get(e);r?r.push(n):U.set(e,[n])}function Tt(e){let t=U.get(e);t&&(t.pop(),t.length===0&&U.delete(e))}function Et(e,t,n){let r=U.get(e)?.at(-1);return r&&r.maskedSrc===t?r.lastPossibleEmStrongCloserIndex[n]:W(t).lastPossibleEmStrongCloserIndex[n]}function Dt(e,t){let n=U.get(e)?.at(-1);return n&&n.maskedSrc===t?n.lastPossibleDelCloserIndex:W(t).lastPossibleDelCloserIndex}function G(e,t=0){let n=t,r=``;for(let t of e)if(t===`	`){let e=4-n%4;r+=` `.repeat(e),n+=e}else r+=t,n++;return r}function Ot(e,t,n,r,i){let a=t.href,o=t.title||null,s=e[1].replace(i.other.outputLinkReplace,`$1`),c=e[0].charAt(0)===`!`,l=r.state.inLink,u=r.state.linkEmitted,d=r.state.inRawBlock;r.state.inLink=!0,r.state.linkEmitted=!1;let f=r.inlineTokens(s),p=r.state.linkEmitted;if(r.state.linkEmitted=u,r.state.inLink=l,!c){if(p){r.state.inRawBlock=d;return}r.state.linkEmitted=!0}return{type:c?`image`:`link`,raw:n,href:a,title:o,text:s,tokens:f}}function kt(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(r===null)return t;let i=r[1];return t.split(`
`).map(e=>{let t=e.match(n.other.beginningSpace);if(t===null)return e;let[r]=t;return e.slice(Math.min(r.length,i.length))}).join(`
`)}function At(e,t,n,r){if(!t.includes(`<`))return!1;for(let i=0;i<t.length;i++){if(t[i]===`\\`){i++;continue}if(t[i]==="`"){let e=r.inline.code.exec(t.slice(i));if(e){i+=e[0].length-1;continue}}if(t[i]!==`<`)continue;let a=e.slice(n+i),o=r.inline.tag.exec(a)||r.inline.autolink.exec(a);if(o){if(o[0].length>t.length-i)return!0;i+=o[0].length-1}}return!1}var K=class{options;rules;lexer;constructor(e){this.options=e||S}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:`space`,raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=this.options.pedantic?t[0]:St(t[0]);return{type:`code`,raw:e,codeBlockStyle:`indented`,text:e.replace(this.rules.other.codeRemoveIndent,``)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=kt(e,t[3]||``,this.rules);return{type:`code`,raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,`$1`):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=V(e,`#`);(this.options.pedantic||!t||this.rules.other.endingSpaceTabChar.test(t))&&(e=t.trim())}return{type:`heading`,raw:V(t[0],`
`),depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:`hr`,raw:V(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let e=V(t[0],`
`).split(`
`),n=``,r=``,i=[];for(;e.length>0;){let t=!1,a=[],o=0;for(;o<e.length;o++)if(this.rules.other.blockquoteStart.test(e[o]))a.push(e[o]),t=!0;else if(!t)a.push(e[o]);else break;e=e.slice(o);let s=a.join(`
`),c=s.replace(this.rules.other.blockquoteMarkerWhitespace,(e,t,n)=>t+G(n,t.length)).replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,``);n=n?`${n}
${s}`:s,r=r?`${r}
${c}`:c;let l=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,i,!0),this.lexer.state.top=l,e.length===0)break;let u=i.at(-1);if(u?.type===`code`||u?.type===`heading`||u?.type===`hr`||u?.type===`html`||u?.type===`table`)break;if(u?.type===`blockquote`){let t=u,a=e.join(`
`),o=t.raw+`
`+a.replace(this.rules.other.blockquoteSetextReplace2,``),s=this.blockquote(o);i[i.length-1]=s;let c=o.substring(s.raw.length).replace(/^\n/,``),l=c?c.split(`
`).length:0,d=l?e.slice(0,-l):e;if(d.length>0&&(n=`${n}
${d.join(`
`)}`),r=r.substring(0,r.length-t.text.length)+s.text,e=e.slice(d.length),e.length>0&&this.rules.other.blockquoteStart.test(e[0]))continue;break}if(u?.type===`list`){let t=u,a=t.raw+`
`+e.join(`
`),o=this.list(a);i[i.length-1]=o;let s=o.raw.length>t.raw.length?a.slice(t.raw.length+1,o.raw.length).split(`
`).length:0;if(s>0){let t=e.slice(0,s).join(`
`);n=`${n}
${t}`,r=`${r}
${t}`}e=e.slice(s)}}return{type:`blockquote`,raw:n,tokens:i,text:r}}}list(e){let t=this.rules.block.list.exec(e);if(t){if(!this.options.pedantic&&this.lexer.state.lastToken?.type===`text`&&!this.rules.other.listInterruptsParagraph.test(e))return;let n=e,r=()=>n.length-e.length,i=t[1].trim(),a=i.length>1,o={type:`list`,raw:``,ordered:a,start:a?+i.slice(0,-1):``,loose:!1,items:[]};i=a?`\\d{1,9}\\${i.slice(-1)}`:`\\${i}`,this.options.pedantic&&(i=a?i:`[*+-]`);let s=this.rules.other.listItemRegex(i),c=!1;for(;e;){let i=!1,a=``;if(!(t=s.exec(e))||this.rules.block.hr.test(e))break;let l=r();e=e.substring(t[0].length);let u=t[2].split(`
`,1)[0],d=t[1].length,f=this.options.pedantic?G(u,d):u.replace(this.rules.other.leadingSpaceTab,e=>G(e,d)),p=e.split(`
`,1)[0],m=!f.trim(),h=0;if(this.options.pedantic?(h=2,a=f.trimStart()):m?h=d+1:(h=f.search(this.rules.other.nonSpaceChar),h=h>4?1:h,a=f.slice(h),h+=d),m&&this.rules.other.blankLine.test(p)&&(e=e.substring(p.length+1),i=!0),!i){let t=this.rules.other.nextBulletRegex(h),n=this.rules.other.hrRegex(h),r=this.rules.other.fencesBeginRegex(h),i=this.options.pedantic?this.rules.other.pedanticHeadingBeginRegex(h):this.rules.other.headingBeginRegex(h),o=this.rules.other.htmlBeginRegex(h),s=this.rules.other.blockquoteBeginRegex(h),c=!1;for(;e;){let l=e.split(`
`,1)[0],u;if(p=l,this.options.pedantic?(p=p.replace(this.rules.other.listReplaceNesting,`  `),u=p):u=p.replace(this.rules.other.leadingSpaceTab,e=>G(e)),r.test(p)||i.test(p)||o.test(p)||s.test(p)||t.test(p)||n.test(p))break;if(u.search(this.rules.other.nonSpaceChar)>=h||!p.trim())a+=`
`+u.slice(h),c=!1;else{if(m||f.replace(this.rules.other.tabCharGlobal,`    `).search(this.rules.other.nonSpaceChar)>=4||r.test(f)||i.test(f)||o.test(f)||n.test(f))break;if(!this.options.pedantic&&!c){let e=f.replace(this.rules.other.nestedContainerMarkers,``);if(this.rules.block.fences.test(e)||this.rules.block.heading.test(e)||this.rules.block.hr.test(e))break}let e=!this.options.pedantic&&/^ {0,3}(?:=+|-+) *$/.test(p)&&this.rules.block.lheading.test(`${f}
${p}`)?`    ${u.replace(/^ {0,3}/,``)}`:p;a+=`
`+e,c=!0}m=!p.trim(),e=e.substring(l.length+1),f=u.slice(h)}}let g=n.slice(l,r());o.loose||(c?o.loose=!0:this.rules.other.doubleBlankLine.test(g)&&(c=!0)),o.items.push({type:`list_item`,raw:g,task:!!this.options.gfm&&this.rules.other.listIsTask.test(a),loose:!1,text:a,tokens:[]})}let l=o.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;o.raw=n.slice(0,r()).trimEnd();for(let e of o.items)if(this.lexer.state.top=!1,e.tokens=this.lexer.blockTokens(e.text,[]),!o.loose){let t=e.tokens.filter(e=>e.type===`space`);o.loose=t.length>0&&t.some(e=>this.rules.other.anyLine.test(e.raw))}for(let e of o.items){let t=e.tokens[0];if(e.task&&(t?.type===`text`||t?.type===`paragraph`)){e.text=e.text.replace(this.rules.other.listReplaceTask,``),t.raw=t.raw.replace(this.rules.other.listReplaceTask,``),t.text=t.text.replace(this.rules.other.listReplaceTask,``);for(let e=this.lexer.inlineQueue.length-1;e>=0;e--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)){this.lexer.inlineQueue[e].src=this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask,``);break}let n=this.rules.other.listTaskCheckbox.exec(e.raw);if(n){let t={type:`checkbox`,raw:n[0]+` `,checked:n[0]!==`[ ]`};e.checked=t.checked,o.loose?e.tokens[0]&&[`paragraph`,`text`].includes(e.tokens[0].type)&&`tokens`in e.tokens[0]&&e.tokens[0].tokens?(e.tokens[0].raw=t.raw+e.tokens[0].raw,e.tokens[0].text=t.raw+e.tokens[0].text,e.tokens[0].tokens.unshift(t)):e.tokens.unshift({type:`paragraph`,raw:t.raw,text:t.raw,tokens:[t]}):e.tokens.unshift(t)}}else e.task&&=!1}if(o.loose)for(let e of o.items){e.loose=!0;for(let t of e.tokens)t.type===`text`&&(t.type=`paragraph`)}return o}}html(e){let t=this.rules.block.html.exec(e);if(t){let e=St(t[0]);return{type:`html`,block:!0,raw:e,pre:t[1]===`pre`||t[1]===`script`||t[1]===`style`,text:e}}}def(e){let t=this.rules.block.def.exec(e);if(t){if(!this.rules.other.startAngleBracket.test(t[2])&&Ct(t[2],`()`)!==-1)return;let e=H(t[1]),n=t[2]?t[2].replace(this.rules.other.hrefBrackets,`$1`).replace(this.rules.inline.anyPunctuation,`$1`):``,r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,`$1`):t[3];return{type:`def`,tag:e,raw:V(t[0],`
`),href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=xt(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,``).split(`|`),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,``).split(`
`):[],a={type:`table`,raw:V(t[0],`
`),header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)this.rules.other.tableAlignRight.test(e)?a.align.push(`right`):this.rules.other.tableAlignCenter.test(e)?a.align.push(`center`):this.rules.other.tableAlignLeft.test(e)?a.align.push(`left`):a.align.push(null);for(let e=0;e<n.length;e++)a.header.push({text:n[e],tokens:this.lexer.inline(n[e]),header:!0,align:a.align[e]});for(let e of i)a.rows.push(xt(e,a.header.length).map((e,t)=>({text:e,tokens:this.lexer.inline(e),header:!1,align:a.align[t]})));return a}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t){let e=t[1].trim();return{type:`heading`,raw:V(t[0],`
`),depth:t[2].charAt(0)===`=`?1:2,text:e,tokens:this.lexer.inline(e)}}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:`paragraph`,raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:`text`,raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:`escape`,raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:`html`,raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){if(this.lexer.state.linkParenPossible===!1)return;let t=this.rules.inline.link.exec(e);if(t){let n=t[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&At(e,t[1],n,this.rules))return;let r=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let e=V(r.slice(0,-1),`\\`);if((r.length-e.length)%2==0)return}else{let e=Ct(t[2],`()`);if(e===-2)return;if(e>-1){let n=(t[0].indexOf(`!`)===0?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=``}}let i=V(t[0].slice(0,-1),`\\`);if((t[0].length-i.length)%2==0)return;let a=t[2],o=``;if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(a);e&&(a=e[1],o=e[3])}else o=t[3]?t[3].slice(1,-1):``;return a=a.trim(),this.rules.other.startAngleBracket.test(a)&&(a=this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?a.slice(1):a.slice(1,-1)),Ot(t,{href:a&&a.replace(this.rules.inline.anyPunctuation,`$1`),title:o&&o.replace(this.rules.inline.anyPunctuation,`$1`)},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let r=n[0].charAt(0)===`!`?2:1;if(!this.options.pedantic&&At(e,n[1],r,this.rules))return;let i=t[H(n[2]||n[1])];if(!i){let e=n[0].charAt(0);return{type:`text`,raw:e,text:e}}return Ot(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=``){let r=this.rules.inline.emStrongLDelim.exec(e);if(!r||!r[1]&&!r[2]&&!r[3]&&!r[4])return;let i=r[0][0],a=n===i,o=t.length-e.length,s=o;for(;!this.options.pedantic&&s>0&&t[s-1]===i;)s--;let c=[...t.slice(Math.max(0,s-2),s)].at(-1)??``,l=c===`*`||c===`_`||!!this.rules.inline.punctuation.exec(c);s<o&&(n=c);let u=s<o?l:n===`*`||n===`_`||!!this.rules.inline.punctuation.exec(n);if(r[4]&&n.match(this.rules.other.unicodeAlphaNumeric))return;let d=r[1]||r[3]||``;if(!d||!n||u){let n=[...r[0]].length-1,u,f,p=n,m=0,h=o-s+n,g=!this.options.pedantic&&!!c.trim()&&(!!d||i===`*`&&!l);if(i!==`*`&&i!==`_`)return;let _=i===`*`?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd,v=Et(this,t,i),y=t.length-e.length+n;if(v<y)return;t=t.slice(-1*e.length+n);let b=v-y;for(_.lastIndex=0;(r=_.exec(t))!==null&&!(r.index>b);){if(u=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!u)continue;if(f=[...u].length,r[3]||r[4]){p+=f;continue}if(r[5]||r[6]||g){if(a&&(r[5]||r[6]))break;if(h%3&&!((h+f)%3)){m+=f;continue}}if(p-=f,p>0)continue;f=Math.min(f,f+p+m);let t=[...r[0]][0].length,i=e.slice(0,n+r.index+t+f);if(Math.min(n,f)%2){let e=i.slice(1,-1);return{type:`em`,raw:i,text:e,tokens:this.lexer.inlineTokens(e)}}let o=i.slice(2,-2);return{type:`strong`,raw:i,text:o,tokens:this.lexer.inlineTokens(o)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal,` `),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:`codespan`,raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:`br`,raw:t[0]}}del(e,t,n=``){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n=[...r[0]].length-1,i,a,o=n,s=this.rules.inline.delRDelim,c=Dt(this,t),l=t.length-e.length+n;if(c<l)return;t=t.slice(-1*e.length+n);let u=c-l;for(s.lastIndex=0;(r=s.exec(t))!==null&&!(r.index>u);){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(a=[...i].length,a!==n))continue;if(r[3]||r[4]){o+=a;continue}if(o-=a,o>0)continue;a=Math.min(a,a+o);let t=[...r[0]][0].length,s=e.slice(0,n+r.index+t+a),c=s.slice(n,-n);return{type:`del`,raw:s,text:c,tokens:this.lexer.inlineTokens(c)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return t[2]===`@`?(e=t[1],n=`mailto:`+e):(e=t[1],n=e),{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if(t[2]===`@`)e=t[0],n=`mailto:`+e;else{let r;do r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??``;while(r!==t[0]);e=t[0],n=t[1]===`www.`?`http://`+t[0]:t[0]}return{type:`link`,raw:t[0],text:e,href:n,autolink:!0,tokens:[{type:`text`,raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:`text`,raw:t[0],text:e?t[0]:yt(t[0]),escaped:e}}}},q=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||S,this.options.tokenizer=this.options.tokenizer||new K,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,linkEmitted:!1,linkParenPossible:!0,top:!0};let t={other:E,block:R.normal,inline:z.normal};this.options.pedantic?(t.block=R.pedantic,t.inline=z.pedantic):this.options.gfm&&(t.block=R.gfm,t.inline=this.options.breaks?z.breaks:z.gfm),this.tokenizer.rules=t}static get rules(){return{block:R,inline:z}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(E.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.state.inRawBlock=!1,this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){this.tokenizer.lexer=this;let r=this.state.lastToken;this.options.pedantic&&(e=e.replace(E.tabCharGlobal,`    `).replace(E.spaceLine,``));let i=1/0;for(;e;){if(e.length<i)i=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}this.state.lastToken=t.at(-1);let r;if(this.options.extensions?.block?.some(n=>(r=n.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let n=t.at(-1);r.raw.length===1&&n!==void 0?n.raw+=`
`:t.push(r);continue}if(r=this.tokenizer.code(e)){e=e.substring(r.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+r.raw,n.text+=`
`+r.text,this.inlineQueue.at(-1).src=n.text):t.push(r);continue}if((r=this.tokenizer.fences(e))||(r=this.tokenizer.heading(e))||(r=this.tokenizer.hr(e))||(r=this.tokenizer.blockquote(e))||(r=this.tokenizer.list(e))||(r=this.tokenizer.html(e))){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(e)){e=e.substring(r.raw.length);let n=t.at(-1);n?.type===`paragraph`||n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+r.raw,n.text+=`
`+r.raw,this.inlineQueue.at(-1).src=n.text):(this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title}),t.push(r));continue}if((r=this.tokenizer.table(e))||(r=this.tokenizer.lheading(e))){e=e.substring(r.raw.length),t.push(r);continue}let a=e;if(this.options.extensions?.startBlock){let t=1/0,n=e.slice(1),r;this.options.extensions.startBlock.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(a=e.substring(0,t+1))}if(this.state.top&&(r=this.tokenizer.paragraph(a))){let i=t.at(-1);n&&i?.type===`paragraph`?(i.raw+=(i.raw.endsWith(`
`)?``:`
`)+r.raw,i.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=i.text):t.push(r),n=a.length!==e.length,e=e.substring(r.raw.length)}else if(r=this.tokenizer.text(e)){e=e.substring(r.raw.length);let n=t.at(-1);n?.type===`text`?(n.raw+=(n.raw.endsWith(`
`)?``:`
`)+r.raw,n.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(r)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,this.state.lastToken=r,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}linkInText(e){if(!e.includes(`[`))return!1;let t=this.tokenizer.rules.inline.link;for(let n of e.matchAll(this.tokenizer.rules.inline.blockSkip))if(t.test(n[0])&&e.charAt(n.index-1)!==`!`)return!0;for(let t of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)){let e=t[0],n=e.lastIndexOf(`[`);if(e.charAt(0)!==`!`&&Object.hasOwn(this.tokens.links,H(e.slice(n+1,-1)))&&!(n>1&&this.linkInText(e.slice(1,n-1))))return!0}return!1}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let n=this.state.linkParenPossible;this.state.linkParenPossible=n&&e.includes(`)`);try{return this.#e(e,t)}finally{this.state.linkParenPossible=n}}#e(e,t){let n=e.includes(`*`)||e.includes(`_`)||e.includes(`~`)||this.options.hooks?.emStrongMask||this.tokenizer.emStrong!==K.prototype.emStrong||this.tokenizer.del!==K.prototype.del?this.#r(e):e;wt(this.tokenizer,n);try{return this.#t(e,n,t)}finally{Tt(this.tokenizer)}}#t(e,t,n){let r=!1,i=``,a=1/0;for(;e;){if(e.length<a)a=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}r||(i=``),r=!1;let o;if(this.options.extensions?.inline?.some(t=>(o=t.call({lexer:this},e,n))?(e=e.substring(o.raw.length),n.push(o),!0):!1))continue;if((o=this.tokenizer.escape(e))||(o=this.tokenizer.tag(e))||(o=this.tokenizer.link(e))){e=e.substring(o.raw.length),n.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let t=n.at(-1);o.type===`text`&&t?.type===`text`?(t.raw+=o.raw,t.text+=o.text):n.push(o);continue}if((o=this.tokenizer.emStrong(e,t,i))||(o=this.tokenizer.codespan(e))||(o=this.tokenizer.br(e))||(o=this.tokenizer.del(e,t,i))||(o=this.tokenizer.autolink(e))||!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),n.push(o);continue}let s=e;if(this.options.extensions?.startInline){let t=1/0,n=e.slice(1),r;this.options.extensions.startInline.forEach(e=>{r=e.call({lexer:this},n),typeof r==`number`&&r>=0&&(t=Math.min(t,r))}),t<1/0&&t>=0&&(s=e.substring(0,t+1))}if(o=this.tokenizer.inlineText(s)){e=e.substring(o.raw.length),o.raw.slice(-1)!==`_`&&(i=o.raw.slice(-1)),r=!0;let t=n.at(-1);t?.type===`text`?(t.raw+=o.raw,t.text+=o.text):n.push(o)}else if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return n}#n(e){let{blockSkip:t,tag:n,autolink:r}=this.tokenizer.rules.inline,i=``,a=0,o;for(t.lastIndex=0;o=t.exec(e);){let s=o.index+(o[2]?o[2].length:0),c=o.index+o[0].length;if(e.charAt(s)===`<`){let i=e.slice(s),a=n.exec(i)||r.exec(i);if(!a){t.lastIndex=s+1;continue}c=s+a[0].length,t.lastIndex=c}i+=e.slice(a,s)+`[`+`a`.repeat(c-s-2)+`]`,a=c}return i+e.slice(a)}#r(e){let t=e;if(this.tokens.links&&e.includes(`[`)){let e=this.tokenizer.rules.inline.reflinkSearch,n=t=>{let r=t.lastIndexOf(`[`);if(!Object.hasOwn(this.tokens.links,H(t.slice(r+1,-1))))return t;if(r>1&&t.charAt(0)!==`!`){let i=t.slice(1,r-1);if(this.linkInText(i))return`[`+i.replace(e,n)+`][`+`a`.repeat(t.length-r-2)+`]`}return`[`+`a`.repeat(t.length-2)+`]`};t=t.replace(e,n)}return t=t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode,(e,t,n)=>n?`+`.repeat(e.length):t?t+e.slice(t.length,-t.length).replace(/`/g,`+`)+t:e),t=this.#n(t),t=this.options.hooks?.emStrongMask?.call({lexer:this},t)??t,t}infiniteLoopError(e){let t=`Infinite loop on byte: `+e;if(this.options.silent)console.error(t);else throw Error(t)}},J=class{options;parser;constructor(e){this.options=e||S}space(e){return``}code({text:e,lang:t,escaped:n}){let r=(t||``).match(E.notSpaceStart)?.[0],i=e?e.replace(E.endingNewline,``)+`
`:``;return r?`<pre><code class="language-`+B(r)+`">`+(n?i:B(i,!0))+`</code></pre>
`:`<pre><code>`+(n?i:B(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}def(e){return``}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){let t=e.ordered,n=e.start,r=``;for(let t=0;t<e.items.length;t++){let n=e.items[t];r+=this.listitem(n)}let i=t?`ol`:`ul`,a=t&&n!==1?` start="`+n+`"`:``;return`<`+i+a+`>
`+r+`</`+i+`>
`}listitem(e){return`<li>${this.parser.parse(e.tokens)}</li>
`}checkbox({checked:e}){return`<input `+(e?`checked="" `:``)+`disabled="" type="checkbox"> `}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t=``,n=``;for(let t=0;t<e.header.length;t++)n+=this.tablecell(e.header[t]);t+=this.tablerow({text:n});let r=``;for(let t=0;t<e.rows.length;t++){let i=e.rows[t];n=``;for(let e=0;e<i.length;e++)n+=this.tablecell(i[e]);r+=this.tablerow({text:n})}return r&&=`<tbody>${r}</tbody>`,`<table>
<thead>
`+t+`</thead>
`+r+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?`th`:`td`;return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${B(e,!0)}</code>`}br(e){return`<br>`}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,text:n,tokens:r,autolink:i}){let a=i?B(n,!0):this.parser.parseInline(r),o=bt(e);if(o===null)return a;e=B(o,i);let s=`<a href="`+e+`"`;return t&&(s+=` title="`+B(t)+`"`),s+=`>`+a+`</a>`,s}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=bt(e);if(i===null)return B(n);e=i;let a=`<img src="${B(e)}" alt="${B(n)}"`;return t&&(a+=` title="${B(t)}"`),a+=`>`,a}text(e){return`tokens`in e&&e.tokens?this.parser.parseInline(e.tokens):`escaped`in e&&e.escaped?e.text:B(e.text)}},jt=class{parser;strong({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}em({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}codespan({text:e}){return e}del({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}html({text:e}){return e}text({text:e}){return e}link({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}image({text:e,tokens:t}){return t?this.parser.parseInline(t,this):e}br(){return`
`}checkbox({raw:e}){return e}},Y=class e{options;renderer;textRenderer;constructor(e){this.options=e||S,this.options.renderer=this.options.renderer||new J,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new jt,this.textRenderer.parser=this}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){this.renderer.parser=this;let t=``;for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(n!==!1||![`space`,`hr`,`heading`,`code`,`table`,`blockquote`,`list`,`checkbox`,`html`,`def`,`paragraph`,`text`].includes(e.type)){t+=n===!1?``:n??``;continue}}let i=r;switch(i.type){case`space`:t+=this.renderer.space(i);break;case`hr`:t+=this.renderer.hr(i);break;case`heading`:t+=this.renderer.heading(i);break;case`code`:t+=this.renderer.code(i);break;case`table`:t+=this.renderer.table(i);break;case`blockquote`:t+=this.renderer.blockquote(i);break;case`list`:t+=this.renderer.list(i);break;case`checkbox`:t+=this.renderer.checkbox(i);break;case`html`:t+=this.renderer.html(i);break;case`def`:t+=this.renderer.def(i);break;case`paragraph`:t+=this.renderer.paragraph(i);break;case`text`:t+=this.renderer.text(i);break;default:{let e=`Token with "`+i.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let n=``;for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let e=this.options.extensions.renderers[i.type].call({parser:this},i);if(e!==!1||![`escape`,`html`,`link`,`image`,`checkbox`,`strong`,`em`,`codespan`,`br`,`del`,`text`].includes(i.type)){n+=e===!1?``:e??``;continue}}let a=i;switch(a.type){case`escape`:n+=t.text(a);break;case`html`:n+=t.html(a);break;case`link`:n+=t.link(a);break;case`image`:n+=t.image(a);break;case`checkbox`:n+=t.checkbox(a);break;case`strong`:n+=t.strong(a);break;case`em`:n+=t.em(a);break;case`codespan`:n+=t.codespan(a);break;case`br`:n+=t.br(a);break;case`del`:n+=t.del(a);break;case`text`:n+=t.text(a);break;default:{let e=`Token with "`+a.type+`" type was not found.`;if(this.options.silent)return console.error(e),``;throw Error(e)}}}return n}},X=class{options;block;constructor(e){this.options=e||S}static passThroughHooks=new Set([`preprocess`,`postprocess`,`processAllTokens`,`emStrongMask`]);static passThroughHooksRespectAsync=new Set([`preprocess`,`postprocess`,`processAllTokens`]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(e=this.block){return e?q.lex:q.lexInline}provideParser(e=this.block){return e?Y.parse:Y.parseInline}};function Z(e,t){if(Array.isArray(t))for(let n=0;n<t.length;n++)e.push(t[n]);else e.push(t)}var Q=new class{defaults=de();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=Y;Renderer=J;TextRenderer=jt;Lexer=q;Tokenizer=K;Hooks=X;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(Z(n,t.call(this,r)),r.type){case`table`:{let e=r;for(let r of e.header)Z(n,this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)Z(n,this.walkTokens(e.tokens,t));break}case`list`:{let e=r;Z(n,this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let i=e[r].flat(1/0);Z(n,this.walkTokens(i,t))}):e.tokens&&Z(n,this.walkTokens(e.tokens,t))}}return n}use(...e){let t=this.defaults.extensions||{renderers:Object.create(null),childTokens:Object.create(null)};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw Error(`extension name required`);if(`renderer`in e){let n=t.renderers[e.name];n?t.renderers[e.name]=function(...t){let r=e.renderer.apply(this,t);return r===!1&&(r=n.apply(this,t)),r}:t.renderers[e.name]=e.renderer}if(`tokenizer`in e){if(!e.level||e.level!==`block`&&e.level!==`inline`)throw Error(`extension level must be 'block' or 'inline'`);let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&(e.level===`block`?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:e.level===`inline`&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}`childTokens`in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new J(this.defaults);for(let n in e.renderer){if(!(n in t))throw Error(`renderer '${n}' does not exist`);if([`options`,`parser`].includes(n))continue;let r=n,i=e.renderer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n===!1?``:n??``}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new K(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw Error(`tokenizer '${n}' does not exist`);if([`options`,`rules`,`lexer`].includes(n))continue;let r=n,i=e.tokenizer[r],a=t[r];t[r]=(...e)=>{let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new X;for(let n in e.hooks){if(!(n in t))throw Error(`hook '${n}' does not exist`);if([`options`,`block`].includes(n))continue;let r=n,i=e.hooks[r],a=t[r];t[r]=X.passThroughHooks.has(n)?e=>{if(t.options.async&&X.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await i.call(t,e);return a.call(t,n)})();let r=i.call(t,e);return a.call(t,r)}:(...e)=>{if(t.options.async)return(async()=>{let n=await i.apply(t,e);return n===!1&&(n=await a.apply(t,e)),n})();let n=i.apply(t,e);return n===!1&&(n=a.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return Z(n,r.call(this,e)),t&&Z(n,t.call(this,e)),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return q.lex(e,t??this.defaults)}parser(e,t){return Y.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},i={...this.defaults,...r},a=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&r.async===!1)return a(Error(`marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.`));if(typeof t>`u`||t===null)return a(Error(`marked(): input parameter is undefined or null`));if(typeof t!=`string`)return a(Error(`marked(): input parameter is of type `+Object.prototype.toString.call(t)+`, string expected`));if(i.hooks&&(i.hooks.options=i,i.hooks.block=e),i.async)return(async()=>{let n=i.hooks?await i.hooks.preprocess(t):t,r=await(i.hooks?await i.hooks.provideLexer(e):e?q.lex:q.lexInline)(n,i),a=i.hooks?await i.hooks.processAllTokens(r):r;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let o=await(i.hooks?await i.hooks.provideParser(e):e?Y.parse:Y.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(o):o})().catch(a);try{i.hooks&&(t=i.hooks.preprocess(t));let n=(i.hooks?i.hooks.provideLexer(e):e?q.lex:q.lexInline)(t,i);i.hooks&&(n=i.hooks.processAllTokens(n)),i.walkTokens&&this.walkTokens(n,i.walkTokens);let r=(i.hooks?i.hooks.provideParser(e):e?Y.parse:Y.parseInline)(n,i);return i.hooks&&(r=i.hooks.postprocess(r)),r}catch(e){return a(e)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let e=`<p>An error occurred:</p><pre>`+B(n.message+``,!0)+`</pre>`;return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}};function $(e,t){return Q.parse(e,t)}$.options=$.setOptions=function(e){return Q.setOptions(e),$.defaults=Q.defaults,fe($.defaults),$},$.getDefaults=de,$.defaults=S;function Mt(...e){return Q.use(...e),$.defaults=Q.defaults,fe($.defaults),$}$.use=Mt,$.walkTokens=function(e,t){return Q.walkTokens(e,t)},$.parseInline=Q.parseInline,$.Parser=Y,$.parser=Y.parse,$.Renderer=J,$.TextRenderer=jt,$.Lexer=q,$.lexer=q.lex,$.Tokenizer=K,$.Hooks=X,$.parse=$,$.options,$.setOptions,$.walkTokens,$.parseInline,Y.parse,q.lex;var Nt=Object.assign({"../../../docs/model-cards/3dti.md":ie,"../../../docs/model-cards/broadening.md":ae,"../../../docs/model-cards/conductive.md":oe,"../../../docs/model-cards/hearing-aid.md":se,"../../../docs/model-cards/jitter.md":ce,"../../../docs/model-cards/msbg.md":le,"../../../docs/model-cards/whis.md":ue}),Pt=e=>e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`);function Ft(e,t){let n=(t.match(/^#\s+(.*)$/m)?.[1]??e).replace(/^Model card:\s*/i,``).replace(/^./,e=>e.toUpperCase()),r=t.replace(/^#\s+.*$/m,``).replace(/^Citation keys refer to `references\/references\.bib`\.?\s*$/m,``),i=new Set;return{slug:e,title:n,html:$.parse(r,{async:!1}).replace(/<code>([A-Za-z0-9_:-]+)<\/code>/g,(e,t)=>_.has(t)?(i.add(t),`<a class="cite" href="../#ref-${t}" title="${Pt(x(t).text)}">${Pt(b(t))}</a>`):e).replace(/href="([a-z0-9-]+)\.md(#[^"]*)?"/g,(e,t,n=``)=>`href="../${t}/${n}"`),keys:[...i]}}var It=[`msbg`,`whis`,`3dti`,`hearing-aid`,`conductive`,`broadening`,`jitter`],Lt=Object.entries(Nt).map(([e,t])=>Ft(e.split(`/`).pop().replace(/\.md$/,``),t)).sort((e,t)=>It.indexOf(e.slug)-It.indexOf(t.slug));export{x as a,b as i,re as n,_ as r,Lt as t};