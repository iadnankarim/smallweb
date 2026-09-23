import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PeopleService } from '../people/people.service';
import { SitesService } from '../sites/sites.service';
import { VisitsService } from '../visits/visits.service';
import { sanitizeAuthorHtml } from '../common/sanitize';
import { buildSeedVisits, PEOPLE, SEED_CREATED_AT, SEED_SITES } from './data';

/**
 * Deterministic seed: same ids, addresses and timestamps every run.
 * Every write is an upsert, so running this twice never doubles the web.
 */
async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const people = app.get(PeopleService);
    const sites = app.get(SitesService);
    const visits = app.get(VisitsService);

    for (const person of PEOPLE) {
      await people.upsert(person);
    }
    console.log(`Seeded ${PEOPLE.length} people.`);

    for (const site of SEED_SITES) {
      await sites.upsert({
        address: site.address,
        title: site.title,
        authorId: site.authorId,
        html: sanitizeAuthorHtml(site.html),
        createdAt: SEED_CREATED_AT,
      });
    }
    console.log(`Seeded ${SEED_SITES.length} sites.`);

    const seedVisits = buildSeedVisits();
    for (const visit of seedVisits) {
      await visits.upsert(visit);
    }
    console.log(`Seeded ${seedVisits.length} visits.`);
  } finally {
    await app.close();
  }
}

run()
  .then(() => {
    console.log('Seed complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
