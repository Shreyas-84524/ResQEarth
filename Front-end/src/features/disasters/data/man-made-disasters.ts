import type { DisasterGuide } from "../types/knowledge";

export const MAN_MADE_DISASTER_GUIDES: DisasterGuide[] = [
  {
    slug: "chemical-leak",
    title: "Chemical Leaks & Toxic Gas Releases",
    category: "man-made",
    shortDescription: "Accidental or uncontrolled release of hazardous toxic industrial chemicals into the atmosphere, water, or soil.",
    iconName: "Biohazard",
    severityBaseline: "CRITICAL",
    bannerDescription: "Toxic plume isolation, upwind evacuation protocols, shelter-in-place guidelines, and Major Accident Hazard (MAH) safety.",
    definition: "A chemical leak is the unintentional escape of hazardous, flammable, or toxic chemicals (liquids, vapors, or gases) from industrial facilities, storage tanks, pipelines, or transport tankers, posing imminent health hazards to surrounding populations and ecosystems.",
    causes: [
      "Equipment failure: rupture of storage vessels, corroded pipeline valves, or seal blowouts.",
      "Human operational errors during hazardous chemical transfer or batch reactions.",
      "Inadequate maintenance of refrigeration or scrubber safety systems.",
      "Transport accidents involving road tankers or freight trains carrying hazardous materials.",
    ],
    environmentalFactors: [
      "Wind direction and atmospheric speed dictating toxic vapor plume dispersal trajectories.",
      "Atmospheric boundary layer temperature inversions trapping heavy gases close to ground level.",
      "Ambient humidity interacting with hygroscopic toxic gases (e.g. creating acidic fogs).",
    ],
    warningSigns: [
      "Pungent, irritating, or unusual chemical odors (e.g., rotten egg, bitter almond, chlorine smell).",
      "Immediate stinging sensation in eyes, coughing, throat burning, or respiratory distress.",
      "Sudden localized dying of birds, fish, or vegetation near an industrial zone.",
      "Industrial plant sirens (Continuous high-low pitch indicates off-site emergency).",
    ],
    humanImpacts: [
      "Acute toxic inhalation injuries: chemical pulmonary edema, asphyxiation, and respiratory failure.",
      "Severe chemical burns to skin and corneal damage leading to blindness.",
      "Mass panic and stampedes during uncontrolled evacuation.",
      "Long-term chronic carcinogenic, neurological, and mutagenic health impacts.",
    ],
    environmentalImpacts: [
      "Contamination of freshwater bodies and municipal water supplies with hazardous persistent chemicals.",
      "Massive fish kills and death of terrestrial wildlife.",
      "Soil toxicity requiring extensive bio-remediation.",
    ],
    preventionStrategies: [
      "Enforcement of the Manufacture, Storage and Import of Hazardous Chemical (MSIHC) Rules, 1989.",
      "Mandatory on-site and off-site emergency response plans by Major Accident Hazard (MAH) units.",
      "Establishment of multi-tier automatic leak detection sensors and neutralization scrubber towers.",
      "Enforcement of buffer green belts between industrial zones and residential colonies.",
    ],
    phases: {
      before: [
        "Familiarize with nearby chemical plant warning sirens and designated off-site emergency assembly areas.",
        "Keep wet towels, N95 / gas respirators, and airtight sealing tapes in home emergency kits.",
      ],
      during: [
        "If instructed to evacuate, MOVE IMMEDIATELY CROSSWIND OR UPWIND (at a 90-degree angle to the direction the wind is blowing). Never move downwind of a chemical plume.",
        "Cover mouth and nose with a thick, DAMP cloth or wet towel (water absorbs many water-soluble toxic gases like ammonia and chlorine).",
        "If shelter-in-place is advised: Go indoors immediately, close all doors, windows, and vents, and seal gaps with wet towels or duct tape. Turn off all AC units and ventilation fans.",
        "Move to an upper floor if the gas is heavier than air (e.g. Chlorine, Methyl Isocyanate), or ground floor if lighter than air (e.g. Ammonia, Methane).",
      ],
      after: [
        "Discard clothing that came into contact with toxic chemical vapors; seal in plastic bags.",
        "Wash body thoroughly with copious clean running water and mild soap.",
        "Do not consume exposed food, tap water, or produce from nearby kitchen gardens until cleared by pollution control authorities.",
      ],
    },
    emergencyKit: [
      { item: "Multi-gas respirator / Half-face particulate mask", reason: "Filtering acute toxic inhalants", essential: true },
      { item: "Chemical splash goggles", reason: "Preventing severe corneal acid/base burns", essential: true },
      { item: "Duct tape & heavy plastic sheeting", reason: "Sealing room windows for shelter-in-place", essential: true },
      { item: "Sterile eyewash saline solution", reason: "Flushing chemical irritants from eyes", essential: true },
    ],
    whatNotToDo: [
      "DO NOT run downwind in the direction the chemical cloud is moving.",
      "DO NOT stay in low-lying basements or depressions if heavy gas is released.",
      "DO NOT ignite matches, lighters, or operate light switches in areas with flammable gas leaks.",
      "DO NOT touch liquid chemical spills without specialized personal protective equipment (PPE).",
    ],
    officialHelplines: [
      { agency: "National Emergency Service", phone: "112", note: "Immediate HAZMAT response" },
      { agency: "Fire & Rescue HAZMAT Unit", phone: "101", note: "Chemical containment" },
      { agency: "NDRF Chemical & Biological Wing", phone: "1078", note: "Specialized national CBRN response" },
    ],
    officialResources: [
      { name: "NDMA Chemical (Industrial) Disaster Guidelines", url: "https://ndma.gov.in", agency: "NDMA" },
      { name: "Central Pollution Control Board (CPCB) Hazard Division", url: "https://cpcb.nic.in", agency: "CPCB" },
    ],
    references: [
      { title: "National Disaster Management Guidelines - Chemical (Industrial) Disasters", source: "NDMA", year: "2007" },
      { title: "Chemical Accident Emergency Management in India", source: "Ministry of Environment, Forest and Climate Change", year: "2018" },
    ],
  },
  {
    slug: "industrial-accident",
    title: "Industrial Accidents & Factory Explosions",
    category: "man-made",
    shortDescription: "Catastrophic structural collapses, boiler explosions, and hazardous material failures in industrial processing facilities.",
    iconName: "Factory",
    severityBaseline: "HIGH",
    bannerDescription: "Factory safety protocols, industrial blast isolation, and industrial workplace safety frameworks.",
    definition: "An industrial accident is an unforeseen catastrophic event occurring within an industrial plant, factory, or construction site involving explosive blast overpressure, high-pressure boiler ruptures, structural failure, or toxic spillages.",
    causes: [
      "Boiler overpressure explosions from faulty pressure relief valves and feedwater failure.",
      "Dust explosions in grain silos, coal pulverizers, and pharmaceutical powder processing units.",
      "Violation of occupational health and safety regulations.",
      "Inadequate thermal runaway cooling in chemical synthesis reactors.",
    ],
    environmentalFactors: [
      "High ambient temperatures increasing volatility of stored flammable solvents.",
      "Enclosed plant geometry amplifying blast shockwaves.",
    ],
    warningSigns: [
      "Rapid spikes in reactor pressure/temperature gauge telemetry.",
      "Hissing sounds from high-pressure relief lines or steam leaks.",
      "Plant emergency evacuation sirens sounding.",
    ],
    humanImpacts: [
      "Blast trauma, shrapnel penetration injuries, and third-degree thermal burns.",
      "Fatalities among factory floor operators and surrounding residential neighborhoods.",
    ],
    environmentalImpacts: [
      "Emission of heavy particulate smoke, unburned hydrocarbons, and dioxins.",
      "Contamination of industrial effluent drainage canals.",
    ],
    preventionStrategies: [
      "Regular third-party safety audits and non-destructive testing (NDT) of pressure vessels.",
      "Installation of automated deluge water sprinkler systems and blast-resistant control rooms.",
    ],
    phases: {
      before: [
        "Familiarize with all factory emergency exit routes and muster points.",
        "Ensure personal protective equipment (PPE) is worn at all times on factory floors.",
      ],
      during: [
        "Trigger the nearest manual call point fire alarm and evacuate along marked green safety corridors.",
        "Do not stop to collect personal belongings; assist injured coworkers if safe to do so.",
        "Assemble at the designated outdoor muster station for headcount verification.",
      ],
      after: [
        "Do not re-enter the plant until structural engineers and safety inspectors declare it safe.",
        "Report any uncontained chemical leak or smoldering hot spot to industrial safety officers immediately.",
      ],
    },
    emergencyKit: [
      { item: "Industrial burn dressing kit with sterile hydrogel", reason: "Immediate thermal burn management", essential: true },
      { item: "Safety hardhat and high-visibility reflective vest", reason: "Protection from falling debris", essential: true },
      { item: "Heavy-duty leather safety work gloves", reason: "Protection from sharp metal shrapnel and hot surfaces", essential: true },
    ],
    whatNotToDo: [
      "DO NOT use elevators during factory fires or explosions.",
      "DO NOT re-enter burning plant buildings to retrieve equipment or valuables.",
    ],
    officialHelplines: [
      { agency: "Fire & Emergency Services", phone: "101", note: "Industrial fire suppression" },
      { agency: "National Emergency Helpline", phone: "112", note: "Universal SOS" },
    ],
    officialResources: [
      { name: "Directorate General Factory Advice Service and Labour Institutes (DGFASLI)", url: "https://dgfasli.gov.in", agency: "MoL&E" },
    ],
    references: [
      { title: "Factories Act, 1948 and Model Safety Rules", source: "Government of India", year: "2020" },
    ],
  },
  {
    slug: "nuclear-emergency",
    title: "Nuclear & Radiological Emergencies",
    category: "man-made",
    shortDescription: "Accidental release of radioactive fission products from nuclear reactors, fuel cycle facilities, or orphan radiation sources.",
    iconName: "Radioactive",
    severityBaseline: "CRITICAL",
    bannerDescription: "Atomic Energy Regulatory Board (AERB) protocols, radiation shielding, potassium iodide prophylaxis, and decontamination.",
    definition: "A nuclear or radiological emergency is an event involving the loss of control over nuclear materials or radioactive radiation sources resulting in potential radiation exposure to workers or radioactive fallout release into the environment.",
    causes: [
      "Loss of Core Coolant Accident (LOCA) in commercial nuclear power plants.",
      "Mishandling of orphan industrial radiographic sources (e.g. Cobalt-60, Iridium-192).",
      "Transportation accidents involving radioactive isotope flasks.",
    ],
    environmentalFactors: [
      "Upper-level wind streams transporting radioactive gaseous iodine and cesium plumes across state borders.",
      "Rainfall washing airborne radioactive isotopes onto agricultural soil and surface reservoirs (wet deposition).",
    ],
    warningSigns: [
      "Radiation detection monitor alarms (Geiger-Muller counters, portal radiation monitors).",
      "Off-site nuclear emergency sirens and Atomic Energy Regulatory Board (AERB) alerts.",
    ],
    humanImpacts: [
      "Acute Radiation Syndrome (ARS) resulting in bone marrow depression, gastrointestinal damage, and skin erythema.",
      "Elevated long-term risks of thyroid cancer, leukemia, and solid organ tumors.",
    ],
    environmentalImpacts: [
      "Decades-long radioactive contamination of topsoil, dairy supply chains, and surface waters with Cesium-137 and Strontium-90.",
      "Bio-accumulation of radio-nuclides in aquatic flora, fauna, and riparian wetlands.",
    ],
    preventionStrategies: [
      "Multi-barrier defense-in-depth engineering in nuclear reactors with reinforced containment domes.",
      "AERB strict regulatory oversight and continuous environmental radiation monitoring networks (IERMON).",
      "Regular conduct of off-site emergency drills within 16 km Emergency Planning Zones (EPZ).",
    ],
    phases: {
      before: [
        "Know your distance from nearby nuclear installations and identify designated off-site evacuation routes.",
        "Store N95 masks, raincoats, and sealed non-perishable canned food.",
      ],
      during: [
        "SHELTER IN PLACE: Go inside an interior room of a heavy brick or concrete building. Close all windows, doors, and AC vents.",
        "Follow the three fundamental radiation protection principles: **TIME, DISTANCE, SHIELDING** (Minimize exposure time, maximize distance from source, place heavy mass shielding between you and radiation).",
        "Consume Potassium Iodide (KI) tablets ONLY if officially directed by public health authorities to block radioactive iodine uptake in the thyroid gland.",
      ],
      after: [
        "Remove outer clothing before entering living areas and place in sealed plastic bags.",
        "Shower with lukewarm water and soap (do not scrub skin abrasively).",
        "Drink only bottled water and eat canned food; avoid fresh leafy vegetables and milk from exposed regions.",
      ],
    },
    emergencyKit: [
      { item: "Potassium Iodide (KI) stable tablets (if living in EPZ)", reason: "Thyroid gland radiation protection", essential: true },
      { item: "Impermeable plastic rain poncho & rubber gloves", reason: "Preventing skin contact with radioactive fallout", essential: true },
      { item: "Sealed canned food & bottled drinking water", reason: "Food security free from fallout contamination", essential: true },
    ],
    whatNotToDo: [
      "DO NOT consume Potassium Iodide without explicit health department instructions.",
      "DO NOT leave concrete shelter until radiation monitoring teams declare background levels safe.",
      "DO NOT consume fresh dairy or open well water in fallout zones.",
    ],
    officialHelplines: [
      { agency: "Crisis Management Group (DAE)", phone: "022-22026616", note: "Department of Atomic Energy Control" },
      { agency: "National Emergency Service", phone: "112", note: "CBRN Emergency response" },
    ],
    officialResources: [
      { name: "Atomic Energy Regulatory Board (AERB)", url: "https://aerb.gov.in", agency: "AERB" },
      { name: "Bhabha Atomic Research Centre (BARC) Radiation Safety", url: "https://barc.gov.in", agency: "BARC" },
    ],
    references: [
      { title: "National Disaster Management Guidelines: Management of Nuclear and Radiological Emergencies", source: "NDMA", year: "2009" },
    ],
  },
  {
    slug: "biological-emergency",
    title: "Biological Emergencies & Epidemic Outbreaks",
    category: "man-made",
    shortDescription: "Rapid spread of high-consequence pathogenic biological agents, epidemic disease outbreaks, or bioterrorism threats.",
    iconName: "ShieldAlert",
    severityBaseline: "HIGH",
    bannerDescription: "National Centre for Disease Control (NCDC) surveillance, infection control, quarantine protocols, and personal hygiene.",
    definition: "A biological emergency involves the accidental or deliberate release of dangerous pathogens (viruses, bacteria, toxins) or the rapid epidemic propagation of novel zoonotic infectious diseases overwhelming public healthcare capacity.",
    causes: [
      "Zoonotic spillover of novel respiratory or hemorrhagic pathogens from animal hosts to humans.",
      "Laboratory containment breaches involving Biosafety Level 3/4 (BSL-3/BSL-4) biological agents.",
      "Deliberate bioterrorist release of weaponized biological agents (e.g. Anthrax, Smallpox).",
    ],
    environmentalFactors: [
      "High population density and crowded urban mass transit networks accelerating droplet transmission.",
      "Deforestation and encroachment into wildlife ecosystems increasing animal-human interface contact.",
    ],
    warningSigns: [
      "Unusual cluster of acute respiratory distress, severe fever, or hemorrhagic symptoms reported by hospitals.",
      "National Centre for Disease Control (NCDC) / Integrated Disease Surveillance Programme (IDSP) health advisories.",
    ],
    humanImpacts: [
      "High human morbidity, ICU hospitalization surges, and mortality across vulnerable demographics.",
      "Overwhelming of healthcare infrastructure, oxygen supply shortages, and healthcare worker infections.",
      "Severe economic disruptions from quarantine lockdowns.",
    ],
    environmentalImpacts: [
      "Generation of massive volumes of hazardous infectious biomedical waste.",
      "Contamination of municipal wastewater systems with viral fragments.",
    ],
    preventionStrategies: [
      "Robust One Health surveillance monitoring wildlife, veterinary, and human health databases.",
      "Strict enforcement of Biosafety and Biosecurity standards in research laboratories.",
    ],
    phases: {
      before: [
        "Ensure routine immunizations and booster vaccinations are up to date.",
        "Maintain adequate stock of hand sanitizers, certified masks (N95), and disinfectants.",
      ],
      during: [
        "Wear certified high-filtration masks (N95/FFP2) in all indoor public spaces and medical facilities.",
        "Practice rigorous hand hygiene: wash hands with soap and water for at least 20 seconds or use 70% alcohol hand rub.",
        "Maintain physical distancing and avoid poorly ventilated, crowded indoor environments.",
        "Isolate immediately upon experiencing symptoms and consult registered medical practitioners.",
      ],
      after: [
        "Disinfect high-touch surfaces regularly using approved chlorine-based or alcohol solutions.",
        "Safely dispose of used masks and biomedical waste in covered yellow biohazard bags.",
      ],
    },
    emergencyKit: [
      { item: "Box of N95 particulate filtering respirators", reason: "Respiratory pathogen inhalation barrier", essential: true },
      { item: "70% Isopropyl alcohol hand sanitizer (500ml)", reason: "Contact transmission disinfection", essential: true },
      { item: "Digital pulse oximeter & thermometer", reason: "Monitoring oxygen saturation and fever", essential: true },
    ],
    whatNotToDo: [
      "DO NOT self-medicate with unprescribed antibiotics or unverified remedies.",
      "DO NOT conceal travel history or infection symptoms from public health authorities.",
      "DO NOT attend large social gatherings while experiencing fever or cough.",
    ],
    officialHelplines: [
      { agency: "Ministry of Health Emergency Helpline", phone: "1075", note: "National health toll-free" },
      { agency: "National Emergency Ambulance", phone: "108", note: "Emergency medical transport" },
    ],
    officialResources: [
      { name: "National Centre for Disease Control (NCDC)", url: "https://ncdc.gov.in", agency: "MoHFW" },
      { name: "Indian Council of Medical Research (ICMR)", url: "https://icmr.gov.in", agency: "ICMR" },
    ],
    references: [
      { title: "National Disaster Management Guidelines: Management of Biological Disasters", source: "NDMA", year: "2008" },
    ],
  },
  {
    slug: "urban-fire",
    title: "Urban Fires & High-Rise Building Fires",
    category: "man-made",
    shortDescription: "Uncontrolled combustion in commercial complexes, residential high-rises, informal settlements, and crowded markets.",
    iconName: "Flame",
    severityBaseline: "HIGH",
    bannerDescription: "National Building Code (NBC) Part 4 fire safety, fire extinguisher classes (A/B/C/D/K), high-rise stairwell evacuation.",
    definition: "An urban fire is an uncontrolled combustion event in residential, commercial, or mixed-use urban buildings, posing severe smoke asphyxiation and structural collapse threats in densely populated urban fabrics.",
    causes: [
      "Electrical short circuits and overloaded wiring in aging or unauthorized electrical panels.",
      "Improper storage of combustible materials near heat sources or LPG cylinders.",
      "Non-compliance with National Building Code (NBC) fire exit and staircase compartmentation standards.",
    ],
    environmentalFactors: [
      "High ambient summer heat drying building furnishings and facade cladding materials.",
      "Narrow congested streets preventing large fire tender trucks from reaching fire scenes.",
    ],
    warningSigns: [
      "Smell of burning electrical insulation or plastic wiring.",
      "Smoke detector alarms sounding; activation of automatic fire sprinklers.",
      "Flickering lights or repeated circuit breaker trips.",
    ],
    humanImpacts: [
      "Fatalities caused primarily by smoke inhalation (Carbon Monoxide and Hydrogen Cyanide poisoning) rather than direct flames.",
      "Severe burn trauma and crushing injuries in blocked stairwell stampedes.",
    ],
    environmentalImpacts: [
      "Heavy toxic smoke plumes containing carbon black, dioxins, and VOCs.",
      "Deposition of toxic soot and ash runoff into municipal stormwater drains.",
    ],
    preventionStrategies: [
      "Strict compliance with NBC 2016 Part 4 Fire and Life Safety regulations.",
      "Installation and bi-annual testing of automatic smoke alarms, wet riser systems, and yard hydrants.",
      "Keeping fire escape stairways completely free of stored boxes, shoes, and obstacles.",
    ],
    phases: {
      before: [
        "Locate the two nearest fire escape stairways on your floor (never rely solely on a single exit).",
        "Install working smoke alarms in residential premises and keep a 4kg ABC dry powder fire extinguisher accessible.",
        "Memorize the PASS technique: **P**ull pin, **A**im at base of fire, **S**queeze trigger, **S**weep side-to-side.",
      ],
      during: [
        "Trigger the building manual fire alarm immediately and dial 101.",
        "Evacuate via stairs; NEVER USE ELEVATORS (power may cut off, trapping occupants in burning shafts).",
        "If smoke is present, **CRAWL LOW UNDER SMOKE** on hands and knees (clean breathable air remains near floor).",
        "Feel door handles with the back of your hand before opening; if hot, do not open — use alternate exit.",
        "If trapped in a room: Seal door gaps with wet towels, open a window slightly for air, and signal for help with a bright cloth.",
      ],
      after: [
        "Do not re-enter a fire-damaged building until certified safe by the Fire Brigade.",
        "Check family members for smoke inhalation symptoms; seek immediate medical assessment if experiencing coughing or sooty sputum.",
      ],
    },
    emergencyKit: [
      { item: "ABC Dry Chemical Powder Fire Extinguisher (4kg)", reason: "Tackling incipient Class A, B, and C fires", essential: true },
      { item: "Emergency smoke escape hood / filter mask", reason: "Providing 15 minutes of breathable air in smoke", essential: true },
      { item: "Emergency high-decibel whistle & flashlight", reason: "Signaling location to firefighters in heavy smoke", essential: true },
    ],
    whatNotToDo: [
      "DO NOT use elevators during a building fire.",
      "DO NOT throw water on electrical fires or burning oil/grease in kitchen pans (causes violent flare-ups).",
      "DO NOT lock fire exit staircase doors.",
    ],
    officialHelplines: [
      { agency: "Fire & Rescue Emergency Service", phone: "101", note: "24/7 Fire suppression" },
      { agency: "National Emergency Helpline", phone: "112", note: "Unified SOS" },
    ],
    officialResources: [
      { name: "Directorate General of Fire Services (MHA)", url: "https://dgfscdhg.gov.in", agency: "MHA" },
      { name: "Bureau of Indian Standards NBC 2016", url: "https://bis.gov.in", agency: "BIS" },
    ],
    references: [
      { title: "National Building Code of India (NBC 2016) - Part 4: Fire and Life Safety", source: "Bureau of Indian Standards", year: "2016" },
    ],
  },
  {
    slug: "building-collapse",
    title: "Structural Collapses & Building Failures",
    category: "man-made",
    shortDescription: "Sudden structural failure of residential, commercial, or infrastructure edifices due to engineering defects or overload.",
    iconName: "Home",
    severityBaseline: "CRITICAL",
    bannerDescription: "NDRF collapsed structure search and rescue (CSSR), warning signs of structural distress, and void survival.",
    definition: "A building collapse is the sudden catastrophic structural failure of a building's load-bearing elements (columns, beams, foundations), resulting in pancake, V-shape, or cantilever rubble collapse.",
    causes: [
      "Use of substandard construction materials (weak cement ratios, rusted reinforcement steel).",
      "Unauthorized vertical extension of additional floors overloading original foundation design.",
      "Excavation on adjacent plots undermining foundation soil stability.",
      "Severe water seepage and corrosion of reinforcing rebar in aging buildings.",
    ],
    environmentalFactors: [
      "Heavy monsoon waterlogging weakening foundation subsoil bearing capacity.",
      "Seismic ground vibrations from heavy road traffic, piling rigs, or nearby metro rail tunneling.",
    ],
    warningSigns: [
      "Sudden widening diagonal cracks in load-bearing columns or shear walls.",
      "Doors and windows jamming tightly in their frames due to differential structural settlement.",
      "Loud popping, creaking, or groaning sounds from structural beams.",
      "Chunks of concrete plaster (spalling) falling from ceilings exposing rusted rebar.",
    ],
    humanImpacts: [
      "High fatality rates from blunt crush trauma and asphyxiation under heavy concrete slabs.",
      "Severe entrapment of victims within structural rubble voids.",
    ],
    environmentalImpacts: [
      "Rupture of municipal gas and sewer utility connections beneath building footprint.",
      "Generation of hundreds of tons of inert construction and demolition (C&D) rubble clogging urban drainage.",
    ],
    preventionStrategies: [
      "Mandatory structural audits every 5 years for buildings older than 30 years.",
      "Strict municipal demolition of structures declared dilapidated (C-1 Category).",
    ],
    phases: {
      before: [
        "Commission certified structural engineers to audit aging buildings showing column cracks.",
        "Never perform unauthorized structural wall alterations or column removals.",
      ],
      during: [
        "If you hear structural cracking or feel the building tilting, EVACUATE OUTDOORS IMMEDIATELY.",
        "If trapped during collapse: Curl into a tight fetal position next to a large, solid object (sturdy sofa, heavy table) creating a 'Triangle of Life' survivable void.",
        "Protect head and chest; cover nose and mouth with cloth to filter dense concrete dust.",
        "DO NOT light matches or lighters (broken gas pipes create explosive atmospheres).",
      ],
      after: [
        "Stay calm and tap rhythmically on metal pipes or concrete beams with stones to alert rescue search teams.",
        "Shout only when you hear rescuers nearby to avoid exhausting oxygen and inhaling dust.",
      ],
    },
    emergencyKit: [
      { item: "N95 particulate respirator mask", reason: "Preventing concrete dust inhalation", essential: true },
      { item: "Loud rescue whistle", reason: "Acoustic signaling to NDRF canine search teams", essential: true },
      { item: "LED headlamp with extra lithium batteries", reason: "Hands-free illumination in dark collapsed voids", essential: true },
    ],
    whatNotToDo: [
      "DO NOT stay in buildings officially declared structurally unsafe (Category C-1).",
      "DO NOT use open flames or light switches if trapped in rubble.",
    ],
    officialHelplines: [
      { agency: "National Disaster Response Force (NDRF)", phone: "1078", note: "Collapsed Structure Search & Rescue (CSSR)" },
      { agency: "National Emergency Helpline", phone: "112", note: "Unified SOS" },
    ],
    officialResources: [
      { name: "NDRF Collapsed Structure Search & Rescue Division", url: "https://ndrf.gov.in", agency: "NDRF" },
    ],
    references: [
      { title: "Standard Operating Procedures for Collapsed Structure Search and Rescue", source: "NDRF", year: "2019" },
    ],
  },
  {
    slug: "oil-spill",
    title: "Marine & Terrestrial Oil Spills",
    category: "man-made",
    shortDescription: "Accidental discharge of crude or refined petroleum products into marine, coastal, or terrestrial ecosystems.",
    iconName: "Droplet",
    severityBaseline: "HIGH",
    bannerDescription: "National Oil Spill Disaster Contingency Plan (NOS-DCP), Indian Coast Guard containment, and coastal ecosystem protection.",
    definition: "An oil spill is the accidental release of liquid petroleum hydrocarbons into marine waters, coastal estuaries, or terrestrial soil, forming widespread surface oil slicks that coat shorelines and asphyxiate marine life.",
    causes: [
      "Grounding, collision, or hull breach of oil tanker vessels in coastal shipping lanes.",
      "Offshore drilling platform blowouts and subsea pipeline fractures.",
      "Illegal ballast water discharge and tank washing by commercial ships.",
    ],
    environmentalFactors: [
      "Ocean surface currents and tidal cycles determining the drift velocity of oil slicks towards coastal wetlands.",
      "High sea waves breaking oil into emulsified 'chocolate mousse' that is resistant to natural degradation.",
    ],
    warningSigns: [
      "Large iridescent sheen or dark floating slick on ocean surface visible from aerial/satellite surveillance.",
      "Strong petroleum hydrocarbon odor along coastal promenades and beaches.",
      "Oiled birds and dead fish washing ashore.",
    ],
    humanImpacts: [
      "Closure of commercial marine fishing zones, destroying fishermen livelihoods.",
      "Shutdown of coastal desalination plants and nuclear/thermal power plant seawater intakes.",
    ],
    environmentalImpacts: [
      "Catastrophic coating and mortality of seabirds, sea turtles, mangroves, and coral reefs.",
      "Long-term bioaccumulation of polycyclic aromatic hydrocarbons (PAHs) in marine food webs.",
    ],
    preventionStrategies: [
      "Mandatory double-hull vessel construction for all crude oil tankers (MARPOL 73/78).",
      "Indian Coast Guard implementation of the National Oil Spill Disaster Contingency Plan (NOS-DCP).",
    ],
    phases: {
      before: [
        "Ensure coastal ports and oil terminals maintain containment boom barriers and skimmers.",
        "Establish baseline ecological mapping of high-priority sensitive coastal mangrove zones.",
      ],
      during: [
        "Avoid all direct contact with spilled oil, tar balls, and contaminated sea water.",
        "Do not harvest or consume fish, crabs, or shellfish from oil-slicked areas.",
        "Report sightings of oil slicks immediately to the Indian Coast Guard.",
      ],
      after: [
        "Support authorized wildlife rehabilitation centers rescuing oiled marine birds and turtles.",
        "Participate in designated municipal sand sifting and tar ball removal operations with appropriate PPE.",
      ],
    },
    emergencyKit: [
      { item: "Heavy nitrile chemical-resistant gloves", reason: "Safe handling during coastal cleanups", essential: true },
      { item: "Organic vapor respirator mask", reason: "Protection from volatile petroleum fumes", essential: true },
      { item: "Heavy-duty waterproof rubber boots", reason: "Foot protection against toxic hydrocarbon residues", essential: true },
    ],
    whatNotToDo: [
      "DO NOT attempt to swim or boat in oil-slicked marine waters.",
      "DO NOT consume seafood sourced from contaminated coastal zones.",
    ],
    officialHelplines: [
      { agency: "Indian Coast Guard Maritime SAR / Pollution Helpline", phone: "1554", note: "National Oil Spill Contingency Lead" },
      { agency: "National Emergency Service", phone: "112", note: "Unified SOS" },
    ],
    officialResources: [
      { name: "Indian Coast Guard Marine Environment Protection", url: "https://indiancoastguard.gov.in", agency: "ICG" },
    ],
    references: [
      { title: "National Oil Spill Disaster Contingency Plan (NOS-DCP)", source: "Indian Coast Guard", year: "2015" },
    ],
  },
  {
    slug: "transport-accident",
    title: "Major Mass Transport Accidents",
    category: "man-made",
    shortDescription: "High-casualty multi-vehicle pileups, railway derailments, or aviation crashes requiring mass triage.",
    iconName: "Truck",
    severityBaseline: "HIGH",
    bannerDescription: "Highway emergency protocols, train accident response, and Golden Hour emergency triage.",
    definition: "A major transport accident is a high-consequence incident occurring on highways, railway networks, or aviation corridors resulting in mass casualties, structural entrapment, and hazardous debris obstruction.",
    causes: [
      "High-speed multi-vehicle pileups in dense winter fog or severe torrential rain.",
      "Railway track fractures, signal failures, or train derailments/collisions.",
      "Mechanical brake failures on steep mountain ghat roads.",
    ],
    environmentalFactors: [
      "Zero-visibility dense radiation fog on expressways.",
      "Wet, hydroplaning asphalt surfaces during monsoon cloudbursts.",
    ],
    warningSigns: [
      "Dense fog or storm warnings on electronic highway overhead variable message signboards.",
      "Unusual screeching, metal grinding sounds, or severe vibration in moving railway coaches.",
    ],
    humanImpacts: [
      "Multiple trauma casualties requiring immediate **Golden Hour** emergency medical resuscitation.",
      "Protracted extrication operations for passengers pinned in crushed coaches.",
    ],
    environmentalImpacts: [
      "Hazardous fuel leaks from punctured diesel tanks creating ignition and local soil pollution risks.",
      "Spill of hazardous freight cargo onto surrounding highway embankments or agricultural fields.",
    ],
    preventionStrategies: [
      "Deployment of automatic train protection systems (KAVACH) across the Indian Railway network.",
      "Mandatory speed governors and fog-warning electronic systems on major expressways.",
    ],
    phases: {
      before: [
        "Reduce speed drastically and turn on hazard lights/fog lamps when encountering dense highway fog.",
        "Ensure all passengers wear seatbelts at all times.",
      ],
      during: [
        "If involved in a highway pileup: Exit the vehicle immediately and move far behind the highway safety guardrail.",
        "Call National Emergency 112 / Ambulance 108 immediately.",
        "Do not move severely injured victims with suspected spinal trauma unless there is an imminent fire danger.",
      ],
      after: [
        "Cooperate with police and highway patrol traffic diversion teams.",
        "Keep emergency lanes clear for approaching ambulances and heavy hydraulic rescue cranes.",
      ],
    },
    emergencyKit: [
      { item: "High-visibility reflective emergency triangles (x2)", reason: "Warning approaching highway traffic", essential: true },
      { item: "Trauma first aid kit with tourniquets and pressure bandages", reason: "Arresting severe arterial bleeding", essential: true },
      { item: "Emergency window glass breaker & seatbelt cutter tool", reason: "Rapid emergency egress from trapped vehicles", essential: true },
    ],
    whatNotToDo: [
      "DO NOT stand on active highway lanes behind a stalled vehicle.",
      "DO NOT smoke or ignite flares near crashed vehicles with leaking fuel tanks.",
    ],
    officialHelplines: [
      { agency: "National Highway Emergency Helpline", phone: "1033", note: "NHAI Highway response" },
      { agency: "Railway Accident Emergency Service", phone: "139", note: "Indian Railways central helpline" },
      { agency: "National Emergency Ambulance", phone: "108", note: "Mass casualty trauma transport" },
    ],
    officialResources: [
      { name: "National Highways Authority of India (NHAI)", url: "https://nhai.gov.in", agency: "NHAI" },
      { name: "Indian Railways Safety Directorate", url: "https://indianrailways.gov.in", agency: "MoR" },
    ],
    references: [
      { title: "Standard Operating Procedure for Disaster Management on Indian Railways", source: "Ministry of Railways", year: "2018" },
    ],
  },
  {
    slug: "major-pollution",
    title: "Major Environmental Pollution Incidents",
    category: "man-made",
    shortDescription: "Severe air quality crises (AQI > 400), massive toxic industrial effluent discharges, or municipal landfill infernos.",
    iconName: "CloudFog",
    severityBaseline: "MODERATE",
    bannerDescription: "Graded Response Action Plan (GRAP), Air Quality Index (AQI) thresholds, and environmental health protection.",
    definition: "A major pollution incident is an extreme environmental contamination event characterized by dangerous spikes in hazardous air pollutants (PM2.5, PM10, SO2, NOx) or large-scale toxic effluent releases threatening regional public health.",
    causes: [
      "Stubble burning combined with winter meteorological inversions creating severe smog crises across North India.",
      "Landfill fires in massive urban garbage dumps (e.g., Ghazipur, Deonar) emitting carcinogenic dioxins.",
      "Illegal midnight discharge of untreated industrial chemical effluents into rivers and lakes.",
    ],
    environmentalFactors: [
      "Shallow winter atmospheric mixing heights (under 200m) trapping pollutants.",
      "Calm wind speeds (<5 km/h) preventing horizontal pollutant dispersion.",
    ],
    warningSigns: [
      "CPCB Air Quality Index (AQI) entering 'Severe' (>400) or 'Severe+' (>450) categories.",
      "Dense, eye-stinging acrid haze reducing visibility during daylight hours.",
    ],
    humanImpacts: [
      "Acute spikes in asthma attacks, bronchitis, cardiac arrests, and chronic lung damage.",
      "Severe eye irritation, headaches, and systemic inflammatory responses.",
    ],
    environmentalImpacts: [
      "Acid rain formation damaging forest ecosystems, crops, and historical monuments.",
      "Eutrophication and biological dead zones in rivers contaminated by untreated effluents.",
    ],
    preventionStrategies: [
      "Implementation of the Graded Response Action Plan (GRAP) by the Commission for Air Quality Management (CAQM).",
      "Promotion of bio-decomposer solutions for agricultural crop stubble management.",
      "Bioremediation and legacy waste biomining of open urban landfill mounds.",
    ],
    phases: {
      before: [
        "Monitor daily CPCB AQI bulletins (SAMEER App) and plan outdoor activities accordingly.",
        "Equip indoor spaces with certified HEPA air purifiers and seal loose window gaps.",
      ],
      during: [
        "Avoid morning and evening outdoor jogs or heavy physical exertion when AQI exceeds 300 (Very Poor / Severe).",
        "Wear genuine N95 / N99 respirator masks when traveling outside (cloth masks do NOT filter PM2.5 micro-particles).",
        "Keep indoor air clean by avoiding burning incense sticks, mosquito coils, or candles.",
      ],
      after: [
        "Support local municipal recycling and waste segregation initiatives.",
        "Report open garbage burning or industrial black smoke to CPCB SAMEER app.",
      ],
    },
    emergencyKit: [
      { item: "N95 / N99 certified particulate respirator mask", reason: "Filtering microscopic PM2.5 toxic soot", essential: true },
      { item: "Saline lubricating eye drops", reason: "Relieving smog-induced corneal irritation", essential: true },
      { item: "Portable air quality monitor / SAMEER App", reason: "Tracking real-time neighborhood PM2.5 levels", essential: true },
    ],
    whatNotToDo: [
      "DO NOT burn garden leaves, plastic, or municipal solid waste in the open.",
      "DO NOT engage in strenuous outdoor sports during Severe AQI alerts.",
    ],
    officialHelplines: [
      { agency: "Central Pollution Control Board Complaint Cell", phone: "011-43102030", note: "Pollution reporting" },
      { agency: "National Health Helpline", phone: "1075", note: "Respiratory distress advisory" },
    ],
    officialResources: [
      { name: "Central Pollution Control Board (CPCB) National AQI", url: "https://cpcb.nic.in", agency: "CPCB" },
      { name: "Commission for Air Quality Management (CAQM)", url: "https://caqm.nic.in", agency: "CAQM" },
    ],
    references: [
      { title: "Graded Response Action Plan for Delhi-NCR", source: "CAQM & CPCB", year: "2023" },
    ],
  },
];
