/**
 * The seed web: same content as web/src/lib/mock/*.ts, ported so the real database
 * and the frontend's in-browser mock agree. Deterministic: the same run always
 * produces the same sites, people and visits at the same addresses and ids.
 */

export interface SeedPerson {
  id: string;
  name: string;
}

export const PEOPLE: SeedPerson[] = [
  { id: 'mira', name: 'Mira Okafor' },
  { id: 'tomas', name: 'Tomas Lind' },
  { id: 'ines', name: 'Ines Varga' },
  { id: 'dev', name: 'Dev Arora' },
  { id: 'kofi', name: 'Kofi Mensah' },
];

export interface SeedSite {
  address: string;
  title: string;
  authorId: string;
  html: string;
}

export const SEED_CREATED_AT = '2026-09-01T09:00:00.000Z';

export const SEED_SITES: SeedSite[] = [
  {
    address: 'keeper.zz',
    title: 'The Keeper’s Notes',
    authorId: 'tomas',
    html: `<h1>The Keeper’s Notes</h1>
<p>The lamp has not needed a keeper since the automation in 1987, but somebody still has to write down what the sea does. I climb the ninety-one steps at dawn and at dusk, and I log the tide, the wind, and whatever came ashore.</p>
<p>Low tide this morning at 5:12. The rocks below the lamp were dry for the first time since March, and the pools were full of small, busy lives. Ines keeps far better notes on those than I do; her <a href="tidepool.zz">tidepool pages</a> are where I send anyone who asks.</p>
<h2>What the lamp is for now</h2>
<p>Mostly it is for the lantern makers, who come up twice a year to see how the old lens bends light. Their workshop is <a href="lanternmakers.zz">down in the town</a>. The ferry that used to bring them across has its own page somewhere, <a href="oldferry.zz">an old ferry timetable</a>, though I have never managed to find it.</p>
<p>Wind from the south-west tonight. The gulls are sitting on the water, which my grandmother said meant rain by morning. I will write down whether she was right.</p>`,
  },
  {
    address: 'tidepool.zz',
    title: 'What the low tide leaves behind',
    authorId: 'ines',
    html: `<h1>What the low tide leaves behind</h1>
<p>Twice a day the sea pulls back from the rocks below the lighthouse and leaves a hundred small rooms full of water. I have been keeping notes on them for three summers now. The anemones close like fists when the sun finds them; the hermit crabs trade shells in a queue that looks almost polite.</p>
<p>For the long view, <a href="keeper.zz">the keeper’s notes</a> go back further than mine. For what to do with the kelp that washes up, try <a href="kelpkitchen.zz">the kelp kitchen</a>. The pools on the north side are marked on <a href="harbourmap.zz">the old harbour map</a>, if you can find it.</p>
<h2>The pool nobody names</h2>
<p>The best pool sits just past the third rock. At the lowest tide of the month you can see its whole floor: green, then violet, then a starfish the colour of a brick. I have never moved anything in it. I only look, and write, and leave before the tide comes back.</p>
<p>When the water is out, the birds come down from <a href="saltmarsh.zz">the saltmarsh</a> to see what the tide forgot. They are better at finding things than I am.</p>`,
  },
  {
    address: 'saltmarsh.zz',
    title: 'Saltmarsh Birds',
    authorId: 'ines',
    html: `<h1>Saltmarsh Birds</h1>
<p>The marsh behind the dunes floods with every spring tide and drains again within the hour. Oystercatchers arrive as the tide goes out; by low water the mud is loud with them, and with redshanks, and with one grey heron who does not like company.</p>
<p>I count them from the sea wall with a notebook and a thermos. Some mornings the count is three hundred. Some mornings it is the heron and me.</p>
<p>If you come out on the late train, the <a href="nighttrains.zz">night trains page</a> says which one stops at the halt by the marsh. After the birds, walk inland along the river and look for <a href="riverstones.zz">the river stones</a>; it takes about an hour. Or go back down to <a href="tidepool.zz">the tidepools</a> and see what the tide left.</p>`,
  },
  {
    address: 'kelpkitchen.zz',
    title: 'Kelp Kitchen',
    authorId: 'dev',
    html: `<h1>Kelp Kitchen</h1>
<p>Gather only what the tide has already let go of. Kelp still holding onto a rock is still working. Rinse what you find twice in fresh water, hang it on a rack in the wind, and wait two dry days.</p>
<h2>Kelp crisps</h2>
<ol><li>Cut dried kelp into pieces the size of a playing card.</li><li>Brush with a little oil.</li><li>Bake in a low oven until they curl and turn pale green.</li></ol>
<p>They go well with the apple chutney from <a href="orchardledger.zz">the orchard ledger</a>. I was told the bakery by the harbour sells a kelp loaf; its page is supposedly at <a href="moonbakery.zz">moonbakery.zz</a>, but I have never seen it load.</p>
<p>I learned which pools to gather near from <a href="tidepool.zz">the tidepool notes</a>. Never take from a pool with a starfish in it.</p>`,
  },
  {
    address: 'nighttrains.zz',
    title: 'Night Trains',
    authorId: 'dev',
    html: `<h1>Night Trains</h1>
<p>The 23:40 to the coast is the only train that still has a dining car. I ride it for the soup, which is lentil on Tuesdays and something with barley the rest of the week.</p>
<p>It stops at the halt by <a href="saltmarsh.zz">the saltmarsh</a> at 01:10 if you ask the guard. Nobody else ever asks. After that the line runs along the cliffs with the carriage lights off, and on a clear night you can see more stars than the <a href="stargazing.zz">flat-roof stargazers</a> do from town.</p>
<h2>Things to bring</h2>
<ul><li>A book you have already read once.</li><li>Paper and a pen. The carriage is too dark for screens to feel right.</li><li>Coins for the soup.</li></ul>
<p>Mira writes her letters on this train. Some of them end up on <a href="typewriter.zz">her typewriter page</a>.</p>`,
  },
  {
    address: 'lanternmakers.zz',
    title: 'The Lantern Makers',
    authorId: 'tomas',
    html: `<h1>The Lantern Makers</h1>
<p>There are four of us left in the workshop on Chapel Street. We make storm lanterns the old way: brass frames, hand-blown glass, and a wick you can trim with a coin.</p>
<p>Twice a year we walk up to the lighthouse to look at the great lens. The <a href="keeper.zz">keeper</a> lets us stand inside it. A lens that size teaches you more about light than any book.</p>
<h2>Why lanterns still</h2>
<p>Because the power goes out every winter, and because a lantern on a windowsill tells a neighbour you are home. The people who watch the sky from <a href="stargazing.zz">the flat roof</a> borrow our red-glass lanterns so their eyes stay used to the dark.</p>`,
  },
  {
    address: 'orchardledger.zz',
    title: 'The Orchard Ledger',
    authorId: 'kofi',
    html: `<h1>The Orchard Ledger</h1>
<p>Forty-one trees, eleven varieties, one ledger. I write down every tree: when it flowered, what the frost did, how many baskets it gave, and who came to help pick.</p>
<p>The late apples go to chutney. The recipe is on the <a href="kelpkitchen.zz">kelp kitchen</a> page now, because Dev asked for it and cooks it better than I do. The early pears go to the bakery at the harbour, which people tell me has <a href="moonbakery.zz">a page of its own</a>.</p>
<h2>This year</h2>
<p>A wet spring, a dry August, and a heavy crop on the old Bramley by the gate. The ledger says the same thing happened in 2019. The ledger is usually right.</p>
<p>After picking, I walk down to the river and sit on <a href="riverstones.zz">the flat stones</a> until my back stops complaining.</p>`,
  },
  {
    address: 'stargazing.zz',
    title: 'Stargazing from a Flat Roof',
    authorId: 'kofi',
    html: `<h1>Stargazing from a Flat Roof</h1>
<p>You do not need a telescope. You need a flat roof, a blanket, twenty minutes for your eyes to adjust, and a red lantern from <a href="lanternmakers.zz">the lantern makers</a> so you can read your chart without undoing all that waiting.</p>
<p>From town we see the bright ones: Vega, Arcturus, the Plough. The people on <a href="nighttrains.zz">the night train</a> along the cliffs see far more, and I am jealous of them.</p>
<h2>What to look for this month</h2>
<ul><li>The Summer Triangle, high overhead just after dark.</li><li>Jupiter rising in the east before midnight.</li><li>The Milky Way, if the harbour lights are off.</li></ul>
<p>Mira once wrote a letter describing the whole sky from memory. It is on <a href="typewriter.zz">her typewriter page</a>.</p>`,
  },
  {
    address: 'typewriter.zz',
    title: 'Letters from a Typewriter',
    authorId: 'mira',
    html: `<h1>Letters from a Typewriter</h1>
<p>I write letters on a 1962 Olivetti and I put some of them here, with the names taken out. Typing slowly makes you decide what you mean before you say it.</p>
<h2>Letter to a friend who moved inland</h2>
<blockquote><p>The pears came in early this year; Kofi’s <a href="orchardledger.zz">ledger</a> says it was the dry August. I took the late train to the coast on Tuesday for the lentil soup, as you told me to. You were right about the soup.</p></blockquote>
<h2>Letter describing the sky</h2>
<blockquote><p>Vega overhead, bright and blue. Arcturus low in the west. Jupiter coming up over the harbour like a lamp somebody forgot to put out.</p></blockquote>
<p>Most of these were written on <a href="nighttrains.zz">the night train</a>. A few were written at the lighthouse, where the <a href="keeper.zz">keeper</a> lets me use the table by the window.</p>`,
  },
  {
    address: 'riverstones.zz',
    title: 'River Stones',
    authorId: 'ines',
    html: `<h1>River Stones</h1>
<p>An hour inland from <a href="saltmarsh.zz">the saltmarsh</a>, the river widens and slows over a bed of flat grey stones. In late summer the water is low enough to cross on them without getting your feet wet, if you know the way.</p>
<p>I have started a map of the crossing, stone by stone. The first stone is the one shaped like a loaf; the ninth wobbles; never trust the eleventh.</p>
<p>The orchard is on the far bank. You can hear <a href="orchardledger.zz">Kofi’s ledger</a> being written from the water, or at least you can hear him arguing with the Bramley tree. There used to be a ferry here before the stones were found; someone told me there is <a href="oldferry.zz">a page about it</a>.</p>`,
  },
];

export type Via =
  'typed' | 'link' | 'back' | 'forward' | 'history' | 'search' | 'reload';
export type Step = [
  kind: 'page' | 'search',
  address: string,
  via: Via,
  found?: boolean,
];

const TITLES: Record<string, string> = {
  'keeper.zz': 'The Keeper’s Notes',
  'tidepool.zz': 'What the low tide leaves behind',
  'saltmarsh.zz': 'Saltmarsh Birds',
  'kelpkitchen.zz': 'Kelp Kitchen',
  'nighttrains.zz': 'Night Trains',
  'lanternmakers.zz': 'The Lantern Makers',
  'orchardledger.zz': 'The Orchard Ledger',
  'stargazing.zz': 'Stargazing from a Flat Roof',
  'typewriter.zz': 'Letters from a Typewriter',
  'riverstones.zz': 'River Stones',
};

const TRAILS: Record<string, { start: string; steps: Step[] }> = {
  mira: {
    start: '2026-09-21T13:02:00.000Z',
    steps: [
      ['page', 'keeper.zz', 'typed'],
      ['page', 'tidepool.zz', 'link'],
      ['page', 'kelpkitchen.zz', 'link'],
      ['page', 'orchardledger.zz', 'link'],
      ['page', 'riverstones.zz', 'link'],
      ['page', 'saltmarsh.zz', 'link'],
      ['page', 'nighttrains.zz', 'link'],
      ['page', 'stargazing.zz', 'link'],
      ['page', 'lanternmakers.zz', 'link'],
      ['page', 'stargazing.zz', 'back'],
      ['page', 'typewriter.zz', 'link'],
      ['page', 'harbourmap.zz', 'typed', false],
      ['search', 'low tide', 'typed'],
      ['page', 'tidepool.zz', 'search'],
      ['page', 'keeper.zz', 'history'],
    ],
  },
  tomas: {
    start: '2026-09-21T13:10:00.000Z',
    steps: [
      ['page', 'keeper.zz', 'typed'],
      ['page', 'lanternmakers.zz', 'link'],
      ['page', 'stargazing.zz', 'link'],
      ['page', 'lanternmakers.zz', 'back'],
      ['page', 'keeper.zz', 'back'],
      ['page', 'oldferry.zz', 'link', false],
    ],
  },
  ines: {
    start: '2026-09-21T13:18:00.000Z',
    steps: [
      ['page', 'tidepool.zz', 'typed'],
      ['page', 'harbourmap.zz', 'link', false],
      ['page', 'tidepool.zz', 'back'],
      ['page', 'saltmarsh.zz', 'link'],
      ['page', 'riverstones.zz', 'link'],
    ],
  },
  dev: {
    start: '2026-09-21T13:25:00.000Z',
    steps: [
      ['page', 'kelpkitchen.zz', 'typed'],
      ['page', 'moonbakery.zz', 'link', false],
      ['page', 'kelpkitchen.zz', 'back'],
      ['search', 'soup', 'typed'],
      ['page', 'nighttrains.zz', 'search'],
    ],
  },
  kofi: {
    start: '2026-09-21T13:31:00.000Z',
    steps: [
      ['page', 'orchardledger.zz', 'typed'],
      ['page', 'kelpkitchen.zz', 'link'],
      ['page', 'tidepool.zz', 'link'],
      ['page', 'keeper.zz', 'link'],
      ['page', 'oldferry.zz', 'link', false],
      ['page', 'keeper.zz', 'back'],
      ['page', 'orchardledger.zz', 'typed'],
    ],
  },
};

export interface SeedVisit {
  id: string;
  personId: string;
  kind: 'page' | 'search';
  address: string;
  title: string;
  via: Via;
  found: boolean;
  at: string;
}

export function buildSeedVisits(): SeedVisit[] {
  const visits: SeedVisit[] = [];
  for (const [personId, trail] of Object.entries(TRAILS)) {
    const t0 = new Date(trail.start).getTime();
    trail.steps.forEach(([kind, address, via, found = true], i) => {
      visits.push({
        id: `seed-${personId}-${String(i + 1).padStart(2, '0')}`,
        personId,
        kind,
        address,
        title:
          kind === 'search'
            ? `Search: ${address}`
            : found
              ? (TITLES[address] ?? address)
              : address,
        via,
        found,
        at: new Date(t0 + i * 3 * 60_000 + (i % 3) * 25_000).toISOString(),
      });
    });
  }
  return visits;
}
