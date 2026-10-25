// Quest definitions. Objective types:
//   kill    { monster, count }                 counted on the server per kill credit
//   collect { item, count }                    counted from the bag; consumed on turn-in
//   explore { x, z, radius, label }            reached in person
// Rewards are granted in the same database transaction as the turn-in.

export const QUESTS = {
  embers_at_the_gate: {
    id: 'embers_at_the_gate',
    name: 'Embers at the Gate',
    giver: 'warden_ilsa',
    level: 1,
    requires: [],
    summary: 'Thin the Dusk Wolves prowling the Greenhollow meadows south of Emberford.',
    offer: 'Every night they come closer to the south gate. Five fewer wolves means five fewer reasons for the children to stay inside. Will you go?',
    complete: 'Good work. The south watch will sleep a little easier tonight. Take these, you will need them.',
    objectives: [{ type: 'kill', monster: 'dusk_wolf', count: 5 }],
    rewards: { xp: 120, gold: 20, items: [['hp_draught', 3]] },
  },
  pelts_for_the_hall: {
    id: 'pelts_for_the_hall',
    name: 'Pelts for the Hall',
    giver: 'keeper_bram',
    level: 2,
    requires: ['embers_at_the_gate'],
    summary: 'Bring Keeper Bram six Dusk Wolf Pelts to line the Hall of Embers before the cold season.',
    offer: 'The Hall is drafty and the winters here are long. Six good pelts, and I will see you are properly kitted for the road.',
    complete: 'Fine pelts, cleanly taken. Here, a hood stitched from the last batch. It will keep the rain off.',
    objectives: [{ type: 'collect', item: 'wolf_pelt', count: 6 }],
    rewards: { xp: 180, gold: 30, items: [['hide_hood', 1]] },
  },
  the_mires_bounty: {
    id: 'the_mires_bounty',
    name: "The Mire's Bounty",
    giver: 'merchant_odd',
    level: 3,
    requires: [],
    summary: 'Mire Toads along the Hollowmere shore carry glands that Pell Oddery can sell to apothecaries. Bring four.',
    offer: 'Apothecaries in the river towns pay well for mire glands. The toads are lazy until you poke them. Four glands, and we both profit.',
    complete: 'Lovely and pungent. Your share, as promised, and a draught or two on the house.',
    objectives: [{ type: 'collect', item: 'toad_gland', count: 4 }],
    rewards: { xp: 220, gold: 45, items: [['mp_draught', 3], ['hp_draught', 2]] },
  },
  thornback_trouble: {
    id: 'thornback_trouble',
    name: 'Thornback Trouble',
    giver: 'smith_harrow',
    level: 4,
    requires: [],
    summary: 'Thornback Boars have been goring the charcoal burners on the edge of Thornwood. Drive them back.',
    offer: 'My charcoal comes from the burners out by Thornwood, and the boars have been savaging them. No charcoal, no forge. Put down six of the brutes.',
    complete: 'The burners send their thanks, and so do I. Take this, forged with their charcoal.',
    objectives: [{ type: 'kill', monster: 'thornback_boar', count: 6 }],
    rewards: { xp: 380, gold: 60, items: [['marsh_treads', 1]] },
  },
  the_pack_elder: {
    id: 'the_pack_elder',
    name: 'The Pack Elder',
    giver: 'warden_ilsa',
    level: 4,
    requires: ['embers_at_the_gate'],
    summary: 'Old Greymaw leads the Greenhollow pack from the far south meadow. Bring Warden Ilsa its fang.',
    offer: 'The wolves will keep coming while Old Greymaw leads them. It lairs in the far south meadow. Watch for the ground-slam: when the earth glows red beneath you, move. Bring me its fang.',
    complete: 'So the old wolf is finally dead. Emberford owes you. Take a weapon from our armoury, you have earned it.',
    objectives: [{ type: 'collect', item: 'greymaw_fang', count: 1 }],
    rewards: {
      xp: 650, gold: 120,
      classItems: { vanguard: 'harrow_longsword', shadeblade: 'thornspike_knives', arcanist: 'cinder_staff', wardweaver: 'bellwood_rod' },
    },
  },
  light_on_the_ridge: {
    id: 'light_on_the_ridge',
    name: 'Light on the Ridge',
    giver: 'warden_ilsa',
    level: 6,
    requires: ['the_pack_elder'],
    summary: 'Scout Shardscar Ridge to the north and shatter one of the Veilshards that has taken root there.',
    offer: 'Something is calling the beasts north, and I think it is the shards. Climb Shardscar Ridge, find a Veilshard and break it. It will fight back in its own way.',
    complete: 'You broke one? Then they can be broken. That is the best news this town has had in a generation.',
    objectives: [
      { type: 'explore', x: 0, z: -118, radius: 22, label: 'Reach Shardscar Ridge' },
      { type: 'kill', monster: 'veilshard', count: 1 },
    ],
    rewards: { xp: 1400, gold: 200, items: [['veil_fragment', 3], ['shard_signet', 1]] },
  },
};

export const QUEST_IDS = Object.keys(QUESTS);
