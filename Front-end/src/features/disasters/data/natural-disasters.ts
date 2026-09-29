import type { DisasterGuide } from "../types/knowledge";

export const NATURAL_DISASTER_GUIDES: DisasterGuide[] = [
  {
    slug: "flood",
    title: "Riverine & Flash Floods",
    category: "natural",
    shortDescription: "Severe inundation of normally dry land caused by excessive rainfall, river overflow, or dam discharges.",
    iconName: "Waves",
    severityBaseline: "HIGH",
    bannerDescription: "Comprehensive safety guidance for monsoonal river surges, catchment runoff, and flash flooding in India.",
    definition: "A flood is an overflow of water submerging land that is usually dry. In India, riverine and flash floods are primarily triggered by intense southwest monsoon spells, cloudbursts, and rapid upstream river basin discharges.",
    causes: [
      "Heavy prolonged rainfall exceeding regional catchment absorption capacity.",
      "Cloudbursts in Himalayan and Western Ghat terrains triggering localized flash surges.",
      "Siltation of river beds reducing natural discharge cross-sections.",
      "Emergency reservoir and barrage spillway discharges during peak inflow.",
      "Breach of river embankments and levees.",
    ],
    environmentalFactors: [
      "Deforestation and loss of vegetative soil cover in upper catchment basins.",
      "Soil moisture saturation following repeated antecedent rainfall.",
      "Topographical narrowing in river gorges and valleys.",
      "Destruction of riparian wetland floodplains that naturally attenuate flood peaks.",
    ],
    warningSigns: [
      "Rapid, unseasonal rise in nearby river gauge levels.",
      "Sudden muddiness and churning of stream water carrying tree debris.",
      "Central Water Commission (CWC) or IMD Red/Orange flood hydrograph advisories.",
      "Unusual roaring sounds from upstream mountain valleys.",
    ],
    humanImpacts: [
      "Loss of human and livestock lives due to swift water currents.",
      "Displacement of families and inundation of residential colonies.",
      "Submergence of agricultural standing crops causing severe economic hardship.",
      "Waterborne disease outbreaks (Cholera, Leptospirosis, Gastroenteritis).",
    ],
    environmentalImpacts: [
      "Severe topsoil erosion and riverbank degradation.",
      "Contamination of freshwater aquifers and potable groundwater wells with silt and sewage.",
      "Destruction of terrestrial wildlife habitats and biodiversity corridors.",
      "Aquatic ecosystem disruption from hyper-turbid agricultural and industrial runoff.",
    ],
    preventionStrategies: [
      "Afforestation and watershed management in upper river catchments.",
      "Demarcation and enforcement of flood-zoning regulations prohibiting permanent construction in active floodways.",
      "Construction and periodic desiltation of detention basins and check dams.",
      "Restoration of natural wetlands and sponge ecosystems.",
    ],
    phases: {
      before: [
        "Identify nearest community shelter and elevated evacuation routes designated by District Disaster Management Authority (DDMA).",
        "Store important identification cards, property deeds, and medical records in watertight bags.",
        "Clear drainage gullies around residential structures and seal ground-level ventilation grilles.",
        "Prepare an Emergency Disaster Grab Bag (food, potable water, torch, medical kit).",
        "Keep mobile phones and emergency battery banks fully charged.",
      ],
      during: [
        "Evacuate immediately if advised by local administration or NDMA early warning systems.",
        "Never walk, swim, or drive through moving floodwaters (15 cm of moving water can knock down an adult; 30 cm can float a vehicle).",
        "Switch off main electrical circuit breaker and LPG cylinder regulators before leaving.",
        "Stay clear of fallen electric poles, dangling wires, and storm drainage manholes.",
        "If trapped inside a building, move to the highest accessible floor (avoid enclosed attics without roof exits).",
      ],
      after: [
        "Return home only after official safety clearance from local municipal or panchayat authorities.",
        "Do not consume tap water without boiling for at least 10 minutes or using chlorine purification tablets.",
        "Inspect electrical wiring and gas connections with certified technicians before turning on appliances.",
        "Wear rubber boots and thick gloves while cleaning flood silt to prevent leptospirosis and snakebites.",
        "Disinfect all surfaces that came into contact with floodwater.",
      ],
    },
    emergencyKit: [
      { item: "Packaged drinking water (4 liters per person per day)", reason: "Prevents drinking contaminated flood water", essential: true },
      { item: "Waterproof LED flashlight with extra batteries", reason: "Grid power failure during storms", essential: true },
      { item: "First aid kit with antiseptic lotion and bandages", reason: "Treating cuts and abrasions in water", essential: true },
      { item: "Water purification tablets (Chlorine/Halazone)", reason: "Ensuring potable water availability", essential: true },
      { item: "High-calorie non-perishable dry rations", reason: "Food security during isolation", essential: true },
      { item: "Emergency whistle", reason: "Signaling location to rescue boats", essential: true },
      { item: "Waterproof bag for identity cards & documents", reason: "Document protection", essential: true },
    ],
    whatNotToDo: [
      "DO NOT attempt to drive or ride a two-wheeler across inundated bridges or causeways.",
      "DO NOT touch electrical switches, meters, or submerged cables.",
      "DO NOT let children play in floodwater due to contamination and open drain suction risks.",
      "DO NOT spread unverified social media rumors regarding dam breaks or casualty figures.",
      "DO NOT consume flood-contaminated food, raw vegetables, or unboiled water.",
    ],
    officialHelplines: [
      { agency: "National Emergency Response", phone: "112", note: "24/7 Universal SOS" },
      { agency: "NDRF Disaster Rescue Helpline", phone: "1078", note: "National rescue deployment" },
      { agency: "Central Water Commission (CWC) Flood Cell", phone: "1800-180-1551", note: "River hydrograph status" },
    ],
    officialResources: [
      { name: "Central Water Commission Flood Forecasting", url: "https://ffs.india-water.gov.in", agency: "CWC" },
      { name: "NDMA Flood Guidelines & Standard Operating Procedures", url: "https://ndma.gov.in", agency: "NDMA" },
      { name: "IMD River Sub-basin Weather Bulletins", url: "https://mausam.imd.gov.in", agency: "IMD" },
    ],
    references: [
      { title: "National Disaster Management Guidelines: Management of Floods", source: "NDMA, Government of India", year: "2008" },
      { title: "Report on Extreme Hydrometeorological Events in India", source: "Ministry of Earth Sciences", year: "2023" },
    ],
  },
  {
    slug: "urban-flood",
    title: "Urban Flooding & Waterlogging",
    category: "natural",
    shortDescription: "Inundation of built-up urban catchments caused by intense short-duration rainfall overwhelming stormwater drainage.",
    iconName: "Building2",
    severityBaseline: "HIGH",
    bannerDescription: "Urban drainage failure, basement inundation, and transit safety protocols for metropolitan cities.",
    definition: "Urban flooding is the inundation of property and roads in built-up environments caused by heavy rainfall overwhelming stormwater drainage capacity, exacerbated by high paved impervious surface fractions and loss of natural wetlands.",
    causes: [
      "High-intensity short-duration rainfall (e.g. >50 mm/hour) common during monsoon squalls.",
      "Inadequate, undersized, or silted urban stormwater drainage networks.",
      "Excessive concretization and loss of open permeable green spaces.",
      "Encroachment of natural drainage channels, nullahs, and lakes.",
      "Tidal locks preventing gravity discharge into seas or estuaries during high tides.",
    ],
    environmentalFactors: [
      "High urban heat island (UHI) effect enhancing convective cloudbursts.",
      "Impervious surface coverage exceeding 80% in metropolitan core areas.",
      "Destruction of urban mangroves, salt pans, and retention ponds.",
    ],
    warningSigns: [
      "Water accumulation exceeding curb level within 15 minutes of rainfall onset.",
      "Municipal Corporation automatic weather station (AWS) alerts indicating >30 mm/h rain rate.",
      "High tide alerts coinciding with heavy rainfall forecast for coastal cities.",
    ],
    humanImpacts: [
      "Gridlock of metropolitan transit, suburban railways, and arterial road networks.",
      "Submergence of underground parking lots and electrical transformer basements.",
      "Electrocution hazards from submerged streetlight feeder pillars and cables.",
      "Severe economic losses to commercial establishments and residences.",
    ],
    environmentalImpacts: [
      "Discharge of untreated urban sewage, plastics, and petrochemical runoff into coastal waters and rivers.",
      "Contamination of municipal water distribution networks through leaky suction pipes.",
    ],
    preventionStrategies: [
      "Implementation of Sponge City concepts with permeable pavements and rain gardens.",
      "Desiltation and widening of major stormwater drains (nullahs) prior to monsoon.",
      "Installation of automated high-capacity dewatering pumps with back-up generators at low-lying railway subways.",
      "Strict preservation of urban wetlands and natural drainage corridors.",
    ],
    phases: {
      before: [
        "Monitor municipal rain radar and traffic police waterlogging advisories before commuting.",
        "Move vehicles from underground basement garages to elevated multi-level parking decks.",
        "Check that household drain backflow preventers are functioning.",
        "Keep emergency power banks, LED torches, and essential medications handy.",
      ],
      during: [
        "Avoid traveling through flooded underpasses, subways, and low-lying road intersections.",
        "If vehicle stalls in rising water, abandon it immediately and walk to higher sidewalk ground.",
        "Do not touch metal lamp posts, transformer fences, or cable ducts in waterlogged streets.",
        "Stay indoors in office or home if heavy rain coincides with high tide warning.",
      ],
      after: [
        "Check building basement foundations and electrical panel rooms with certified electricians before restoring power.",
        "Safely dispose of water-damaged food and sanitize affected ground-floor premises.",
        "Report blocked stormwater drains or dislodged manhole covers to municipal control room.",
      ],
    },
    emergencyKit: [
      { item: "High-capacity power bank & charging cables", reason: "Prolonged urban power outages", essential: true },
      { item: "Compact waterproof LED flashlight", reason: "Navigating unlit waterlogged streets", essential: true },
      { item: "Rubber rain boots with anti-slip soles", reason: "Safe movement and disease protection", essential: true },
      { item: "Emergency cash (ATMs shut down in floods)", reason: "Cashless payment systems fail offline", essential: true },
    ],
    whatNotToDo: [
      "DO NOT drive into submerged road underpasses where depth cannot be judged.",
      "DO NOT park vehicles near large trees or old masonry walls during heavy downpours.",
      "DO NOT remove municipal drain covers without proper safety barriers and warning cones.",
      "DO NOT wade barefoot through stagnant street water.",
    ],
    officialHelplines: [
      { agency: "National Emergency Service", phone: "112", note: "Unified response" },
      { agency: "Municipal Disaster Control Room", phone: "1916", note: "Metropolitan municipal help" },
    ],
    officialResources: [
      { name: "NDMA Urban Flooding SOP Manual", url: "https://ndma.gov.in", agency: "NDMA" },
      { name: "IMD Nowcast & Radar Doppler Imagery", url: "https://mausam.imd.gov.in", agency: "IMD" },
    ],
    references: [
      { title: "Standard Operating Procedure for Urban Flooding", source: "Ministry of Housing and Urban Affairs", year: "2019" },
    ],
  },
  {
    slug: "cyclone",
    title: "Tropical Cyclones & Storm Surges",
    category: "natural",
    shortDescription: "Severe revolving atmospheric storms with gale-force winds, torrential rains, and devastating coastal storm surges.",
    iconName: "Wind",
    severityBaseline: "CRITICAL",
    bannerDescription: "Coastal evacuation protocols, windstorm resilience, and cyclone categorization standards across India.",
    definition: "A tropical cyclone is a low-pressure weather system with intense inward spiraling winds and torrential rains rotating counter-clockwise in the Northern Hemisphere, generating extreme storm surges along coastal belts of the Bay of Bengal and Arabian Sea.",
    causes: [
      "Sea surface temperatures (SST) exceeding 26.5°C over tropical ocean basins.",
      "High atmospheric moisture combined with low vertical wind shear.",
      "Coriolis force sufficient to induce cyclonic rotation (minimum 5° north of Equator).",
    ],
    environmentalFactors: [
      "Ocean thermal energy buildup in pre-monsoon and post-monsoon seasons.",
      "Shallow bathymetry of northern Bay of Bengal amplifying storm surge heights.",
      "Degradation of coastal mangrove bio-shields that naturally dissipate surge wave energy.",
    ],
    warningSigns: [
      "IMD Cyclone Alert (Yellow, Orange, Red) bulletins issued 48–24 hours prior to landfall.",
      "Rapid drop in barometric pressure accompanied by increasing oceanic swell waves.",
      "Abrupt increase in continuous gale wind speeds with dense overcast overcast cloud bands.",
    ],
    humanImpacts: [
      "Destruction of thatched houses, uprooting of large trees, and collapse of transmission towers.",
      "Catastrophic inundation of coastal villages and agricultural lands by saline storm surges.",
      "Disruption of road, rail, telecommunication, and electrical infrastructure networks.",
    ],
    environmentalImpacts: [
      "Soil salinization rendering coastal agricultural farmlands uncultivable for multiple seasons.",
      "Destruction of coastal estuarine vegetation, bird sanctuaries, and sea turtle nesting beaches.",
    ],
    preventionStrategies: [
      "Establishment and expansion of coastal mangrove green belts and bio-shield plantations.",
      "Construction of multi-purpose cyclone shelters equipped with solar backup power.",
      "Undergrounding of power and communication transmission lines in vulnerable coastal strips.",
      "Enforcement of Coastal Regulation Zone (CRZ) setbacks.",
    ],
    phases: {
      before: [
        "Board up glass windows or apply criss-cross tape to prevent shattering into projectiles.",
        "Trim overhanging tree branches close to houses and secure tin roofs with heavy straps.",
        "Relocate livestock and valuables to multi-purpose cyclone shelters immediately when evacuation is ordered.",
        "Stock 3 days of non-perishable food, potable drinking water, and essential medicines.",
      ],
      during: [
        "Remain inside the strongest interior room away from glass windows.",
        "Keep battery-operated radio tuned to All India Radio or official disaster broadcast channels.",
        "Do not venture out during the 'Eye of the Cyclone' lull, as winds will abruptly resume from the opposite direction with greater ferocity.",
        "Disconnect electrical supply mains and shut off LPG gas cylinders.",
      ],
      after: [
        "Do not leave the shelter until the official 'All Clear' bulletin is issued by NDMA or IMD.",
        "Beware of loose dangling power cables and uprooted trees; report them to utility authorities.",
        "Drink only boiled or chlorinated water to avoid epidemic cholera and waterborne infections.",
      ],
    },
    emergencyKit: [
      { item: "Battery/crank powered emergency radio", reason: "Receiving official bulletins when mobile towers fail", essential: true },
      { item: "Sturdy waterproof LED torch with extra batteries", reason: "Lighting during power grid destruction", essential: true },
      { item: "Heavy-duty ropes and tarpaulin sheets", reason: "Securing damaged roof structures", essential: true },
      { item: "Full first-aid medical kit", reason: "Treating injuries from flying debris", essential: true },
    ],
    whatNotToDo: [
      "DO NOT venture out into the sea or promenade during cyclone warnings.",
      "DO NOT step out during the temporary calm eye of the storm.",
      "DO NOT stay in temporary or thatched structures along the direct landfall path.",
      "DO NOT spread speculative landfall track rumors not sourced from IMD bulletins.",
    ],
    officialHelplines: [
      { agency: "National Emergency Helpline", phone: "112", note: "24/7 Unified SOS" },
      { agency: "Coast Guard Maritime SAR Helpline", phone: "1554", note: "Maritime search & rescue" },
      { agency: "NDMA Control Room", phone: "011-26701728", note: "National coordination" },
    ],
    officialResources: [
      { name: "IMD National Cyclone Warning Centre", url: "https://rsmcnewdelhi.imd.gov.in", agency: "IMD" },
      { name: "INCOIS Ocean State & Storm Surge Bulletins", url: "https://incois.gov.in", agency: "INCOIS" },
    ],
    references: [
      { title: "National Disaster Management Guidelines: Management of Cyclones", source: "NDMA", year: "2008" },
      { title: "Cyclone Warning Services in India", source: "India Meteorological Department", year: "2021" },
    ],
  },
  {
    slug: "earthquake",
    title: "Earthquakes & Seismic Ground Shaking",
    category: "natural",
    shortDescription: "Sudden shaking of the Earth's crust caused by tectonic fault rupture, release of strain energy, or volcanic movement.",
    iconName: "Activity",
    severityBaseline: "CRITICAL",
    bannerDescription: "Drop, Cover, and Hold On protocols, seismic zones of India, and post-quake structural safety.",
    definition: "An earthquake is the sudden, rapid shaking of the ground caused by the release of accumulated elastic strain energy along geological fault lines in the Earth's lithosphere, propagating as seismic P, S, and surface waves.",
    causes: [
      "Tectonic plate subduction and continental collision (e.g. Indian Plate colliding with the Eurasian Plate at ~5 cm/year).",
      "Stress release along intra-plate fault systems (e.g. Narmada-Son lineament, Kutch rift).",
      "Reservoir-induced seismicity (RIS) in large dam impoundment zones.",
    ],
    environmentalFactors: [
      "Soil liquefaction in high water-table sandy and alluvium plains during prolonged shaking.",
      "Co-seismic landslide initiation in steep mountainous slopes.",
      "Subsidence or permanent elevation of coastal and riverine floodplains.",
    ],
    warningSigns: [
      "Earthquakes occur without reliable prior scientific warnings; immediate sensation is sudden vertical jolting followed by rolling lateral shaking.",
      "Rattling of windows, swinging of chandeliers, and loud rumbling sound from beneath the ground.",
    ],
    humanImpacts: [
      "Structural collapse of unreinforced masonry buildings and soft-story parking basements.",
      "Severe trauma, crushing injuries, and casualties trapped under debris.",
      "Rupture of municipal water, gas, and electrical utility lines causing secondary urban fires.",
    ],
    environmentalImpacts: [
      "Alteration of groundwater table levels, spring flows, and river channel paths.",
      "Submarine fault ruptures triggering destructive trans-oceanic tsunamis.",
    ],
    preventionStrategies: [
      "Mandatory compliance with Bureau of Indian Standards seismic design codes (IS 1893, IS 4326).",
      "Seismic retrofitting of vulnerable lifelines, hospitals, schools, and bridges in Seismic Zones IV and V.",
      "Microzonation mapping of urban centers to identify liquefaction-prone soils.",
    ],
    phases: {
      before: [
        "Fasten heavy furniture, bookshelves, and water heaters firmly to structural wall studs.",
        "Practice regular 'Drop, Cover, and Hold On' earthquake drills with household members.",
        "Identify safe interior spots: beneath sturdy tables or against interior load-bearing walls.",
        "Know the location of main gas shut-off valves and electrical circuit breakers.",
      ],
      during: [
        "DROP down onto your hands and knees.",
        "COVER your head and neck underneath a sturdy table or desk.",
        "HOLD ON to your shelter until shaking completely stops.",
        "If outdoors, move to an open area away from tall buildings, glass facades, and power poles.",
        "DO NOT use elevators; DO NOT rush into stairwells while shaking is in progress.",
      ],
      after: [
        "Expect aftershocks; drop, cover, and hold on whenever tremors recur.",
        "Check for gas leaks by smell; do not light matches, candles, or electrical switches if gas is suspected.",
        "Wear sturdy shoes and leather gloves to protect against broken glass and sharp debris.",
        "Evacuate damaged buildings safely and assemble at open designated open-ground assembly points.",
      ],
    },
    emergencyKit: [
      { item: "Sturdy pair of work shoes & leather gloves", reason: "Protection from sharp glass and rubble", essential: true },
      { item: "Adjustable wrench / gas valve key", reason: "Shutting off damaged gas lines", essential: true },
      { item: "Loud rescue whistle", reason: "Signaling search dogs if trapped under debris", essential: true },
      { item: "Dust masks (N95 rated)", reason: "Filtering hazardous pulverized concrete dust", essential: true },
    ],
    whatNotToDo: [
      "DO NOT stand in doorways; modern doors do not provide structural protection.",
      "DO NOT run outside while shaking is active due to falling facade bricks and glass.",
      "DO NOT enter damaged masonry buildings until inspected by structural engineers.",
      "DO NOT use elevators during or immediately following an earthquake.",
    ],
    officialHelplines: [
      { agency: "National Emergency Helpline", phone: "112", note: "Immediate search & rescue" },
      { agency: "National Centre for Seismology (NCS)", phone: "011-24619943", note: "Official seismic bulletin" },
    ],
    officialResources: [
      { name: "National Centre for Seismology Earthquake Portal", url: "https://seismo.gov.in", agency: "MoES" },
      { name: "NDMA Earthquake Safety Guidelines", url: "https://ndma.gov.in", agency: "NDMA" },
    ],
    references: [
      { title: "Criteria for Earthquake Resistant Design of Structures (IS 1893: 2016)", source: "Bureau of Indian Standards", year: "2016" },
      { title: "National Disaster Management Guidelines: Management of Earthquakes", source: "NDMA", year: "2007" },
    ],
  },
  {
    slug: "tsunami",
    title: "Tsunamis & Coastal Surges",
    category: "natural",
    shortDescription: "A series of massive, high-velocity ocean waves generated by undersea earthquakes, volcanic eruptions, or submarine landslides.",
    iconName: "Waves",
    severityBaseline: "CRITICAL",
    bannerDescription: "INCOIS early warning system, natural ocean warning signs, and rapid vertical evacuation guidelines.",
    definition: "A tsunami is a series of travelling ocean waves of extremely long wavelength and period generated by sudden impulsive vertical displacement of large water volumes, typically caused by undersea mega-thrust earthquakes exceeding magnitude 6.5.",
    causes: [
      "Submarine megathrust fault ruptures with vertical seafloor displacement (e.g. Sunda Trench, Makran Trench).",
      "Submarine volcanic caldera collapses or explosive underwater eruptions.",
      "Subsea continental slope landslides triggered by seismic shaking.",
    ],
    environmentalFactors: [
      "Open ocean travel speeds exceeding 700 km/h with deep water amplitudes under 1 meter.",
      "Wave shoaling effect: dramatic amplification of wave heights (up to 10–30 meters) upon reaching shallow coastal shelves.",
    ],
    warningSigns: [
      "Strong ground shaking felt along coastal shorelines.",
      "Sudden, dramatic withdrawal of the ocean exposing reefs, seafloor, and stranded fish.",
      "Loud roaring oceanic sound resembling a freight train or jet aircraft.",
      "INCOIS / Indian Tsunami Early Warning Centre (ITEWC) broadcast sirens.",
    ],
    humanImpacts: [
      "Devastating drowning casualties across coastal settlements and tourist beaches.",
      "Complete flattening of shoreline infrastructure, fishing harbors, and ports.",
      "Saltwater intrusion poisoning coastal drinking water wells and aquifers.",
    ],
    environmentalImpacts: [
      "Destruction of coral reefs, coastal sand dunes, and mangrove forests.",
      "Long-term soil salinization ruining coastal farmland fertility.",
    ],
    preventionStrategies: [
      "Establishment and maintenance of deep-ocean BAP/DART tsunameter buoys.",
      "Construction of tsunami evacuation towers and designated elevated mounds in flat coastal zones.",
      "Preservation of coastal sand dunes and dense mangrove vegetation belts.",
    ],
    phases: {
      before: [
        "Familiarize with local INCOIS tsunami evacuation maps and signage in coastal areas.",
        "Identify nearby multi-story reinforced concrete buildings or natural hills for vertical evacuation (minimum 15m elevation).",
        "Participate in annual IOWave Indian Ocean tsunami evacuation drills.",
      ],
      during: [
        "If you feel a strong earthquake near the coast or notice the sea rapidly receding, EVACUATE INLAND OR TO HIGH GROUND IMMEDIATELY.",
        "Do not wait for official siren alerts; natural warning signs require instantaneous evacuation.",
        "Move at least 2 km inland or to an elevation of at least 15 meters above sea level.",
        "If trapped on flat shore, climb to the 3rd floor or higher of a sturdy reinforced concrete building.",
        "Never go down to the beach to watch the receding tide or incoming waves.",
      ],
      after: [
        "Stay on elevated ground; tsunamis are a series of waves and later waves can be much larger and hours apart.",
        "Return to low-lying coastal areas only after official cancellation by INCOIS/NDMA.",
        "Avoid floodwaters carrying toxic debris, sewage, and chemical pollutants.",
      ],
    },
    emergencyKit: [
      { item: "Compact waterproof survival grab-bag", reason: "Rapid foot evacuation to high ground", essential: true },
      { item: "Emergency drinking water filtration bottle", reason: "Coastal freshwater contamination", essential: true },
      { item: "High-frequency emergency whistle", reason: "Calling for search and rescue teams", essential: true },
    ],
    whatNotToDo: [
      "DO NOT walk onto the exposed beach when the sea recedes.",
      "DO NOT return to the shore after the first wave passes; subsequent waves are often larger.",
      "DO NOT attempt to surf or boat across incoming tsunami surges.",
    ],
    officialHelplines: [
      { agency: "National Emergency Helpline", phone: "112", note: "Immediate SOS" },
      { agency: "Indian Tsunami Early Warning Centre (ITEWC)", phone: "040-23895011", note: "INCOIS warning desk" },
    ],
    officialResources: [
      { name: "INCOIS Indian Tsunami Early Warning Centre", url: "https://incois.gov.in/portal/tsunami", agency: "INCOIS" },
      { name: "NDMA Tsunami Guidelines", url: "https://ndma.gov.in", agency: "NDMA" },
    ],
    references: [
      { title: "Standard Operating Procedure for Tsunami Warning in India", source: "INCOIS, Ministry of Earth Sciences", year: "2020" },
    ],
  },
  {
    slug: "landslide",
    title: "Landslides & Slope Failures",
    category: "natural",
    shortDescription: "Downslope movement of rock, debris, or earth mass under the direct influence of gravity, triggered by heavy rainfall or seismic shaking.",
    iconName: "Mountain",
    severityBaseline: "HIGH",
    bannerDescription: "Early warning signs in hilly terrains, slope stability, and Himalayan / Western Ghats safety.",
    definition: "A landslide is the movement of a mass of rock, debris, or earth down a slope under gravitational force. In India, landslides are predominantly triggered by monsoon precipitation saturation in the Himalayas, Western Ghats, and Nilgiri hills.",
    causes: [
      "Intense prolonged monsoon rainfall or cloudbursts saturating slope pore water pressure.",
      "Seismic ground shaking disrupting slope shear strength.",
      "Unscientific hill cutting, toe excavation for road widening, and overloading slope tops.",
      "Deforestation of hill slopes eliminating root-soil anchoring cohesion.",
    ],
    environmentalFactors: [
      "Steep slope angles exceeding 30 degrees.",
      "Highly weathered, fractured metamorphic and sedimentary rock formations.",
      "Impaired surface drainage causing concentrated water infiltration into slope fracture zones.",
    ],
    warningSigns: [
      "New tension cracks appearing on roads, hillslopes, or building foundations.",
      "Tilting of trees, utility poles, and retaining walls.",
      "Sudden springs of muddy water bursting from previously dry hillsides.",
      "Sudden drop in stream water flow despite ongoing rain (indicating upstream landslide damming).",
    ],
    humanImpacts: [
      "Burial of hillside hamlets, resorts, and highway vehicles under debris torrents.",
      "Prolonged blockage of strategic mountain highway corridors.",
      "Damming of mountain rivers creating flash flood risks when landslide dams breach.",
    ],
    environmentalImpacts: [
      "Destruction of mountain forest ecosystems and slope habitats.",
      "Massive sediment dumping into river channels altering aquatic ecology and silting downstream dams.",
    ],
    preventionStrategies: [
      "Construction of retaining walls, breast walls, and gabion structures with weep holes.",
      "Bio-engineering with deep-rooting vetiver grasses and native trees on slope faces.",
      "Installation of lined catchwater drains along upper slope contours to divert runoff safely.",
      "Geological Survey of India (GSI) landslide susceptibility zoning enforcement.",
    ],
    phases: {
      before: [
        "Inspect property slopes for new tension cracks, bulges, or tilting fences prior to monsoon.",
        "Ensure roof runoff and drainage pipes discharge away from slope edges into lined channels.",
        "Sign up for Geological Survey of India (GSI) regional landslide early warning bulletins.",
        "Identify safe, stable ridge assembly zones away from gully channels and steep escarpments.",
      ],
      during: [
        "If you observe sudden ground cracks or hear cracking trees and falling rocks, EVACUATE IMMEDIATELY uphill or perpendicular to the path.",
        "Never cross or drive past active rockfall or flowing mud stretches on mountain roads.",
        "If trapped inside a building and unable to escape, curl into a tight ball and protect your head under heavy furniture.",
      ],
      after: [
        "Stay clear of landslide slide areas; secondary landslides often occur hours or days later.",
        "Check for injured or trapped persons without entering direct slide path hazard zones.",
        "Report broken gas, water, or electrical lines to local district emergency operations center.",
      ],
    },
    emergencyKit: [
      { item: "Sturdy hiking boots with deep tread", reason: "Navigating slippery, unstable mud debris", essential: true },
      { item: "Heavy-duty waterproof torch", reason: "Night evacuation in mountain conditions", essential: true },
      { item: "Emergency thermal blanket", reason: "Preventing hypothermia in cold mountain rains", essential: true },
    ],
    whatNotToDo: [
      "DO NOT build houses near steep natural drainage gullies or slope toes.",
      "DO NOT stay in roadside vehicles parked below precarious rock cliffs during heavy rain.",
      "DO NOT enter landslide debris without official search and rescue team clearance.",
    ],
    officialHelplines: [
      { agency: "National Emergency Service", phone: "112", note: "Immediate SAR" },
      { agency: "Geological Survey of India Landslide Cell", phone: "1800-180-1551", note: "Slope monitoring" },
    ],
    officialResources: [
      { name: "Geological Survey of India Landslide Portal", url: "https://gsi.gov.in", agency: "GSI" },
      { name: "NDMA Landslide Disaster Management Guidelines", url: "https://ndma.gov.in", agency: "NDMA" },
    ],
    references: [
      { title: "National Landslide Risk Management Strategy", source: "NDMA & GSI", year: "2019" },
    ],
  },
  {
    slug: "heat-wave",
    title: "Heatwaves & Extreme Thermal Stress",
    category: "natural",
    shortDescription: "Prolonged period of excessively hot weather with ambient temperatures exceeding historical climatological thresholds.",
    iconName: "SunMedium",
    severityBaseline: "HIGH",
    bannerDescription: "Heat Action Plan protocols, wet-bulb temperature awareness, hydration safety, and heat stroke prevention.",
    definition: "A heatwave is a period of abnormally high temperatures exceeding normal seasonal maximums, declared by IMD when plains maximum temperature reaches at least 40°C (30°C in hills) or departs by 4.5°C–6.4°C above normal.",
    causes: [
      "Persistent synoptic high-pressure anticyclonic systems trapping hot stagnant air.",
      "Dry continental advection winds (e.g. 'Loo' winds blowing across North & Central India).",
      "Absence of pre-monsoon convective thunderstorm activity.",
      "Urban Heat Island (UHI) effect retaining nighttime thermal energy in dense concrete built-up areas.",
    ],
    environmentalFactors: [
      "High ambient relative humidity compounding thermal stress (elevated Wet-Bulb Globe Temperature).",
      "Absence of urban tree canopy shade and vegetative transpiration.",
      "Drying up of surface water bodies and low soil moisture.",
    ],
    warningSigns: [
      "IMD Heatwave Warning (Orange/Red alerts) forecast for 3 or more consecutive days.",
      "Nighttime minimum temperatures remaining above 30°C (warm nights preventing physiological recovery).",
    ],
    humanImpacts: [
      "Severe heat exhaustion, heat cramps, and life-threatening heat stroke (hyperthermia >40°C).",
      "Elevated cardiovascular strain, acute kidney injury, and dehydration among vulnerable elderly and outdoor workers.",
      "Spikes in electricity grid demand leading to transformer trip-outs and water shortages.",
    ],
    environmentalImpacts: [
      "Evaporative loss of soil moisture triggering agricultural drought stress.",
      "Algal blooms and fish mortality in overheated shallow reservoirs and lakes.",
      "Increased baseline risk of dry scrub and forest fires.",
    ],
    preventionStrategies: [
      "Implementation of city Heat Action Plans (HAPs) modeled on the Ahmedabad HAP.",
      "Adoption of Cool Roofs technology (high-albedo reflective coatings) on residential roofs.",
      "Regulating outdoor working hours for construction and agricultural laborers (11 AM to 4 PM rest periods).",
      "Urban greening and tree canopy expansion.",
    ],
    phases: {
      before: [
        "Check local IMD daily temperature forecasts and heat index advisories.",
        "Ensure access to cool drinking water, Oral Rehydration Salts (ORS), and indoor shade.",
        "Cover windows that receive direct morning or afternoon sunlight with curtains or bamboo blinds.",
      ],
      during: [
        "Drink sufficient water throughout the day even if not feeling thirsty; consume lemon water, buttermilk (chaas), and coconut water.",
        "Avoid strenuous outdoor activities between 11:00 AM and 4:00 PM.",
        "Wear loose, light-colored, breathable cotton clothing and wide-brimmed hats/umbrellas when outside.",
        "Never leave children, elderly persons, or pets unattended in closed parked vehicles.",
        "Recognize heat stroke symptoms: hot dry skin, confusion, dizziness, vomiting, rapid pulse — seek immediate emergency medical help (Call 108).",
      ],
      after: [
        "Cool down heat-affected victims rapidly using wet sponge towels, cold packs under armpits/groin, and air circulation.",
        "Gradually rehydrate with electrolyte solutions once consciousness is stable.",
      ],
    },
    emergencyKit: [
      { item: "ORS (Oral Rehydration Salts) sachets / Electrolyte powder", reason: "Rapid replenishment of vital body salts", essential: true },
      { item: "Insulated thermal water bottle", reason: "Maintaining cool drinking water supply", essential: true },
      { item: "Wide-brim hat / UV umbrella", reason: "Direct solar radiation protection", essential: true },
      { item: "Digital clinical thermometer", reason: "Monitoring core body temperature for hyperthermia", essential: true },
    ],
    whatNotToDo: [
      "DO NOT consume high-sugar carbonated drinks, heavy alcohol, or excessive caffeine which worsen dehydration.",
      "DO NOT perform heavy physical workouts in non-air-conditioned spaces during peak heat hours.",
      "DO NOT ignore dizziness, lack of sweating, or high body temperature.",
    ],
    officialHelplines: [
      { agency: "National Emergency Ambulance", phone: "108", note: "Heat stroke emergency" },
      { agency: "National Emergency Helpline", phone: "112", note: "Unified SOS" },
    ],
    officialResources: [
      { name: "NDMA National Heat Action Plan Guidelines", url: "https://ndma.gov.in", agency: "NDMA" },
      { name: "IMD National Weather Forecasting Centre (Heat Warnings)", url: "https://mausam.imd.gov.in", agency: "IMD" },
    ],
    references: [
      { title: "National Guidelines for Preparation of Action Plan - Prevention and Management of Heat Wave", source: "NDMA", year: "2019" },
    ],
  },
  {
    slug: "cold-wave",
    title: "Cold Waves & Severe Frost",
    category: "natural",
    shortDescription: "Rapid drop in ambient temperatures below normal climatological thresholds accompanied by piercing wind chill.",
    iconName: "ThermometerSnowflake",
    severityBaseline: "MODERATE",
    bannerDescription: "Cold wave advisories across Indo-Gangetic plains, hypothermia prevention, and shelter guidance.",
    definition: "A cold wave is a localized rapid cooling of the air over a 24-hour period, declared by IMD in core cold-wave zones when minimum temperatures drop below 10°C in plains with departures of 4.5°C–6.4°C below normal.",
    causes: [
      "Passage of active Western Disturbances leaving behind dry cold northerly winds from snow-covered Himalayas.",
      "Strong nocturnal radiative cooling under clear, cloudless winter skies.",
      "Advection of arctic/polar airmasses across northern and central Indian subcontinent.",
    ],
    environmentalFactors: [
      "Persistent ground fog and smog layers trapping cold boundary air (winter temperature inversions).",
      "High relative humidity coupled with wind chill accelerating body heat loss.",
    ],
    warningSigns: [
      "IMD Cold Wave / Severe Cold Day alerts issued for northern states (Punjab, Haryana, UP, Bihar, Rajasthan).",
      "Dense radiation fog dropping visibility below 50 meters and daytime temperatures staying 5°C below normal.",
    ],
    humanImpacts: [
      "Hypothermia and frostbite risks among homeless populations and street vendors.",
      "Exacerbation of chronic respiratory illnesses (Asthma, COPD) and cardiovascular incidents.",
      "Severe disruptions to road, railway, and aviation transport due to dense fog blankets.",
    ],
    environmentalImpacts: [
      "Ground frost causing severe damage to winter rabi crops (Mustard, Potato, Wheat, Pulses).",
      "Loss of livestock lacking warm shelter.",
    ],
    preventionStrategies: [
      "District administration setup of winter night shelters (Rain Baseras) equipped with warm bedding and heaters.",
      "Protective light irrigation and organic mulching of agricultural fields to prevent frost crystallization.",
    ],
    phases: {
      before: [
        "Store sufficient winter thermal clothing, blankets, and safe heating devices.",
        "Insulate exterior water pipes and protect livestock enclosures from direct north winds.",
      ],
      during: [
        "Dress in multiple layers of loose, warm woolen or thermal clothing rather than a single heavy layer.",
        "Cover head, neck, hands, and feet (over 30% of body heat is lost through uncovered extremities).",
        "Keep rooms adequately ventilated if using charcoal angithis or gas heaters to prevent lethal Carbon Monoxide (CO) poisoning.",
        "Drink warm, nourishing fluids and consume balanced calorie-rich meals.",
      ],
      after: [
        "Treat shivering, slurred speech, and numbness as early hypothermia; warm victim gradually with dry blankets.",
        "Report stranded homeless individuals to municipal shelter helpline teams.",
      ],
    },
    emergencyKit: [
      { item: "Multiple woolen layers & thermal innerwear", reason: "Trapping warm air layers around body", essential: true },
      { item: "High-grade insulated thermal flask", reason: "Keeping hot beverages and soups ready", essential: true },
      { item: "Moisturizing ointments & petroleum jelly", reason: "Preventing severe frost cracking and chapping", essential: true },
    ],
    whatNotToDo: [
      "DO NOT sleep in a closed, unventilated room with burning charcoal brazier or fossil fuel heater (CO poisoning risk).",
      "DO NOT drink alcohol to 'warm up' (alcohol dilates peripheral blood vessels, accelerating core body heat loss).",
      "DO NOT rub frostbitten skin vigorously.",
    ],
    officialHelplines: [
      { agency: "National Emergency Helpline", phone: "112", note: "24/7 Universal help" },
      { agency: "Municipal Homeless Shelter Helpline", phone: "1077", note: "District emergency response" },
    ],
    officialResources: [
      { name: "IMD Cold Wave Warning Bulletins", url: "https://mausam.imd.gov.in", agency: "IMD" },
      { name: "NDMA Cold Wave Action Guidelines", url: "https://ndma.gov.in", agency: "NDMA" },
    ],
    references: [
      { title: "Guidelines on Prevention and Management of Cold Wave and Frost", source: "NDMA", year: "2020" },
    ],
  },
  {
    slug: "drought",
    title: "Droughts & Water Scarcity",
    category: "natural",
    shortDescription: "Prolonged deficiency of precipitation over an extended period resulting in severe water shortages and agricultural distress.",
    iconName: "Sun",
    severityBaseline: "MODERATE",
    bannerDescription: "Meteorological, hydrological, and agricultural drought indicators, water conservation, and relief frameworks.",
    definition: "A drought is an extended period of deficient precipitation relative to the multi-decadal statistical mean, leading to substantial water shortages for agriculture, ecosystems, livestock, and municipal supplies.",
    causes: [
      "Failure or weak performance of southwest/northeast monsoon systems due to El Niño conditions.",
      "Prolonged monsoon dry spells and delayed monsoon onset.",
      "Over-extraction of ground water beyond annual recharge capacity.",
    ],
    environmentalFactors: [
      "High ambient evaporation and transpiration rates under persistent clear skies.",
      "Degradation of catchment soil organic matter reducing moisture retention.",
    ],
    warningSigns: [
      "Rainfall departure exceeding -20% across meteorological sub-divisions.",
      "Drastic drop in reservoir live storage levels reported by Central Water Commission.",
      "Depletion of groundwater piezometer monitoring well levels.",
    ],
    humanImpacts: [
      "Severe agrarian distress, crop failure, and rural economic debt.",
      "Shortages of potable drinking water in rural habitations and Tier-2 urban hubs.",
      "Fodder shortages forcing distress sale of cattle.",
    ],
    environmentalImpacts: [
      "Desertification, loss of topsoil moisture, and loss of regional vegetative biodiversity.",
      "Drying up of ephemeral rivers, wetlands, and wildlife watering holes.",
    ],
    preventionStrategies: [
      "Rainwater harvesting and artificial groundwater recharge structures (check dams, farm ponds).",
      "Promotion of micro-irrigation systems (drip and sprinkler) to maximize water-use efficiency.",
      "Crop diversification towards climate-resilient millets and low-water-demand pulses.",
    ],
    phases: {
      before: [
        "Adopt rooftop rainwater harvesting and greywater recycling systems.",
        "Repair household plumbing leaks and install low-flow aerator faucets.",
        "Store water in covered, food-grade storage containers.",
      ],
      during: [
        "Prioritize water strictly for drinking, cooking, and sanitation needs.",
        "Adopt drip irrigation and soil mulching practices in agriculture to reduce evaporative losses.",
        "Boil or chlorinate drinking water if relying on emergency tanker supplies.",
      ],
      after: [
        "Desilt community percolation ponds and recharge wells prior to the upcoming monsoon season.",
        "Participate in community watershed development programs.",
      ],
    },
    emergencyKit: [
      { item: "Certified water testing & chlorination kit", reason: "Verifying quality of tanker supplies", essential: true },
      { item: "Food-grade covered water storage vessels", reason: "Safe sanitary water containment", essential: true },
      { item: "Oral Rehydration Salts (ORS) packets", reason: "Preventing dehydration and heat exhaustion during water scarcity", essential: true },
    ],
    whatNotToDo: [
      "DO NOT waste municipal water on washing vehicles, courtyards, or decorative gardens.",
      "DO NOT dig unauthorized deep borewells that deplete regional deep aquifers.",
      "DO NOT consume untreated water from stagnant drying ponds.",
    ],
    officialHelplines: [
      { agency: "Central Ground Water Board (CGWB)", phone: "1800-11-0031", note: "Water resources desk" },
      { agency: "District Drought Relief Cell", phone: "1077", note: "Water tanker coordination" },
    ],
    officialResources: [
      { name: "National Agricultural Drought Assessment and Monitoring System (NADAMS)", url: "https://www.isro.gov.in", agency: "ISRO/NRSC" },
      { name: "Ministry of Jal Shakti Portal", url: "https://jalshakti-dowr.gov.in", agency: "MoJS" },
    ],
    references: [
      { title: "Manual for Drought Management", source: "Ministry of Agriculture and Farmers Welfare", year: "2016" },
    ],
  },
  {
    slug: "lightning",
    title: "Lightning & Thunderstorms",
    category: "natural",
    shortDescription: "High-voltage electrostatic atmospheric discharges during severe convective thunderstorm cells.",
    iconName: "Zap",
    severityBaseline: "HIGH",
    bannerDescription: "30-30 Rule, lightning conductor protection, Damini early warning app, and open-field safety.",
    definition: "Lightning is a massive electrostatic discharge between electrically charged regions within a convective cloud (intra-cloud), between clouds (cloud-to-cloud), or between a cloud and the Earth's surface (cloud-to-ground).",
    causes: [
      "Intense vertical convective updrafts generating collision between ice crystals and graupel in cumulonimbus storm clouds.",
      "Charge separation creating positive charges at cloud tops and negative charges at cloud bases.",
      "Steep potential gradient exceeding atmospheric dielectric breakdown voltage (approx. 3 million volts per meter).",
    ],
    environmentalFactors: [
      "Pre-monsoon and monsoon convective heating triggering severe thunderstorm squalls (Kalbaishakhi, Nor'westers).",
      "Tall solitary trees, open water bodies, and isolated elevated terrain attracting ground strikes.",
    ],
    warningSigns: [
      "Towering dark cumulonimbus clouds with anvil tops developing rapidly.",
      "Sudden cool wind gust accompanied by distant rumbling thunder.",
      "Damini Lightning Early Warning Mobile App GPS proximity alerts (IITM / IMD).",
      "Hair standing on end or tingling skin in open fields (indicates imminent strike).",
    ],
    humanImpacts: [
      "Instantaneous cardiac arrest, severe electrical burns, and blast acoustic trauma.",
      "High fatality rates among farmers, shepherds, and outdoor laborers working in open fields.",
      "Electrical fires in residential and agricultural structures.",
    ],
    environmentalImpacts: [
      "Ignition of dry forest scrub and canopy wildfires.",
      "Damage to wildlife and livestock resting under isolated trees.",
    ],
    preventionStrategies: [
      "Installation of Early Streamer Emission (ESE) and Franklin lightning arresters on all public buildings.",
      "Deployment of Indian Institute of Tropical Meteorology (IITM) lightning sensor networks.",
    ],
    phases: {
      before: [
        "Check IMD thunderstorm nowcasts and the Damini app before heading out into agricultural fields.",
        "Ensure residential buildings are equipped with certified copper lightning arresters.",
      ],
      during: [
        "Follow the **30-30 Rule**: If the time between seeing lightning and hearing thunder is less than 30 seconds, seek substantial indoor shelter immediately. Stay inside for at least 30 minutes after the last thunderclap.",
        "If caught in an open field with no shelter nearby: Crouch low in the **Lightning Safety Position** (kneel on balls of feet with heels touching, head between knees, hands over ears). NEVER lie flat on the ground.",
        "Stay away from tall, isolated trees, metallic fences, telephone poles, and open bodies of water.",
        "Unplug valuable electronics and avoid using corded landline telephones during thunderstorms.",
      ],
      after: [
        "Lightning victims carry NO electrical charge; administer immediate CPR and chest compressions safely.",
        "Call National Emergency 112 / 108 ambulance immediately.",
      ],
    },
    emergencyKit: [
      { item: "Surge-protected power extension boards", reason: "Preventing electronic damage from line surges", essential: true },
      { item: "Battery-powered emergency lighting", reason: "Local grid trip-outs during storms", essential: true },
      { item: "Damini Mobile App & portable battery bank", reason: "Real-time IITM/IMD lightning strike proximity nowcasting", essential: true },
    ],
    whatNotToDo: [
      "DO NOT seek shelter underneath tall, isolated trees or open tin-roof sheds.",
      "DO NOT hold metallic objects like farm tools, iron umbrellas, or fishing rods.",
      "DO NOT bathe, shower, or use plumbing during active lightning strikes.",
      "DO NOT lie flat on the ground (spreads ground current through vital organs).",
    ],
    officialHelplines: [
      { agency: "National Emergency Ambulance", phone: "108", note: "Cardiac arrest & burn SAR" },
      { agency: "National Emergency Service", phone: "112", note: "Unified SOS" },
    ],
    officialResources: [
      { name: "Damini Lightning Early Warning Network", url: "https://www.tropmet.res.in", agency: "IITM / MoES" },
      { name: "NDMA Lightning Safety Guidelines", url: "https://ndma.gov.in", agency: "NDMA" },
    ],
    references: [
      { title: "Guidelines on Action Plan for Prevention and Mitigation of Lightning", source: "NDMA", year: "2021" },
    ],
  },
  {
    slug: "forest-fire",
    title: "Forest Fires & Wildfires",
    category: "natural",
    shortDescription: "Uncontrolled fires burning across wildland vegetation, forests, and dry scrublands.",
    iconName: "Flame",
    severityBaseline: "HIGH",
    bannerDescription: "FSI satellite thermal hotspot monitoring, firebreaks, smoke inhalation safety, and forest preservation.",
    definition: "A forest fire (wildfire) is an uncontrolled fire occurring in vegetation and forest ecosystems, spreading rapidly through surface litter, understory shrubs, or tree crowns under high winds and dry conditions.",
    causes: [
      "Dry leaf litter and fallen pine needles (chir pine) igniting during peak summer heat (March–June).",
      "Unattended campfires, discarded bidi/cigarette butts, or intentional pasture burning escaping control.",
      "Natural lightning strikes during dry thunderstorms.",
    ],
    environmentalFactors: [
      "High ambient temperatures, relative humidity below 20%, and brisk dry surface winds.",
      "Accumulation of combustible dry biomass on forest floors.",
    ],
    warningSigns: [
      "Forest Survey of India (FSI) SNPP-VIIRS / MODIS satellite thermal fire hotspot alerts.",
      "Dense plumes of smoke rising from nearby ridgelines or forest reserves.",
      "Unusual crackling sounds and animal agitation fleeing forest boundaries.",
    ],
    humanImpacts: [
      "Destruction of forest fringe villages, ecotourism resorts, and livestock sheds.",
      "Severe respiratory illnesses from dense particulate matter (PM2.5) smoke inhalation.",
      "Disruption of mountain highway transport due to zero visibility and falling burning logs.",
    ],
    environmentalImpacts: [
      "Devastating loss of wildlife biodiversity, nesting birds, and endangered flora.",
      "Destruction of forest soil carbon and degradation of watershed catchment quality.",
      "Massive carbon dioxide emissions contributing to climate warming.",
    ],
    preventionStrategies: [
      "Creation and regular clearing of wide forest fire lines (firebreaks).",
      "Community participation through Joint Forest Management Committees (JFMC) and Van Panchayats.",
      "Controlled early winter burning of combustible pine needle biomass.",
    ],
    phases: {
      before: [
        "Create a 10-meter defensible fuel-free buffer zone around homes near forest borders.",
        "Clear dry pine needles, dry brush, and dead leaves from roofs and gutters.",
        "Keep emergency evacuation grab-bags and N95 dust masks ready.",
      ],
      during: [
        "Evacuate immediately along designated paved roads away from the fire's advancing wind direction.",
        "Close all doors, windows, and vents to prevent embers and smoke from entering buildings.",
        "Cover nose and mouth with damp cloth or N95 mask to filter dense smoke.",
        "Turn on outside porch lights to make house visible in heavy smoke.",
      ],
      after: [
        "Check roofs, eaves, and perimeter for smoldering embers and hot spots.",
        "Do not re-enter burned forest zones until forest department declares area safe from falling snags.",
      ],
    },
    emergencyKit: [
      { item: "N95 particulate respirator masks", reason: "Filtering hazardous smoke and ash particles", essential: true },
      { item: "Protective safety goggles", reason: "Eye protection against irritating smoke & embers", essential: true },
      { item: "Heavy-duty cotton work gloves", reason: "Handling warm debris safely", essential: true },
    ],
    whatNotToDo: [
      "DO NOT discard unextinguished cigarettes or matchsticks in forest areas.",
      "DO NOT light open campfires or burn garbage near dry forest fringes.",
      "DO NOT attempt to outrun a wildfire uphill; fires travel much faster uphill than downhill.",
    ],
    officialHelplines: [
      { agency: "Forest Fire Control Room", phone: "1926", note: "Forest Department toll-free" },
      { agency: "Fire & Rescue Emergency", phone: "101", note: "Urban & rural fire brigade" },
    ],
    officialResources: [
      { name: "Forest Survey of India Van Agni Portal", url: "https://vanagni.fsi.gov.in", agency: "FSI" },
      { name: "NDMA Forest Fire Safety Guidelines", url: "https://ndma.gov.in", agency: "NDMA" },
    ],
    references: [
      { title: "National Action Plan on Forest Fires", source: "Ministry of Environment, Forest and Climate Change", year: "2018" },
    ],
  },
  {
    slug: "avalanche",
    title: "Snow Avalanches",
    category: "natural",
    shortDescription: "Rapid downslope flow of snow, ice, and rock down a mountain slope in high-altitude terrain.",
    iconName: "Snowflake",
    severityBaseline: "CRITICAL",
    bannerDescription: "Defence Geoinformatics Research Establishment (DGRE) bulletins, avalanche transceiver protocols, and mountain safety.",
    definition: "An avalanche is a rapid flow of snow down a sloping surface, triggered when the gravitational stress on the snowpack exceeds the shear strength of its internal bonding layers.",
    causes: [
      "Heavy fresh snowfall accumulating on pre-existing icy crusts.",
      "Sudden spring temperature rise causing thermal weakening of snowpack.",
      "Mechanical triggers from skiers, mountaineers, or vehicular vibrations.",
    ],
    environmentalFactors: [
      "Slope angles between 30 and 45 degrees.",
      "High wind loading forming unstable wind slabs on leeward slopes.",
    ],
    warningSigns: [
      "DGRE (DRDO) Avalanche Warning Bulletins (Category Yellow/Orange/Red).",
      "Recent shooting cracks and 'whumpfing' settling sounds beneath the snowpack.",
    ],
    humanImpacts: [
      "Burial of mountain villages, military posts, and highway convoys under dense snow.",
      "Asphyxiation, trauma, and rapid hypothermia among buried victims.",
    ],
    environmentalImpacts: [
      "Destruction of high-altitude alpine vegetation and disruption of glacial stream channels.",
      "Uprooting of subalpine birch and fir tree canopies altering high-altitude watershed hydrology.",
    ],
    preventionStrategies: [
      "Construction of snow bridges, avalanche snow sheds, and deflection dams along critical highway passes.",
      "Controlled artificial triggering of unstable snow slabs using artillery or explosives by DGRE/BRO.",
    ],
    phases: {
      before: [
        "Check DGRE avalanche danger bulletins before travelling along high-altitude passes (e.g. Zojila, Rohtang).",
        "Carry avalanche transceivers, collapsible probes, and snow shovels.",
      ],
      during: [
        "If caught in an avalanche, discard skis/poles and use swimming motions to stay near the surface.",
        "Before snow stops moving, cup hands in front of face to create a vital air pocket for breathing.",
      ],
      after: [
        "Stay calm and conserve oxygen; use an avalanche transceiver to pinpoint buried companions.",
        "Dig carefully with shovels to extract buried persons before asphyxiation sets in (vital window <15 minutes).",
      ],
    },
    emergencyKit: [
      { item: "Avalanche Rescue Beacon / Transceiver", reason: "Pinpointing location under snow", essential: true },
      { item: "Collapsible aluminum snow shovel", reason: "Rapid excavation of dense packed snow", essential: true },
      { item: "Collapsible aluminum snow probe (240cm+)", reason: "Locating victim depth below surface of avalanche debris", essential: true },
    ],
    whatNotToDo: [
      "DO NOT travel across avalanche-prone slopes after heavy fresh snowfall or during rapid warming.",
      "DO NOT shout excessively under snow (wastes vital oxygen).",
    ],
    officialHelplines: [
      { agency: "Border Roads Organisation (BRO) Control", phone: "112", note: "Highway rescue" },
      { agency: "DGRE Avalanche Warning Cell", phone: "0172-2699804", note: "Official snow safety" },
    ],
    officialResources: [
      { name: "Defence Geoinformatics Research Establishment (DGRE)", url: "https://drdo.gov.in", agency: "DRDO" },
    ],
    references: [
      { title: "Snow Avalanche Management Guidelines", source: "NDMA & DGRE", year: "2010" },
    ],
  },
  {
    slug: "severe-storm",
    title: "Severe Storms & Hailstorms",
    category: "natural",
    shortDescription: "Violent atmospheric squalls accompanied by damaging hail, torrential downpours, and destructive straight-line winds.",
    iconName: "CloudLightning",
    severityBaseline: "MODERATE",
    bannerDescription: "Hailstorm agricultural protection, severe squall precautions, and Doppler radar monitoring.",
    definition: "A severe storm is an intense convective weather system characterized by gale-force wind gusts (>60 km/h), large hail stones, intense cloud-to-ground lightning, and localized torrential precipitation.",
    causes: [
      "Strong convective instability combined with deep atmospheric moisture and dry mid-level air.",
      "Interaction of continental dry lines with moist maritime air masses.",
      "Strong wind shear organizing convective storm clouds into severe multi-cell or supercell clusters.",
    ],
    environmentalFactors: [
      "Freezing level altitude enabling large hail stones to reach the ground without melting.",
      "High CAPE (Convective Available Potential Energy) values exceeding 2500 J/kg creating violent updrafts.",
    ],
    warningSigns: [
      "Greenish or dark bruised tint in convective storm cloud bases.",
      "Loud roaring sound from hail falling in the near distance.",
    ],
    humanImpacts: [
      "Extensive damage to tiled and tin roof structures, glass facades, and vehicles.",
      "Destruction of standing fruit orchards, vegetables, and wheat crops.",
    ],
    environmentalImpacts: [
      "Defoliation of tree canopies and damage to nesting bird populations.",
      "Severe lodging and flattening of standing agricultural crops (Wheat, Paddy, Sugarcane).",
    ],
    preventionStrategies: [
      "Deployment of anti-hail nets over vulnerable fruit orchards (Apples, Grapes).",
      "Structural reinforcement of lightweight roofs, signboards, and mobile communication towers to withstand squalls up to 120 km/h.",
    ],
    phases: {
      before: [
        "Park vehicles in garages or cover with padded protective blankets.",
        "Secure loose outdoor furniture and livestock in covered stables.",
      ],
      during: [
        "Stay indoors away from skylights and glass windows.",
        "If driving in a hailstorm, pull over safely under a bridge or solid structure.",
      ],
      after: [
        "Inspect roofs and power cables for impact damage.",
        "Report snapped high-voltage electric cables to DISCOM emergency lines immediately; maintain a 10-meter clearance from dangling wires.",
      ],
    },
    emergencyKit: [
      { item: "Padded protective covers for vehicle & roof vents", reason: "Mitigating hail impact damage", essential: true },
      { item: "Multi-purpose emergency weather radio", reason: "Receiving IMD nowcasts when cellular power is severed", essential: true },
      { item: "Heavy-duty tarpaulin sheet & nylon rope", reason: "Temporary weather-proofing of hail-damaged roof sections", essential: true },
    ],
    whatNotToDo: [
      "DO NOT stand near glass windows during intense hail bursts.",
      "DO NOT touch fallen power cables.",
    ],
    officialHelplines: [
      { agency: "National Emergency Helpline", phone: "112", note: "24/7 Universal SOS" },
    ],
    officialResources: [
      { name: "IMD Doppler Radar Network", url: "https://mausam.imd.gov.in", agency: "IMD" },
    ],
    references: [
      { title: "Standard Operating Procedure for Severe Weather Forecasting", source: "IMD", year: "2021" },
    ],
  },
];
