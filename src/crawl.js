/* eslint-disable import/extensions */
/* eslint-disable no-await-in-loop */
import { launch } from 'puppeteer';
import { getAllLinksOfPage, initScrape } from './utils.js';
import config from './config.js';

(async () => {
  const browser = await launch({
    headless: true,
  });
  const page = await browser.newPage();
  console.log('try to get all links of page');
  const links = await getAllLinksOfPage(config.sourceUrl, page);
  console.log('links', links);

  if (!links) {
    console.log('no links found');
    await browser.close();
    return;
  }

  // eslint-disable-next-line no-plusplus
  const events = await initScrape(links, page);
  // TODO send events to server
  console.log('final eveents', events);

  await browser.close();
})();
