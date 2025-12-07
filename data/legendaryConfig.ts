
// This file contains the spawn configuration for Legendary Pokemon
// extracted from the Cobblemon/Myths and Legends config files.

const RAW_SPAWN_DATA = {
  "enabled": true,
  "neededInstalledMods": [],
  "neededUninstalledMods": [],
  "spawns": [
  {
    "id": "mythsandlegends-arceus-1",
    "pokemon": "arceus",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "80",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ]
    }
  },
  {
    "id": "mythsandlegends-arceus-2",
    "pokemon": "arceus",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "80",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:dark_forest",
        "#byg:is_magical",
        "#wythers:is_dark_forest",
        "byg:skyris_vale",
        "terralith:amethyst_canyon",
        "terralith:amethyst_rainforest",
        "terralith:mirage_isles",
        "terralith:moonlight_grove",
        "terralith:moonlight_valley",
        "wythers:lantern_river",
        "wythers:mushroom_island",
        "wythers:snowy_thermal_taiga",
        "#cobblemon:is_end"
      ]
    }
  },
  {
    "id": "mythsandlegends-articuno-1",
    "pokemon": "articuno",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:frozen_ocean",
        "minecraft:frozen_peaks",
        "minecraft:frozen_river",
        "minecraft:snowy_beach",
        "minecraft:snowy_plains",
        "minecraft:snowy_slopes",
        "minecraft:snowy_taiga"
      ],
      "key_item": "myths_and_legends:tidal_bell_articuno"
    }
  },
  {
    "id": "mythsandlegends-articuno-2",
    "pokemon": "articuno",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_cold",
        "#cobblemon:is_freezing",
        "#cobblemon:is_snowy_forest",
        "#cobblemon:is_glacial",
        "#cobblemon:is_frozen_ocean"
      ],
      "key_item": "myths_and_legends:tidal_bell_articuno"
    }
  },
  {
    "id": "mythsandlegends-azelf-1",
    "pokemon": "azelf",
    "presets": [
      "water_surface"
    ],
    "type": "pokemon",
    "context": "surface",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:mangrove_swamp",
        "minecraft:swamp",
        "#byg:is_swamp",
        "#c:swamp",
        "#forge:is_swamp",
        "#wythers:is_swamp",
        "terralith:ice_marsh",
        "terralith:orchid_swampc",
        "wythers:billabong",
        "#cobblemon:is_swamp"
      ],
      "key_item": "myths_and_legends:azelf_fang"
    }
  },
  {
    "id": "mythsandlegends-azelf-2",
    "pokemon": "azelf",
    "presets": [
      "water_surface"
    ],
    "type": "pokemon",
    "context": "surface",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_river",
        "wythers:lantern_river",
        "#minecraft:is_river",
        "wythers:tropical_forest_river",
        "#cobblemon:is_freshwater"
      ],
      "key_item": "myths_and_legends:azelf_fang"
    }
  },
  {
    "id": "mythsandlegends-calyrex-1",
    "pokemon": "calyrex",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_autumn",
        "minecraft:flower_forest"
      ],
      "key_item": "myths_and_legends:reins_of_unity"
    }
  },
  {
    "id": "mythsandlegends-celebi-1",
    "pokemon": "celebi",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "30-70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:birch_forest",
        "minecraft:dark_forest",
        "minecraft:flower_forest",
        "minecraft:forest",
        "minecraft:jungle",
        "minecraft:mangrove_swamp",
        "minecraft:meadow",
        "minecraft:old_growth_birch_forest",
        "minecraft:old_growth_pine_taiga",
        "minecraft:old_growth_spruce_taiga",
        "minecraft:swamp"
      ]
    }
  },
  {
    "id": "mythsandlegends-celebi-2",
    "pokemon": "celebi",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "30-70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_forest",
        "#cobblemon:is_magical",
        "#cobblemon:is_lush",
        "minecraft:cherry_grove",
        "#cobblemon:is_spring"
      ]
    }
  },
  {
    "id": "mythsandlegends-cobalion-1",
    "pokemon": "cobalion",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_hill",
        "#cobblemon:is_highlands",
        "#c:mountain_slope",
        "#forge:is_slope",
        "terralith:blooming_valley",
        "terralith:forested_highlands",
        "terralith:lavender_valley",
        "terralith:lush_valley",
        "terralith:moonlight_valley",
        "terralith:sakura_valley",
        "terralith:savanna_slopes",
        "terralith:temperate_highlands",
        "terralith:yosemite_lowlands",
        "wythers:autumnal_crags",
        "wythers:ayers_rock",
        "wythers:icy_crags",
        "wythers:old_growth_taiga_crags",
        "wythers:taiga_crags",
        "wythers:temperate_rainforest_crags",
        "wythers:thermal_taiga_crags",
        "wythers:windswept_jungle"
      ],
      "key_item": "myths_and_legends:ironwill_sword"
    }
  },
  {
    "id": "mythsandlegends-cobalion-2",
    "pokemon": "cobalion",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_mountain",
        "#cobblemon:is_hills",
        "#forge:is_mountain",
        "terralith:stony_spires",
        "terralith:volcanic_peaks",
        "terralith:windswept_spires",
        "terralith:yosemite_cliffs",
        "wythers:tibesti_mountains"
      ],
      "key_item": "myths_and_legends:ironwill_sword"
    }
  },
  {
    "id": "mythsandlegends-cosmog-1",
    "pokemon": "cosmog",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "15",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:cherry_grove",
        "minecraft:flower_forest",
        "minecraft:meadow",
        "minecraft:sunflower_plains",
        "#byg:is_floral",
        "#c:floral",
        "#c:flower_forests",
        "byg:amaranth_fields",
        "byg:allium_fields",
        "byg:rose_fields",
        "byg:skyris_vale",
        "byg:cherry_blossom_forest",
        "byg:orchard",
        "terralith:blooming_plateau",
        "terralith:blooming_valley",
        "terralith:lavender_forest",
        "terralith:lavender_valley",
        "terralith:sakura_grove",
        "terralith:sakura_valley",
        "wythers:autumnal_flower_forest",
        "wythers:flowering_pantanal",
        "wythers:jacaranda_savanna",
        "wythers:lapacho_plains",
        "wythers:sakura_forest",
        "wythers:spring_flower_fields",
        "wythers:spring_flower_forest"
      ],
      "key_item": "myths_and_legends:lillies_bag"
    }
  },
  {
    "id": "mythsandlegends-cosmog-2",
    "pokemon": "cosmog",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "15",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ],
      "key_item": "myths_and_legends:lillies_bag"
    }
  },
  {
    "id": "mythsandlegends-cresselia-1",
    "pokemon": "cresselia",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:mushroom_fields",
        "minecraft:mushroom_field_shore",
        "minecraft:snowy_tundra"
      ],
      "canSeeSky": true,
      "timeRange": "night",
      "key_item": "myths_and_legends:lunar_feather"
    }
  },
  {
    "id": "mythsandlegends-darkrai-1",
    "pokemon": "darkrai",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "40-50",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:dark_forest",
        "minecraft:swamp"
      ]
    }
  },
  {
    "id": "mythsandlegends-darkrai-2",
    "pokemon": "darkrai",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "40-50",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_spooky",
        "#cobblemon:is_dark",
        "#cobblemon:is_deep_dark"
      ]
    }
  },
  {
    "id": "mythsandlegends-deoxys-1",
    "pokemon": "deoxys",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "75",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ]
    }
  },
  {
    "id": "mythsandlegends-deoxys-2",
    "pokemon": "deoxys",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "75",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_end"
      ]
    }
  },
  {
    "id": "mythsandlegends-dialga-1",
    "pokemon": "dialga",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "47-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:mountain_edge",
        "minecraft:stony_peaks"
      ],
      "key_item": "myths_and_legends:adamant_orb"
    }
  },
  {
    "id": "mythsandlegends-dialga-2",
    "pokemon": "dialga",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "47-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_highlands",
        "#cobblemon:is_peak",
        "#cobblemon:is_mountain"
      ],
      "key_item": "myths_and_legends:adamant_orb"
    }
  },
  {
    "id": "mythsandlegends-diancie-1",
    "pokemon": "diancie",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "maxY": -61,
      "biomes": [
        "#cobblemon:is_cave"
      ]
    }
  },
  {
    "id": "mythsandlegends-diancie-2",
    "pokemon": "diancie",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "maxY": -61,
      "biomes": [
        "minecraft:dripstone_caves",
        "minecraft:lush_caves",
        "#c:caves",
        "#c:underground",
        "#forge:is_underground",
        "terralith:cave/andesite_caves",
        "terralith:cave/desert_caves",
        "terralith:cave/diorite_caves",
        "terralith:cave/fungal_caves",
        "terralith:cave/granite_caves",
        "terralith:cave/infested_caves",
        "terralith:cave/thermal_caves",
        "terralith:cave/underground_jungle"
      ]
    }
  },
  {
    "id": "mythsandlegends-enamorus-1",
    "pokemon": "enamorus",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-70",
    "weight": 3,
    "condition": {
      "isThundering": true,
      "biomes": [
        "minecraft:flower_forest",
        "minecraft:meadow",
        "minecraft:cherry_grove"
      ],
      "key_item": "myths_and_legends:reveal_glass_enamorus"
    }
  },
  {
    "id": "mythsandlegends-entei-1",
    "pokemon": "entei",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:badlands",
        "minecraft:eroded_badlands",
        "minecraft:nether_wastes",
        "minecraft:savanna",
        "minecraft:windswept_hills",
        "minecraft:windswept_forest"
      ],
      "key_item": "myths_and_legends:clear_bell_entei"
    }
  },
  {
    "id": "mythsandlegends-entei-2",
    "pokemon": "entei",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_volcanic",
        "#cobblemon:is_thermal",
        "#cobblemon:is_badlands"
      ],
      "key_item": "myths_and_legends:clear_bell_entei"
    }
  },
  {
    "id": "mythsandlegends-eternatus-1",
    "pokemon": "eternatus",
    "presets": [
      "water_surface"
    ],
    "type": "pokemon",
    "context": "surface",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:mangrove_swamp",
        "minecraft:swamp",
        "#byg:is_swamp",
        "#c:swamp",
        "#forge:is_swamp",
        "#wythers:is_swamp",
        "terralith:ice_marsh",
        "terralith:orchid_swampc",
        "wythers:billabong"
      ],
      "key_item": "myths_and_legends:eternatus_core"
    }
  },
  {
    "id": "mythsandlegends-eternatus-2",
    "pokemon": "eternatus",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ],
      "key_item": "myths_and_legends:eternatus_core"
    }
  },
  {
    "id": "mythsandlegends-genesect-1",
    "pokemon": "genesect",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_dark"
      ]
    }
  },
  {
    "id": "mythsandlegends-genesect-2",
    "pokemon": "genesect",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ],
      "neededNearbyBlocks": [
        "minecraft:iron_block"
      ],
      "key_item": "myths_and_legends:genesect_drive"
    }
  },
  {
    "id": "mythsandlegends-giratina-1",
    "pokemon": "Giratina",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "47-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:soul_sand_valley",
        "minecraft:the_end"
      ],
      "key_item": "myths_and_legends:griseous_orb"
    }
  },
  {
    "id": "mythsandlegends-giratina-2",
    "pokemon": "Giratina",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "47-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_nether",
        "#cobblemon:is_spooky",
        "#cobblemon:is_nether_wasteland"
      ],
      "key_item": "myths_and_legends:griseous_orb"
    }
  },
  {
    "id": "mythsandlegends-glastrier-1",
    "pokemon": "glastrier",
    "presets": [],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_snowy_forest",
        "#cobblemon:is_taiga",
        "#cobblemon:is_mountain"
      ],
      "key_item": "myths_and_legends:iceroot_carrot"
    }
  },
  {
    "id": "mythsandlegends-glastrier-2",
    "pokemon": "glastrier",
    "presets": [],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_snowy_forest",
        "#cobblemon:is_taiga",
        "#cobblemon:is_mountain"
      ],
      "key_item": "myths_and_legends:iceroot_carrot"
    }
  },
  {
    "id": "mythsandlegends-groudon-1",
    "pokemon": "groudon",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "45-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_volcanic",
        "minecraft:badlands",
        "minecraft:desert",
        "minecraft:eroded_badlands"
      ],
      "key_item": "myths_and_legends:red_orb"
    }
  },
  {
    "id": "mythsandlegends-groudon-2",
    "pokemon": "groudon",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "45-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_volcanic",
        "#cobblemon:is_desert",
        "#cobblemon:is_arid",
        "#cobblemon:is_thermal"
      ],
      "key_item": "myths_and_legends:red_orb"
    }
  },
  {
    "id": "mythsandlegends-heatran-1",
    "pokemon": "heatran",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:nether_wastes",
        "minecraft:basalt_deltas",
        "minecraft:crimson_forest"
      ],
      "key_item": "myths_and_legends:magma_stone"
    }
  },
  {
    "id": "mythsandlegends-hooh-1",
    "pokemon": "hooh",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:meadow",
        "minecraft:sunflower_plains",
        "minecraft:flower_forest"
      ],
      "key_item": "myths_and_legends:clear_bell"
    }
  },
  {
    "id": "mythsandlegends-hooh-2",
    "pokemon": "hooh",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_sky",
        "minecraft:sunflower_plains",
        "#cobblemon:is_summer"
      ],
      "key_item": "myths_and_legends:clear_bell"
    }
  },
  {
    "id": "mythsandlegends-hooh-3",
    "pokemon": "hooh",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:meadow",
        "minecraft:sunflower_plains",
        "minecraft:flower_forest"
      ],
      "key_item": "myths_and_legends:rainbow_wing"
    }
  },
  {
    "id": "mythsandlegends-hooh-4",
    "pokemon": "hooh",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_sky",
        "#minecraft:sunflower_plains",
        "#cobblemon:is_summer"
      ],
      "key_item": "myths_and_legends:rainbow_wing"
    }
  },
  {
    "id": "mythsandlegends-hoopa-1",
    "pokemon": "hoopa",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "50",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ]
    }
  },
  {
    "id": "mythsandlegends-hoopa-1",
    "pokemon": "hoopa",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "50",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ]
    }
  },
  {
    "id": "mythsandlegends-jirachi-1",
    "pokemon": "jirachi",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "5-70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:mushroom_fields",
        "minecraft:windswept_gravelly_hills"
      ]
    }
  },
  {
    "id": "mythsandlegends-jirachi-2",
    "pokemon": "jirachi",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "5-70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_magical",
        "#cobblemon:is_sparse"
      ]
    }
  },
  {
    "id": "mythsandlegends-keldeo-1",
    "pokemon": "keldeo",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#minecraft:is_hill",
        "#cobblemon:is_highlands",
        "#c:mountain_slope",
        "#forge:is_slope",
        "terralith:blooming_valley",
        "terralith:forested_highlands",
        "terralith:lavender_valley",
        "terralith:lush_valley",
        "terralith:moonlight_valley",
        "terralith:sakura_valley",
        "terralith:savanna_slopes",
        "terralith:temperate_highlands",
        "terralith:yosemite_lowlands",
        "wythers:autumnal_crags",
        "wythers:ayers_rock",
        "wythers:icy_crags",
        "wythers:old_growth_taiga_crags",
        "wythers:taiga_crags",
        "wythers:temperate_rainforest_crags",
        "wythers:thermal_taiga_crags",
        "wythers:windswept_jungle"
      ]
    }
  },
  {
    "id": "mythsandlegends-keldeo-2",
    "pokemon": "keldeo",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#minecraft:is_mountain",
        "#cobblemon:is_hills",
        "#forge:is_mountain",
        "terralith:stony_spires",
        "terralith:volcanic_peaks",
        "terralith:windswept_spires",
        "terralith:yosemite_cliffs",
        "wythers:tibesti_mountains"
      ]
    }
  },
  {
    "id": "mythsandlegends-koraidon-1",
    "pokemon": "koraidon",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "68-72",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:badlands",
        "minecraft:eroded_badlands",
        "minecraft:savanna",
        "minecraft:savanna_plateau"
      ],
      "key_item": "myths_and_legends:scarlet_book"
    }
  },
  {
    "id": "mythsandlegends-koraidon-2",
    "pokemon": "koraidon",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "68-.72",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_savanna",
        "#cobblemon:is_plateau",
        "#cobblemon:is_mountain"
      ],
      "key_item": "myths_and_legends:scarlet_book"
    }
  },
  {
    "id": "mythsandlegends-kubfu-1",
    "pokemon": "kubfu",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "15",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_jungle",
        "terralith:cave/underground_jungle",
        "wythers:dripleaf_swamp",
        "wythers:eucalyptus_deanei_forest",
        "wythers:highland_tropical_rainforest",
        "wythers:humid_tropical_grassland",
        "wythers:jungle_canyon",
        "wythers:subtropical_forest",
        "wythers:subtropical_forest_edge",
        "wythers:subtropical_grassland",
        "wythers:tropical_forest",
        "wythers:tropical_forest_canyon",
        "wythers:tropical_grassland",
        "wythers:tropical_island",
        "wythers:tropical_rainforest"
      ],
      "key_item": "myths_and_legends:kubfus_band"
    }
  },
  {
    "id": "mythsandlegends-kubfu-2",
    "pokemon": "kubfu",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "15",
    "weight": 3,
    "condition": {
      "biomes": [
        "wythers:bamboo_jungle_highlands",
        "#cobblemon:is_bamboo",
        "wythers:bamboo_jungle_canyon",
        "wythers:bamboo_jungle_highlands",
        "wythers:bamboo_jungle_swamp",
        "wythers:bamboo_swamp",
        "wythers:sakura_forest",
        "wythers:sandy_jungle",
        "wythers:sparse_bamboo_jungle"
      ],
      "key_item": "myths_and_legends:kubfus_band"
    }
  },
  {
    "id": "mythsandlegends-kyogre-1",
    "pokemon": "kyogre",
    "presets": [
      "freshwater",
      "underwater"
    ],
    "type": "pokemon",
    "context": "submerged",
    "bucket": "summons",
    "level": "45-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_ocean",
        "minecraft:deep_cold_ocean",
        "minecraft:deep_frozen_ocean",
        "minecraft:deep_ocean",
        "minecraft:ocean"
      ],
      "key_item": "myths_and_legends:blue_orb"
    }
  },
  {
    "id": "mythsandlegends-kyogre-2",
    "pokemon": "kyogre",
    "presets": [
      "freshwater",
      "underwater"
    ],
    "type": "pokemon",
    "context": "submerged",
    "bucket": "summons",
    "level": "45-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_ocean",
        "#cobblemon:is_ocean"
      ],
      "key_item": "myths_and_legends:blue_orb"
    }
  },
  {
    "id": "mythsandlegends-kyurem-1",
    "pokemon": "kyurem",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "75",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:frozen_peaks",
        "minecraft:snowy_slopes",
        "minecraft:snowy_taiga"
      ],
      "key_item": "myths_and_legends:dna_splicer"
    }
  },
  {
    "id": "mythsandlegends-kyurem-2",
    "pokemon": "kyurem",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "75",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_freezing",
        "#cobblemon:is_glacial",
        "#cobblemon:is_snowy_forest"
      ],
      "key_item": "myths_and_legends:dna_splicer"
    }
  },
  {
    "id": "mythsandlegends-landorus-1",
    "pokemon": "landorus",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-70",
    "weight": 3,
    "condition": {
      "isThundering": true,
      "biomes": [
        "minecraft:savanna",
        "minecraft:sunflower_plains",
        "minecraft:desert"
      ],
      "key_item": "myths_and_legends:reveal_glass_landorus"
    }
  },
  {
    "id": "mythsandlegends-latias-1",
    "pokemon": "latias",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "30-50",
    "weight": 3,
    "condition": {
      "biomes": [
        "terralith:mirage_isles",
        "minecraft:flower_forest",
        "minecraft:birch_forest"
      ],
      "key_item": "myths_and_legends:eon_ticket_latias"
    }
  },
  {
    "id": "mythsandlegends-latias-2",
    "pokemon": "latias",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "30-50",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_coast",
        "#cobblemon:is_temperate",
        "#cobblemon:is_beach"
      ],
      "key_item": "myths_and_legends:eon_ticket_latias"
    }
  },
  {
    "id": "mythsandlegends-latios-1",
    "pokemon": "latios",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "30-50",
    "weight": 3,
    "condition": {
      "biomes": [
        "terralith:mirage_isles",
        "minecraft:plains",
        "minecraft:mountain_edge"
      ],
      "key_item": "myths_and_legends:eon_ticket_latios"
    }
  },
  {
    "id": "mythsandlegends-latios-2",
    "pokemon": "latios",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "30-50",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_coast",
        "#cobblemon:is_temperate",
        "#cobblemon:is_beach"
      ],
      "key_item": "myths_and_legends:eon_ticket_latios"
    }
  },
  {
    "id": "mythsandlegends-lugia-1",
    "pokemon": "lugia",
    "presets": [
      "freshwater",
      "underwater"
    ],
    "type": "pokemon",
    "context": "submerged",
    "bucket": "summons",
    "level": "40-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_deep_ocean",
        "minecraft:deep_ocean",
        "minecraft:ocean"
      ],
      "key_item": "myths_and_legends:tidal_bell"
    }
  },
  {
    "id": "mythsandlegends-lugia-2",
    "pokemon": "lugia",
    "presets": [
      "freshwater",
      "underwater"
    ],
    "type": "pokemon",
    "context": "submerged",
    "bucket": "summons",
    "level": "40-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_ocean",
        "#cobblemon:is_ocean",
        "#cobblemon:is_cold_ocean"
      ],
      "key_item": "myths_and_legends:tidal_bell"
    }
  },
  {
    "id": "mythsandlegends-lugia-3",
    "pokemon": "lugia",
    "presets": [
      "freshwater",
      "underwater"
    ],
    "type": "pokemon",
    "context": "submerged",
    "bucket": "summons",
    "level": "40-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_ocean",
        "minecraft:deep_ocean",
        "minecraft:ocean"
      ],
      "key_item": "myths_and_legends:silver_wing"
    }
  },
  {
    "id": "mythsandlegends-lugia-4",
    "pokemon": "lugia",
    "presets": [
      "freshwater",
      "underwater"
    ],
    "type": "pokemon",
    "context": "submerged",
    "bucket": "summons",
    "level": "40-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_ocean",
        "#cobblemon:is_ocean",
        "#cobblemon:is_cold_ocean"
      ],
      "key_item": "myths_and_legends:silver_wing"
    }
  },
  {
    "id": "mythsandlegends-lunala-1",
    "pokemon": "lunala",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70-80",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:dark_forest",
        "byg:warped_desert",
        "#cobblemon:is_hills"
      ],
      "timeRange": "night",
      "key_item": "myths_and_legends:moon_flute"
    }
  },
  {
    "id": "mythsandlegends-magearna-1",
    "pokemon": "magearna",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "50",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_dark"
      ]
    }
  },
  {
    "id": "mythsandlegends-magearna-2",
    "pokemon": "magearna",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "50",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ]
    }
  },
  {
    "id": "mythsandlegends-magearna-3",
    "pokemon": "magearna",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "50",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_dark"
      ]
    }
  },
  {
    "id": "mythsandlegends-magearna-4",
    "pokemon": "magearna",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "50",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ]
    }
  },
  {
    "id": "mythsandlegends-marshadow-1",
    "pokemon": "marshadow",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:dark_forest",
        "minecraft:swamp"
      ]
    }
  },
  {
    "id": "mythsandlegends-marshadow-2",
    "pokemon": "marshadow",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_spooky",
        "#cobblemon:is_dark",
        "#cobblemon:is_deep_dark"
      ]
    }
  },
  {
    "id": "mythsandlegends-meloetta-1",
    "pokemon": "meloetta",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "50",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "none"
      ]
    }
  },
  {
    "id": "mythsandlegends-meltan-1",
    "pokemon": "meltan",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "20-40",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:taiga",
        "minecraft:snowy_taiga",
        "minecraft:mountains"
      ]
    }
  },
  {
    "id": "mythsandlegends-mesprit-1",
    "pokemon": "mesprit",
    "presets": [
      "water_surface"
    ],
    "type": "pokemon",
    "context": "surface",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:mangrove_swamp",
        "minecraft:swamp",
        "#byg:is_swamp",
        "#c:swamp",
        "#forge:is_swamp",
        "#wythers:is_swamp",
        "terralith:ice_marsh",
        "terralith:orchid_swampc",
        "wythers:billabong"
      ],
      "key_item": "myths_and_legends:mesprit_plume"
    }
  },
  {
    "id": "mythsandlegends-mesprit-2",
    "pokemon": "mesprit",
    "presets": [
      "water_surface"
    ],
    "type": "pokemon",
    "context": "surface",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_river",
        "wythers:lantern_river",
        "#minecraft:is_river",
        "wythers:tropical_forest_river",
        "#cobblemon:is_freshwater"
      ],
      "key_item": "myths_and_legends:mesprit_plume"
    }
  },
  {
    "id": "mythsandlegends-mew-1",
    "pokemon": "mew",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "30-70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_jungle",
        "minecraft:bamboo_jungle",
        "minecraft:jungle"
      ]
    }
  },
  {
    "id": "mythsandlegends-mew-2",
    "pokemon": "mew",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "30-70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_jungle",
        "#cobblemon:is_lush",
        "#cobblemon:is_bamboo"
      ]
    }
  },
  {
    "id": "mythsandlegends-mewtwo-1",
    "pokemon": "mewtwo",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70-75",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:windswept_gravelly_hills",
        "minecraft:dark_forest",
        "minecraft:deep_dark"
      ],
      "key_item": "myths_and_legends:dr_fujis_diary"
    }
  },
  {
    "id": "mythsandlegends-mewtwo-2",
    "pokemon": "mewtwo",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70-75",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_cave",
        "#cobblemon:is_deep_dark",
        "#cobblemon:is_spooky"
      ],
      "key_item": "myths_and_legends:dr_fujis_diary"
    }
  },
  {
    "id": "mythsandlegends-miraidon-1",
    "pokemon": "miraidon",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "68-72",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:windswept_gravelly_hills",
        "minecraft:deep_dark"
      ],
      "key_item": "myths_and_legends:violet_book"
    }
  },
  {
    "id": "mythsandlegends-miraidon-2",
    "pokemon": "miraidon",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "68-72",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_dark"
      ],
      "key_item": "myths_and_legends:violet_book"
    }
  },
  {
    "id": "mythsandlegends-moltres-1",
    "pokemon": "moltres",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:badlands",
        "minecraft:windswept_hills"
      ],
      "key_item": "myths_and_legends:tidal_bell_moltres"
    }
  },
  {
    "id": "mythsandlegends-moltres-2",
    "pokemon": "moltres",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_volcanic",
        "#cobblemon:is_thermal",
        "#cobblemon:is_sky"
      ],
      "key_item": "myths_and_legends:tidal_bell_moltres"
    }
  },
  {
    "id": "mythsandlegends-necrozma-1",
    "pokemon": "necrozma",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_dark"
      ],
      "key_item": "myths_and_legends:necro_prism",
      "shiny_stone_requirement": "3"
    }
  },
  {
    "id": "mythsandlegends-necrozma-2",
    "pokemon": "necrozma",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ],
      "key_item": "myths_and_legends:necro_prism",
      "shiny_stone_requirement": "3"
    }
  },
  {
    "id": "mythsandlegends-ogerpon-1",
    "pokemon": "ogerpon",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_floral",
        "#cobblemon:is_bamboo",
        "#cobblemon:is_jungle"
      ],
      "moonPhase": 1,
      "key_item": "myths_and_legends:teal_mask"
    }
  },
  {
    "id": "mythsandlegends-palkia-1",
    "pokemon": "Palkia",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "47-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "terralith:skylands_winter",
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ],
      "key_item": "myths_and_legends:lustrous_orb"
    }
  },
  {
    "id": "mythsandlegends-palkia-2",
    "pokemon": "Palkia",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "47-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "terralith:skylands_winter",
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "#cobblemon:is_end",
        "minecraft:small_end_islands"
      ],
      "key_item": "myths_and_legends:lustrous_orb"
    }
  },
  {
    "id": "mythsandlegends-pecharunt-1",
    "pokemon": "pecharunt",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:dark_forest",
        "minecraft:swamp"
      ]
    }
  },
  {
    "id": "mythsandlegends-pecharunt-2",
    "pokemon": "pecharunt",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:woodland_mansion",
        "minecraft:swamp_hut",
        "minecraft:pillager_outpost"
      ]
    }
  },
  {
    "id": "mythsandlegends-raikou-1",
    "pokemon": "raikou",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:plains",
        "minecraft:savanna",
        "minecraft:savanna_plateau"
      ],
      "key_item": "myths_and_legends:clear_bell_raikou"
    }
  },
  {
    "id": "mythsandlegends-raikou-2",
    "pokemon": "raikou",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_plains",
        "#cobblemon:is_grassland",
        "#cobblemon:is_arid"
      ],
      "key_item": "myths_and_legends:clear_bell_raikou"
    }
  },
  {
    "id": "mythsandlegends-rayquaza-1",
    "pokemon": "rayquaza",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "terralith:skylands_autumn",
        "terralith:skylands_spring",
        "terralith:skylands_summer",
        "terralith:skylands_winter",
        "#cobblemon:is_jungle",
        "#minecraft:is_jungle"
      ],
      "key_item": "myths_and_legends:jade_orb"
    }
  },
  {
    "id": "mythsandlegends-rayquaza-2",
    "pokemon": "rayquaza",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_sky",
        "#cobblemon:is_highlands",
        "minecraft:end_highlands",
        "#minecraft:is_end",
        "#cobblemon:is_end",
        "#cobblemon:is_jungle",
        "#minecraft:is_jungle"
      ],
      "key_item": "myths_and_legends:jade_orb"
    }
  },
  {
    "id": "mythsandlegends-regice-1",
    "pokemon": "regice",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:frozen_river",
        "minecraft:jagged_peaks",
        "minecraft:snowy_beach",
        "minecraft:snowy_plains",
        "minecraft:snowy_slopes",
        "#cobblemon:is_frozen_ocean",
        "#cobblemon:is_glacial",
        "#cobblemon:is_snowy_forest",
        "#byg:is_snowy",
        "#c:snowy",
        "#forge:is_snowy",
        "byg:cardinal_tundra",
        "terralith:emerald_peaks",
        "terralith:scarlet_mountains",
        "terralith:skylands_winter",
        "terralith:snowy_badlands",
        "wythers:crimson_tundra",
        "wythers:frozen_island",
        "wythers:snowy_bog",
        "wythers:snowy_canyon",
        "wythers:snowy_peaks",
        "wythers:snowy_tundra"
      ],
      "key_item": "myths_and_legends:ice_tablet"
    }
  },
  {
    "id": "mythsandlegends-regice-2",
    "pokemon": "regice",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_freezing",
        "#cobblemon:is_peak",
        "#cobblemon:is_taiga",
        "#cobblemon:is_tundra",
        "#byg:is_cold",
        "#c:climate_cold",
        "#forge:is_cold/overworld",
        "wythers:berry_bog"
      ],
      "key_item": "myths_and_legends:ice_tablet"
    }
  },
  {
    "id": "mythsandlegends-regice-3",
    "pokemon": "regice",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:frozen_river",
        "minecraft:jagged_peaks",
        "minecraft:snowy_beach",
        "minecraft:snowy_plains",
        "minecraft:snowy_slopes",
        "#cobblemon:is_frozen_ocean",
        "#cobblemon:is_glacial",
        "#cobblemon:is_snowy_forest",
        "#byg:is_snowy",
        "#c:snowy",
        "#forge:is_snowy",
        "byg:cardinal_tundra",
        "terralith:emerald_peaks",
        "terralith:scarlet_mountains",
        "terralith:skylands_winter",
        "terralith:snowy_badlands",
        "wythers:crimson_tundra",
        "wythers:frozen_island",
        "wythers:snowy_bog",
        "wythers:snowy_canyon",
        "wythers:snowy_peaks",
        "wythers:snowy_tundra"
      ],
      "key_item": "myths_and_legends:ancient_tablet"
    }
  },
  {
    "id": "mythsandlegends-regice-4",
    "pokemon": "regice",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_freezing",
        "#cobblemon:is_peak",
        "#cobblemon:is_taiga",
        "#cobblemon:is_tundra",
        "#byg:is_cold",
        "#c:climate_cold",
        "#forge:is_cold/overworld",
        "wythers:berry_bog"
      ],
      "key_item": "myths_and_legends:ancient_tablet"
    }
  },
  {
    "id": "mythsandlegends-regidrago-1",
    "pokemon": "regidrago",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_nether"
      ],
      "key_item": "myths_and_legends:scaly_tablet"
    }
  },
  {
    "id": "mythsandlegends-regidrago-2",
    "pokemon": "regidrago",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ],
      "key_item": "myths_and_legends:scaly_tablet"
    }
  },
  {
    "id": "mythsandlegends-regidrago-3",
    "pokemon": "regidrago",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ],
      "key_item": "myths_and_legends:ancient_tablet"
    }
  },
  {
    "id": "mythsandlegends-regidrago-4",
    "pokemon": "regidrago",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ],
      "key_item": "myths_and_legends:ancient_tablet"
    }
  },
  {
    "id": "mythsandlegends-regieleki-1",
    "pokemon": "regieleki",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_dark"
      ],
      "key_item": "myths_and_legends:plasma_tablet"
    }
  },
  {
    "id": "mythsandlegends-regieleki-2",
    "pokemon": "regieleki",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_dark"
      ],
      "key_item": "myths_and_legends:ancient_tablet"
    }
  },
  {
    "id": "mythsandlegends-regigigas-1",
    "pokemon": "regigigas",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_savanna",
        "#minecraft:savanna_plateau",
        "#wythers:is_dark_forest",
        "terralith:savanna_slopes",
        "terralith:ashen_savanna",
        "terralith:fractured_savanna",
        "terralith:savanna_badlands",
        "terralith:savanna_slopes",
        "minecraft:savanna_plateau",
        "#cobblemon:is_savanna"
      ],
      "custom_pokemons_in_team": [
        {
          "species": "regice",
          "count": 1
        },
        {
          "species": "regidrago",
          "count": 1
        },
        {
          "species": "regieleki",
          "count": 1
        },
        {
          "species": "regirock",
          "count": 1
        },
        {
          "species": "registeel",
          "count": 1
        }
      ],
      "key_item": "myths_and_legends:ancient_tablet"
    }
  },
  {
    "id": "mythsandlegends-regirock-1",
    "pokemon": "regirock",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "maxY": 63,
      "biomes": [
        "minecraft:desert",
        "#byg:is_desert",
        "#c:desert",
        "#wythers:is_desert",
        "terralith:ancient_sands",
        "terralith:desert_canyon",
        "terralith:cave/desert_caves",
        "terralith:desert_oasis",
        "terralith:desert_spires",
        "terralith:lush_desert",
        "terralith:red_oasis",
        "terralith:sandstone_valley",
        "wythers:badlands_desert",
        "wythers:desert_island",
        "wythers:kwongan_heath",
        "wythers:outback_desert",
        "wythers:red_desert",
        "wythers:sandy_jungle"
      ],
      "key_item": "myths_and_legends:stone_tablet"
    }
  },
  {
    "id": "mythsandlegends-regirock-2",
    "pokemon": "regirock",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "maxY": 63,
      "biomes": [
        "#minecraft:is_badlands",
        "#c:mesa",
        "terralith:ashen_savanna",
        "terralith:red_oasis",
        "terralith:warped_mesa",
        "terralith:white_mesa",
        "wythers:danakil_desert"
      ],
      "key_item": "myths_and_legends:stone_tablet"
    }
  },
  {
    "id": "mythsandlegends-regirock-3",
    "pokemon": "regirock",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "maxY": 63,
      "biomes": [
        "#minecraft:is_badlands",
        "#c:mesa",
        "terralith:ashen_savanna",
        "terralith:red_oasis",
        "terralith:warped_mesa",
        "terralith:white_mesa",
        "wythers:danakil_desert"
      ],
      "key_item": "myths_and_legends:ancient_tablet"
    }
  },
  {
    "id": "mythsandlegends-registeel-1",
    "pokemon": "registeel",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:deep_dark",
        "#cobblemon:is_deep_dark"
      ],
      "neededNearbyBlocks": [
        "minecraft:iron_block"
      ],
      "key_item": "myths_and_legends:steel_tablet"
    }
  },
  {
    "id": "mythsandlegends-registeel-2",
    "pokemon": "registeel",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:village"
      ],
      "neededNearbyBlocks": [
        "minecraft:iron_block"
      ],
      "key_item": "myths_and_legends:steel_tablet"
    }
  },
  {
    "id": "mythsandlegends-registeel-2",
    "pokemon": "registeel",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "40",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:village"
      ],
      "neededNearbyBlocks": [
        "minecraft:iron_block"
      ],
      "key_item": "myths_and_legends:ancient_tablet"
    }
  },
  {
    "id": "mythsandlegends-reshiram-1",
    "pokemon": "reshiram",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:savanna",
        "minecraft:sunflower_plains",
        "minecraft:desert"
      ],
      "minLight": 8,
      "maxLight": 15,
      "key_item": "myths_and_legends:light_stone"
    }
  },
  {
    "id": "mythsandlegends-shaymin-1",
    "pokemon": "shaymin",
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:meadow"
      ]
    }
  },
  {
    "id": "mythsandlegends-solgaleo-1",
    "pokemon": "solgaleo",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70-80",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_plateau",
        "minecraft:desert",
        "wythers:badlands_desert"
      ],
      "timeRange": "day",
      "key_item": "myths_and_legends:sun_flute"
    }
  },
  {
    "id": "mythsandlegends-spectrier-1",
    "pokemon": "spectrier",
    "presets": [],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_forest",
        "#cobblemon:is_dark_forest",
        "#cobblemon:is_plains"
      ],
      "key_item": "myths_and_legends:shaderoot_carrot"
    }
  },
  {
    "id": "mythsandlegends-spectrier-2",
    "pokemon": "spectrier",
    "presets": [],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_forest",
        "#cobblemon:is_spooky",
        "#cobblemon:is_plains"
      ],
      "key_item": "myths_and_legends:shaderoot_carrot"
    }
  },
  {
    "id": "mythsandlegends-suicune-1",
    "pokemon": "suicune",
    "presets": [
      "river"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:frozen_river",
        "minecraft:river"
      ],
      "key_item": "myths_and_legends:clear_bell_suicune"
    }
  },
  {
    "id": "mythsandlegends-suicune-2",
    "pokemon": "suicune",
    "presets": [
      "river"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_freshwater",
        "#cobblemon:is_cold_ocean"
      ],
      "key_item": "myths_and_legends:clear_bell_suicune"
    }
  },
  {
    "id": "mythsandlegends-tapubulu-1",
    "pokemon": "tapubulu",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_jungle",
        "terralith:cave/underground_jungle",
        "wythers:dripleaf_swamp",
        "wythers:eucalyptus_deanei_forest",
        "wythers:highland_tropical_rainforest",
        "wythers:humid_tropical_grassland",
        "wythers:jungle_canyon",
        "wythers:subtropical_forest",
        "wythers:subtropical_forest_edge",
        "wythers:subtropical_grassland",
        "wythers:tropical_forest",
        "wythers:tropical_forest_canyon",
        "wythers:tropical_grassland",
        "wythers:tropical_island",
        "wythers:tropical_rainforest"
      ],
      "key_item": "myths_and_legends:bulu_totem"
    }
  },
  {
    "id": "mythsandlegends-tapubulu-2",
    "pokemon": "tapubulu",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:stony_shore",
        "#cobblemon:is_beach",
        "#c:stony_shores",
        "terralith:basalt_cliffs",
        "terralith:granite_cliffs",
        "terralith:white_cliffs",
        "wythers:calcite_coast",
        "wythers:coastal_mangroves",
        "wythers:cold_island",
        "wythers:cold_stony_shore",
        "wythers:deepslate_shore",
        "wythers:frigid_island",
        "wythers:frozen_island",
        "wythers:gravelly_beach",
        "wythers:icy_shore",
        "wythers:mediterranean_island",
        "wythers:temperate_island",
        "wythers:tropical_island",
        "wythers:warm_stony_shore"
      ],
      "key_item": "myths_and_legends:bulu_totem"
    }
  },
  {
    "id": "mythsandlegends-tapufini-1",
    "pokemon": "tapufini",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_jungle",
        "terralith:cave/underground_jungle",
        "wythers:dripleaf_swamp",
        "wythers:eucalyptus_deanei_forest",
        "wythers:highland_tropical_rainforest",
        "wythers:humid_tropical_grassland",
        "wythers:jungle_canyon",
        "wythers:subtropical_forest",
        "wythers:subtropical_forest_edge",
        "wythers:subtropical_grassland",
        "wythers:tropical_forest",
        "wythers:tropical_forest_canyon",
        "wythers:tropical_grassland",
        "wythers:tropical_island",
        "wythers:tropical_rainforest"
      ],
      "key_item": "myths_and_legends:fini_totem"
    }
  },
  {
    "id": "mythsandlegends-tapufini-2",
    "pokemon": "tapufini",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:stony_shore",
        "#cobblemon:is_beach",
        "#c:stony_shores",
        "terralith:basalt_cliffs",
        "terralith:granite_cliffs",
        "terralith:white_cliffs",
        "wythers:calcite_coast",
        "wythers:coastal_mangroves",
        "wythers:cold_island",
        "wythers:cold_stony_shore",
        "wythers:deepslate_shore",
        "wythers:frigid_island",
        "wythers:frozen_island",
        "wythers:gravelly_beach",
        "wythers:icy_shore",
        "wythers:mediterranean_island",
        "wythers:temperate_island",
        "wythers:tropical_island",
        "wythers:warm_stony_shore"
      ],
      "key_item": "myths_and_legends:fini_totem"
    }
  },
  {
    "id": "mythsandlegends-tapukoko-1",
    "pokemon": "tapukoko",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_jungle",
        "terralith:cave/underground_jungle",
        "wythers:dripleaf_swamp",
        "wythers:eucalyptus_deanei_forest",
        "wythers:highland_tropical_rainforest",
        "wythers:humid_tropical_grassland",
        "wythers:jungle_canyon",
        "wythers:subtropical_forest",
        "wythers:subtropical_forest_edge",
        "wythers:subtropical_grassland",
        "wythers:tropical_forest",
        "wythers:tropical_forest_canyon",
        "wythers:tropical_grassland",
        "wythers:tropical_island",
        "wythers:tropical_rainforest"
      ],
      "key_item": "myths_and_legends:koko_totem"
    }
  },
  {
    "id": "mythsandlegends-tapukoko-2",
    "pokemon": "tapukoko",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:stony_shore",
        "#cobblemon:is_beach",
        "#c:stony_shores",
        "terralith:basalt_cliffs",
        "terralith:granite_cliffs",
        "terralith:white_cliffs",
        "wythers:calcite_coast",
        "wythers:coastal_mangroves",
        "wythers:cold_island",
        "wythers:cold_stony_shore",
        "wythers:deepslate_shore",
        "wythers:frigid_island",
        "wythers:frozen_island",
        "wythers:gravelly_beach",
        "wythers:icy_shore",
        "wythers:mediterranean_island",
        "wythers:temperate_island",
        "wythers:tropical_island",
        "wythers:warm_stony_shore"
      ],
      "key_item": "myths_and_legends:koko_totem"
    }
  },
  {
    "id": "mythsandlegends-tapulele-1",
    "pokemon": "tapulele",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_jungle",
        "terralith:cave/underground_jungle",
        "wythers:dripleaf_swamp",
        "wythers:eucalyptus_deanei_forest",
        "wythers:highland_tropical_rainforest",
        "wythers:humid_tropical_grassland",
        "wythers:jungle_canyon",
        "wythers:subtropical_forest",
        "wythers:subtropical_forest_edge",
        "wythers:subtropical_grassland",
        "wythers:tropical_forest",
        "wythers:tropical_forest_canyon",
        "wythers:tropical_grassland",
        "wythers:tropical_island",
        "wythers:tropical_rainforest"
      ],
      "key_item": "myths_and_legends:lele_totem"
    }
  },
  {
    "id": "mythsandlegends-tapulele-2",
    "pokemon": "tapulele",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:stony_shore",
        "#cobblemon:is_beach",
        "#c:stony_shores",
        "terralith:basalt_cliffs",
        "terralith:granite_cliffs",
        "terralith:white_cliffs",
        "wythers:calcite_coast",
        "wythers:coastal_mangroves",
        "wythers:cold_island",
        "wythers:cold_stony_shore",
        "wythers:deepslate_shore",
        "wythers:frigid_island",
        "wythers:frozen_island",
        "wythers:gravelly_beach",
        "wythers:icy_shore",
        "wythers:mediterranean_island",
        "wythers:temperate_island",
        "wythers:tropical_island",
        "wythers:warm_stony_shore"
      ],
      "key_item": "myths_and_legends:lele_totem"
    }
  },
  {
    "id": "mythsandlegends-terapagos-1",
    "pokemon": "terapagos",
    "presets": [],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "75",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_mountain",
        "#cobblemon:is_magical",
        "#cobblemon:is_river",
        "#cobblemon:is_jungle"
      ],
      "key_item": "myths_and_legends:prismatic_shell"
    }
  },
  {
    "id": "mythsandlegends-terapagos-2",
    "pokemon": "terapagos",
    "presets": [],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "75",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_mountain",
        "#cobblemon:is_magical",
        "#cobblemon:is_river",
        "#cobblemon:is_jungle"
      ],
      "key_item": "myths_and_legends:prismatic_shell"
    }
  },
  {
    "id": "mythsandlegends-terrakion-1",
    "pokemon": "terrakion",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_hill",
        "#cobblemon:is_highlands",
        "#c:mountain_slope",
        "#forge:is_slope",
        "terralith:blooming_valley",
        "terralith:forested_highlands",
        "terralith:lavender_valley",
        "terralith:lush_valley",
        "terralith:moonlight_valley",
        "terralith:sakura_valley",
        "terralith:savanna_slopes",
        "terralith:temperate_highlands",
        "terralith:yosemite_lowlands",
        "wythers:autumnal_crags",
        "wythers:ayers_rock",
        "wythers:icy_crags",
        "wythers:old_growth_taiga_crags",
        "wythers:taiga_crags",
        "wythers:temperate_rainforest_crags",
        "wythers:thermal_taiga_crags",
        "wythers:windswept_jungle"
      ],
      "key_item": "myths_and_legends:cavern_shield"
    }
  },
  {
    "id": "mythsandlegends-terrakion-2",
    "pokemon": "terrakion",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_mountain",
        "#cobblemon:is_hills",
        "#forge:is_mountain",
        "terralith:stony_spires",
        "terralith:volcanic_peaks",
        "terralith:windswept_spires",
        "terralith:yosemite_cliffs",
        "wythers:tibesti_mountains"
      ],
      "key_item": "myths_and_legends:cavern_shield"
    }
  },
  {
    "id": "mythsandlegends-thundurus-1",
    "pokemon": "thundurus",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-70",
    "weight": 3,
    "condition": {
      "isThundering": true,
      "biomes": [
        "minecraft:plains",
        "minecraft:mountains",
        "minecraft:badlands"
      ],
      "key_item": "myths_and_legends:reveal_glass_thundurus"
    }
  },
  {
    "id": "mythsandlegends-tornadus-1",
    "pokemon": "tornadus",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-70",
    "weight": 3,
    "condition": {
      "isThundering": true,
      "biomes": [
        "minecraft:jungle",
        "minecraft:bamboo_jungle",
        "minecraft:jungle_edge"
      ],
      "key_item": "myths_and_legends:reveal_glass_tornadus"
    }
  },
  {
    "id": "mythsandlegends-typenull-1",
    "pokemon": "typenull",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_deep_dark"
      ],
      "key_item": "myths_and_legends:type_null_mask"
    }
  },
  {
    "id": "mythsandlegends-typenull-2",
    "pokemon": "typenull",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:the_end",
        "minecraft:end_barrens",
        "minecraft:end_highlands",
        "minecraft:end_midlands",
        "minecraft:small_end_islands"
      ],
      "key_item": "myths_and_legends:type_null_mask"
    }
  },
  {
    "id": "mythsandlegends-uxie-1",
    "pokemon": "uxie",
    "presets": [
      "water_surface"
    ],
    "type": "pokemon",
    "context": "surface",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:mangrove_swamp",
        "minecraft:swamp",
        "#byg:is_swamp",
        "#c:swamp",
        "#forge:is_swamp",
        "#wythers:is_swamp",
        "terralith:ice_marsh",
        "terralith:orchid_swampc",
        "wythers:billabong"
      ],
      "key_item": "myths_and_legends:uxie_claw"
    }
  },
  {
    "id": "mythsandlegends-uxie-2",
    "pokemon": "uxie",
    "presets": [
      "water_surface"
    ],
    "type": "pokemon",
    "context": "surface",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_river",
        "wythers:lantern_river",
        "#minecraft:is_river",
        "wythers:tropical_forest_river",
        "#cobblemon:is_freshwater"
      ],
      "key_item": "myths_and_legends:uxie_claw"
    }
  },
  {
    "id": "mythsandlegends-victini-1",
    "pokemon": "victini",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70-100",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:badlands",
        "minecraft:eroded_badlands",
        "minecraft:savanna"
      ]
    }
  },
  {
    "id": "mythsandlegends-victini-2",
    "pokemon": "victini",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70-100",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_volcanic",
        "#cobblemon:is_thermal",
        "#cobblemon:is_savanna"
      ]
    }
  },
  {
    "id": "mythsandlegends-virizion-1",
    "pokemon": "virizion",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_hill",
        "#cobblemon:is_highlands",
        "#c:mountain_slope",
        "#forge:is_slope",
        "terralith:blooming_valley",
        "terralith:forested_highlands",
        "terralith:lavender_valley",
        "terralith:lush_valley",
        "terralith:moonlight_valley",
        "terralith:sakura_valley",
        "terralith:savanna_slopes",
        "terralith:temperate_highlands",
        "terralith:yosemite_lowlands",
        "wythers:autumnal_crags",
        "wythers:ayers_rock",
        "wythers:icy_crags",
        "wythers:old_growth_taiga_crags",
        "wythers:taiga_crags",
        "wythers:temperate_rainforest_crags",
        "wythers:thermal_taiga_crags",
        "wythers:windswept_jungle"
      ],
      "key_item": "myths_and_legends:grassland_blade"
    }
  },
  {
    "id": "mythsandlegends-virizion-2",
    "pokemon": "virizion",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#minecraft:is_mountain",
        "#cobblemon:is_hills",
        "#forge:is_mountain",
        "terralith:stony_spires",
        "terralith:volcanic_peaks",
        "terralith:windswept_spires",
        "terralith:yosemite_cliffs",
        "wythers:tibesti_mountains"
      ],
      "key_item": "myths_and_legends:grassland_blade"
    }
  },
  {
    "id": "mythsandlegends-volcanion-1",
    "pokemon": "volcanion",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "minecraft:crimson_forest"
      ]
    }
  },
  {
    "id": "mythsandlegends-volcanion-2",
    "pokemon": "volcanion",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#cobblemon:is_volcanic"
      ]
    }
  },
  {
    "id": "mythsandlegends-xerneas-1",
    "pokemon": "xerneas",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:flower_forest",
        "minecraft:forest",
        "minecraft:meadow"
      ],
      "key_item": "myths_and_legends:sapling_of_life"
    }
  },
  {
    "id": "mythsandlegends-xerneas-2",
    "pokemon": "xerneas",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_forest",
        "#cobblemon:is_magical",
        "#cobblemon:is_floral"
      ],
      "key_item": "myths_and_legends:sapling_of_life"
    }
  },
  {
    "id": "mythsandlegends-yveltal-1",
    "pokemon": "yveltal",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:dark_forest",
        "minecraft:swamp"
      ],
      "key_item": "myths_and_legends:cocoon_of_destruction"
    }
  },
  {
    "id": "mythsandlegends-yveltal-2",
    "pokemon": "yveltal",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_spooky",
        "#cobblemon:is_tundra"
      ],
      "key_item": "myths_and_legends:cocoon_of_destruction"
    }
  },
  {
    "id": "mythsandlegends-zacian-1",
    "pokemon": "zacian",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:flower_forest",
        "minecraft:meadow"
      ],
      "key_item": "myths_and_legends:rusted_sword"
    }
  },
  {
    "id": "mythsandlegends-zacian-2",
    "pokemon": "zacian",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_magical",
        "#cobblemon:is_forest",
        "#cobblemon:is_highlands"
      ],
      "key_item": "myths_and_legends:rusted_sword"
    }
  },
  {
    "id": "mythsandlegends-zamazenta-1",
    "pokemon": "zamazenta",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:taiga",
        "minecraft:windswept_forest"
      ],
      "key_item": "myths_and_legends:rusted_shield"
    }
  },
  {
    "id": "mythsandlegends-zamazenta-2",
    "pokemon": "zamazenta",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_plateau",
        "#cobblemon:is_savanna",
        "#cobblemon:is_highlands"
      ],
      "key_item": "myths_and_legends:rusted_shield"
    }
  },
  {
    "id": "mythsandlegends-zapdos-1",
    "pokemon": "zapdos",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:plains",
        "minecraft:savanna"
      ],
      "key_item": "myths_and_legends:tidal_bell_zapdos"
    }
  },
  {
    "id": "mythsandlegends-zapdos-2",
    "pokemon": "zapdos",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_sky",
        "#cobblemon:is_mountain"
      ],
      "key_item": "myths_and_legends:tidal_bell_zapdos"
    }
  },
  {
    "id": "mythsandlegends-zarude-1",
    "pokemon": "zarude",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "none"
      ]
    }
  },
  {
    "id": "mythsandlegends-zekrom-1",
    "pokemon": "zekrom",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "60-70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:swamp",
        "minecraft:dark_forest",
        "minecraft:roofed_forest"
      ],
      "minLight": 0,
      "maxLight": 7,
      "key_item": "myths_and_legends:dark_stone"
    }
  },
  {
    "id": "mythsandlegends-zeraora-1",
    "pokemon": "zeraora",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "ultra-rare",
    "level": "70",
    "weight": 0.3,
    "condition": {
      "biomes": [
        "#minecraft:is_savanna",
        "terralith:arid_highlands",
        "terralith:ashen_savanna",
        "terralith:brushland",
        "terralith:desert_oasis",
        "terralith:fractured_savanna",
        "terralith:hot_shrubland",
        "terralith:red_oasis",
        "terralith:savanna_badlands",
        "terralith:savanna_slopes",
        "terralith:shrubland",
        "wythers:granite_canyon",
        "wythers:tropical_forest_canyon",
        "wythers:tropical_forest"
      ]
    }
  },
  {
    "id": "mythsandlegends-zygarde-1",
    "pokemon": "zygarde",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "minecraft:birch_forest",
        "minecraft:forest",
        "minecraft:jungle",
        "minecraft:mangrove_swamp",
        "minecraft:swamp"
      ],
      "key_item": "myths_and_legends:zygarde_cube"
    }
  },
  {
    "id": "mythsandlegends-zygarde-2",
    "pokemon": "zygarde",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_forest",
        "#cobblemon:is_cave",
        "#cobblemon:is_swamp"
      ],
      "key_item": "myths_and_legends:zygarde_cube"
    }
  },
  {
    "id": "mythsandlegends-zygarde-3",
    "pokemon": "zygarde",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_forest",
        "#cobblemon:is_cave",
        "#cobblemon:is_swamp"
      ],
      "key_item": "myths_and_legends:zygarde_cell"
    }
  },
  {
    "id": "mythsandlegends-zygarde-4",
    "pokemon": "zygarde",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "70",
    "weight": 3,
    "condition": {
      "biomes": [
        "#cobblemon:is_forest",
        "#cobblemon:is_cave",
        "#cobblemon:is_swamp"
      ],
      "key_item": "myths_and_legends:zygarde_core"
    }
  },
  {
    "id": "chienpao-1",
    "pokemon": "chienpao",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3.0,
    "condition": {
      "biomes": [
        "#cobblemon:is_freezing"
      ],
      "key_item": "academy:sword_of_ruin"
    }
  },
  {
    "id": "chiyu-1",
    "pokemon": "chiyu",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3.0,
    "condition": {
      "biomes": [
        "minecraft:soul_sand_valley",
        "regions_unexplored:infernal_holt",
        "#cobblemon:is_volcanic"
      ],
      "key_item": "academy:beads_of_ruin"
    }
  },
  {
    "id": "tinglu-1",
    "pokemon": "tinglu",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3.0,
    "condition": {
      "biomes": [
        "#cobblemon:is_swamp"
      ],
      "key_item": "academy:vessel_of_ruin"
    }
  },
  {
    "id": "wochien-1",
    "pokemon": "wochien",
    "presets": [
      "natural"
    ],
    "type": "pokemon",
    "context": "grounded",
    "bucket": "summons",
    "level": "50-60",
    "weight": 3.0,
    "condition": {
      "biomes": [
        "minecraft:old_growth_spruce_taiga",
        "regions_unexplored:redwoods"
      ],
      "key_item": "academy:tablets_of_ruin"
    }
  }
]
};

// Helper to format technical names into readable text
// e.g. "minecraft:deep_cold_ocean" -> "Deep Cold Ocean"
// e.g. "myths_and_legends:blue_orb" -> "Blue Orb"
const formatName = (str: string): string => {
    if (!str) return "";
    
    // Remove namespace prefixes (minecraft:, mod_name:, #tag:)
    let clean = str.replace(/^.*:/, '');
    
    // Remove hash if it was a tag but didn't have a colon
    if (clean.startsWith('#')) clean = clean.substring(1);

    // Remove 'is_' prefix common in tags (e.g. is_ocean -> ocean)
    if (clean.startsWith('is_')) clean = clean.substring(3);

    // Replace underscores with spaces
    clean = clean.replace(/_/g, ' ');

    // Title Case
    return clean.replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeForMatch = (str: string): string => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const getSpawnInfo = (pokemonName: string): string | null => {
    const target = normalizeForMatch(pokemonName);
    
    // 1. Filter entries for this pokemon
    const entries = RAW_SPAWN_DATA.spawns.filter(s => normalizeForMatch(s.pokemon) === target);
    
    if (entries.length === 0) return null;

    // 2. Aggregate Data (using Sets to remove duplicates)
    const biomes = new Set<string>();
    const keyItems = new Set<string>();

    entries.forEach(entry => {
        // Add Biomes
        if (entry.condition && entry.condition.biomes) {
            entry.condition.biomes.forEach(b => {
                biomes.add(formatName(b));
            });
        }
        
        // Add Key Item
        if (entry.condition && entry.condition.key_item) {
            // Handle if key_item is an array or string (json usually string, but being safe)
            const item = entry.condition.key_item;
            if (Array.isArray(item)) {
                item.forEach(i => keyItems.add(formatName(i)));
            } else if (typeof item === 'string') {
                keyItems.add(formatName(item));
            }
        }
    });

    // 3. Construct Output String
    const biomeList = Array.from(biomes).sort().join(', ');
    const itemList = Array.from(keyItems).join(' or ');

    let result = "";
    
    if (itemList) {
        result += `Requires: ${itemList}. `;
    }
    
    if (biomeList) {
        result += `Biomes: ${biomeList}.`;
    }

    return result.trim();
};
