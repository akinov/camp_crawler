const puppeteer = require('puppeteer');
const { IncomingWebhook } = require("@slack/webhook");

const webhook = new IncomingWebhook("https://hooks.slack.com/services/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");

const notifySlack = async (text) => {
  await webhook.send({
    text: text,
  });
};

const mapFromSelector = async (page, selector) => {
  return await page.evaluate((selector) => {
    const list = Array.from(document.querySelectorAll(selector));
    return list.map(data => data.textContent.trim());
  }, selector);
}

const crawlFmotoppara = async (page) => {
  console.log('crawlFmotoppara start')
  // pageをリロード
  // screenshot(page)
  await page.reload({waitUntil: ['load'], timeout: 5000});
  // screenshot(page)
  // カレンダー取得
  const calendarHeaderSelector = ".calendar-table thead .cell-date  p:first-of-type";
  const calendarSelector = ".calendar-table tbody tr:nth-child(2) .cell-date p:first-of-type";
  console.log(new Date())
  await page.waitForSelector(calendarSelector, {timeout: 10000});
  console.log(new Date())
  var dates = await mapFromSelector(page, calendarHeaderSelector);
  // console.log(dates)
  // console.log(dates.length)

  var data = await mapFromSelector(page, calendarSelector);
  console.log(data)
  // console.log(data.length)

  const checkDates = [
    '11/9',
    '9/28',
    // '11/29'
  ]
  const isAvailableText = ['〇', '△']
  let availableDates = []
  checkDates.forEach((checkDate, idx) => {
    // console.log(dates)
    const index = dates.indexOf(checkDate)
    // console.log(checkDate, index)
    if (index !== -1) {
      const isAvailable = isAvailableText.indexOf(data[index]) !== -1
      if (isAvailable) {
        checkDates.splice(idx, 1)
        console.log(checkDates)
        reserve(page, index)
        availableDates.push(checkDate)
      }
    }
  })

  if (availableDates.length > 0) {
    // notifySlack('test');
//     // notify to Slack
//     notifySlack(`ふもとっぱら予約可能日があります。
// https://reserve.fumotoppara.net/
// ${availableDates.join(', ')}`)
    console.log(availableDates)
    console.log('💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡')
    console.log('💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡')
    console.log('💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡')
    console.log('💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡')
    console.log('💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡💡')
  }
}

const reserve = async (page, index) => {
  console.log(`reserve!!!! ${index}`)
  const selector = `.calendar-table tbody tr:nth-child(2) .cell-date:nth-child(${index}) a`
  await page.waitForTimeout(1000);
  await page.click(selector)
  await page.waitForTimeout(1000);
  await page.click('button.el-button.el-button--success')

  await page.waitForTimeout(1000);
  await page.click('.is-required .el-select .el-input')

  await page.waitForTimeout(500);
  await page.click('body > .el-select-dropdown.el-popper .el-select-dropdown__item:nth-child(2)')
  await page.waitForTimeout(500);
  await page.click('h4 + div > .el-form-item.is-no-asterisk.is-required .el-input-group__append')
  await page.click('h4 + div > .el-form-item.is-no-asterisk.is-required .el-input-group__append')
  await page.waitForTimeout(1000);
  await page.click('.el-button.el-button--primary')
  await page.waitForTimeout(1000);
  await page.click('.el-button.el-button--primary')
}

const screenshot = async (page) => {
  page.screenshot({ path: 'logged-in-page.png', fullPage: true });
};

(async () => {
  const browserSet = {
    headless: false,
    args: ['--lang=ja'], // デフォルトでは言語設定が英語なので日本語に変更
    args: [`--window-size=1920,2160`],
    defaultViewport: {
      width:1920,
      height:2160
    },
    // executablePath: '/mnt/c/Program Files/Google/Chrome/Application/Chrome.exe',
  }
  const browser = await puppeteer.launch(browserSet);
  const page = await browser.newPage();
  try {
    // Initial
    page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36");
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ja-JP'
    });

    const url = 'https://reserve.fumotoppara.net/';
    const response = await page.goto(url, {
        waitUntil: ['load'],
        timeout: 5000
    });

    if (!response) {
        throw new Error(`Cannot access to url ${url}`);
    }

    if (response.status() !== 200) {
        throw new Error(`Failed to access to url ${url} with status = ${response.status()}`);
    }

    console.log('Page loaded')

    // login
    const selector = "button.el-dialog__headerbtn";
    await page.waitForTimeout(1000);
    await page.click(selector);
    // await page.evaluate(() => {
    //   return document.getElementsByClassName('el-dialog__headerbtn')[0].click()
    // });
    console.log('click selector')
    console.log(process.env.EMAIL)
    console.log(process.env.PASSWORD)
    await page.type(".el-form .el-form-item:first-of-type .el-input__inner", process.env.EMAIL);
    await page.type(".el-form .el-form-item:last-of-type .el-input__inner", process.env.PASSWORD);
    await page.waitForTimeout(1000);
    console.log('click login')

    let loadPromise = page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    // await page.evaluate(() => {
    //   return document.getElementsByClassName('el-button--primary')[0].click()
    // });
    await page.click('button.el-button.el-button--primary')
    await loadPromise;
    // screenshot(page);
    console.log('logined')


    // await crawlFmotoppara(page);
    setInterval(async () => {
      console.log("Interval 3sec");
      await crawlFmotoppara(page);
    }, 10000);

    // browser.close();
  } catch (error) {
    // screenshot(page);
    console.log('Error Exception', error);
  }
})();
