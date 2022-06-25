/* eslint-disable no-await-in-loop */
/* eslint-disable import/extensions */
/* eslint-disable camelcase */
import {
  elementTitel, elementDescriptionLong,
  elementAddress,
  elementTimeFrame,
} from './selector.js';

// interface event {
//   titel: string
//   description_short: string | null
//   description_long: string
//   timeframe: string
//   source_url: string
//   city: string,
//   zip_code: string,
//   event_url: string,
//   street: string
//   error_info: string[]

//   }

function replaceLineBreaks(string) {
  return string.replace(/<br>/g, '\n');
}

function getZipCodeFromString(string) {
  const stringWithoutLineBreaks = replaceLineBreaks(string);
  const zipCode = stringWithoutLineBreaks.match(/\d{5}/);
  return zipCode ? zipCode[0] : null;
}

function removeStringFromString(string, removeString) {
  return string.replace(removeString, '');
}

function getAddressDetails(string) {
  let string2 = string;
  let zipCode = null;
  let town = null;
  console.log('try to get zip code');
  zipCode = getZipCodeFromString(string2);
  console.log('zip code is ', zipCode);
  string2 = removeStringFromString(string2, zipCode);
  console.log(string2);
  console.log('try to get town and street');
  const [first, rest] = string2.split('<br>');
  console.log('street is', first);
  console.log('town is', rest);
  // remove space from string
  town = rest.replace(/\s/g, '');
  console.log(rest);
  return {
    // eslint-disable-next-line camelcase
    zip_code: zipCode,
    street: first,
    town,
  };
}

async function getTextOfElement(page, selector) {
  try {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    const text = await page.evaluate((el) => el.textContent, element);
    return { error: false, text };
  } catch (error) {
    console.error('error', error);
    return { error: true, message: error.message };
  }
}

async function getInnerHtmlOfElement(page, selector) {
  await page.waitForSelector(selector);
  const element = await page.$(selector);
  const html = await page.evaluate((el) => el.innerHTML, element);
  return html;
}

async function getAllLinksOfPage(pageUrl, page) {
  try {
    await page.goto(pageUrl);

    const urls = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.kurz'));
      return links.map((link) => {
        const url = link.children[0].href;
        const description = link.textContent;
        return { url, description };
      });
    });
    return urls;
  } catch (error) {
    console.log('error', error);
    return null;
  }
}

async function scrapeDataFromEventPage(links, page) {
  try {
    const errors = [];
    console.log('try to get titel');
    const maybeTitle = await getTextOfElement(page, elementTitel);
    if (maybeTitle.error) {
      errors.push(maybeTitle.message);
    }
    const title = maybeTitle.text || null;
    console.log('titel is ', title);

    console.log('try to get timeframe');
    const maybeTimeframe = await getTextOfElement(page, elementTimeFrame);
    if (maybeTimeframe.error) {
      errors.push(maybeTimeframe.message);
    }
    const timeframe = maybeTimeframe.text || null;
    console.log('timeframe is ', timeframe);

    console.log('try to get address');
    const maybeAddress = await getInnerHtmlOfElement(page, elementAddress);
    if (maybeAddress.error) {
      errors.push(maybeAddress.message);
    }
    const address = maybeAddress || null;
    console.log('address is ', address);

    console.log('try to get description_long');
    const maybeDescriptionLong = await getTextOfElement(page, elementDescriptionLong);
    if (maybeDescriptionLong.error) {
      errors.push(maybeDescriptionLong.message);
    }
    const descriptionLong = maybeDescriptionLong.text || null;
    console.log('descriptionLong is ', descriptionLong);

    console.log('try to get address details');
    let addressDetails = null;
    if (address) {
      addressDetails = getAddressDetails(address);
    }
    return {
      title,
      timeframe,
      full_address: address,
      description_long: descriptionLong,
      description_short: links.description,
      source_url: links.url,
      street: addressDetails.street || null,
      zip_code: addressDetails.zip_code || null,
      town: addressDetails.town || null,
      error_info: errors,
    };
  } catch (error) {
    console.log('error', error);
    return { error: error.message };
  }
}

async function initScrape(links, page) {
  const events = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < links.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await page.goto(links[i].url, {
      waitUntil: 'networkidle0',
    });

    await page.waitFor(5000);
    const event = await scrapeDataFromEventPage(links[i], page);
    events.push(event);
    console.log('event1', event);
  }
  console.log('try to return events', events);
  return events;
}
export {
  getAllLinksOfPage, scrapeDataFromEventPage, getTextOfElement, initScrape,
};
