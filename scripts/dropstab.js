import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import puppeteer from 'puppeteer';

import prisma from '../lib/prisma'
import findMatchingCoinDropstab from '../utils/findMatchingCoinDropstab';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const fetchCoinData = async (url, page, coin) => {
  console.log('Fetch launch data for', coin.symbol);
  await page.goto(url, {waitUntil: 'domcontentloaded'});

  const hasRoi = await page.evaluate(() => window.find("ROI since ICO"));
  if (!hasRoi) { return; }

  let price = await page.$eval('[aria-label="Price Statistics"] div:nth-child(2) dd', (element) => element.innerText);
  price = price.replace('$', '').trim();

  const launchDates = await page.$eval('[aria-label="Price Statistics"] div:nth-child(3) dd', (element) => element.innerText);
  let [launchDateStart, launchDateEnd] = launchDates.split(' - ');
  launchDateStart = new Date(Date.parse(launchDateStart));
  launchDateEnd = new Date(Date.parse(launchDateEnd));

  await prisma.coin.update({
    where: {
      id: coin.id
    },
    data: {
      launch_price: price,
      launch_date_start: launchDateStart,
      launch_date_end: launchDateEnd
    }
  })
}

const getDropsTabData = async (page) => {
  await page.goto('https://dropstab.com/', {waitUntil: 'load'});
  await page.waitForTimeout(2000); // Wait for the next button to become interactive

  const data = [];
  let hasNextPage = true;
  let currentPage = 1;

  while (hasNextPage) {
    console.log('Scraping page #', currentPage);
    const pageData = await page.$$eval('table tbody td:nth-child(3)', (elements) => {
      const data = [];
      for (const element of elements) {
        const url = element.querySelector('a').href;
        const symbolElement = element.querySelector('.uppercase')
        const symbol = symbolElement.innerText;
        const name = symbolElement.nextSibling.innerText;
        data.push({
          url,
          symbol,
          name
        })
      }

      return data;
    });

    data.push(...pageData)

    const nextPage = await page.$('[aria-label="Next page"]');
    if (nextPage) {
      await nextPage.click();
      currentPage++;
      await page.waitForFunction(
        (currentPage) => {
          const params = new URLSearchParams(window.location.search);
          return params.get('p') == currentPage;
        },
        {},
        currentPage
      )
    } else {
      hasNextPage = false
    }
  }

  return data
}

const dropsTab = async () => {
  let browser;
  const transaction = Sentry.startTransaction({
    op: "Fetch ROI",
    name: "Fetch ROI Transaction",
  });
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    const dropsTabData = await getDropsTabData(page);

    for (const dropsData of dropsTabData) {
      const coin = await findMatchingCoinDropstab(dropsData.symbol, dropsData.name);
      if (coin) {
        await fetchCoinData(dropsData.url, page, coin);
      }
    }
  } catch (error) {
    console.log(error)
    Sentry.captureException(error);
    throw(error)
  } finally {
    browser?.close();
    transaction.finish();
  }
}

dropsTab()