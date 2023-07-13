import { Browser, Page } from "puppeteer";

async function goToClock(page: Page) {
  // Determine which page we are on
  console.log("Waiting for dropdown selector");
  await page.waitForSelector("span.ps-button-wrapper");
  const dropdownTitle = await page.$(
    'span.ps-button-wrapper[title="Employee Self Service"]'
  );
  if (!dropdownTitle) {
    await page.locator('a[title="Homepage Selector"]').click();

    try {
      await page.locator("text/Employee Self Service").click();
    } catch (error) {
      console.error("Failed to click Employee Self Service");
    }
  } else {
    console.log("Already on employee page");
  }

  // Is this consistent?
  await page.evaluate(
    "LaunchTileURL('SMU_NAVCOLL_2','Time Reporting',this,'https://my.smu.edu/psp/ps_newwin/EMPLOYEE/HRMS/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=SMU_TIME_REPORTING&PanelCollapsible=Y&PTPPB_GROUPLET_ID=TIMEREPORTING&CRefName=SMU_NAVCOLL_2',0,'bGrouplet@1;','')"
  );

  await page.waitForNavigation();

  return page;
}

export async function signIn(browser: Browser): Promise<Page> {
  const page = await browser.newPage();

  console.log("Going to main page");
  await page.goto(
    "https://my.smu.edu/psc/ps/EMPLOYEE/SA/c/NUI_FRAMEWORK.PT_LANDINGPAGE.GBL"
  );

  if ((await page.title()) === "Homepage") {
    // user is already logged in
    console.log("Logged into my.SMU");
    return page;
  }

  // TODO: Add t3 env typing
  if (!process.env.USERNAME || !process.env.PASSWORD) {
    throw new Error("Missing username and password");
  }

  await page.locator("#username").fill(process.env.USERNAME);
  await page.locator("#password").fill(process.env.PASSWORD);

  await page.locator('button[type="submit"]').click();

  ///.... User is prompted for a duo push
  page.setDefaultTimeout(10000);
  const trustButton = await page.waitForSelector("text/Yes").catch((_e) => {
    throw new Error("Could not get duo push");
  });
  await trustButton?.click();

  console.log("CLICKED");

  return page;
}

export const getInfo = async (browser: Browser): Promise<string | null> => {
  try {
    const page = await signIn(browser);
    await goToClock(page);
    const statusTextE = await page.waitForSelector(
      "#TL_WEB_CLOCK_WK_DESCR50_1"
    );

    if (!statusTextE) {
      throw new Error("Failed to find status text");
    }
    const statusText = await statusTextE?.evaluate((el) => el.textContent);
    await page.close();
    return statusText;
  } catch (error) {
    console.error(error);
    throw new Error("Could not sign in");
  }
};

export const clockIn = async (browser: Browser): Promise<string> => {
  const page = await signIn(browser);
  await goToClock(page);

  console.log("Looking for select box");
  await page.waitForSelector("select.ps-dropdown");
  await page.select("select.ps-dropdown", "1");

  await page.locator("a#TL_WEB_CLOCK_WK_TL_SAVE_PB").click();

  const statusTextE = await page.waitForSelector("#TL_WEB_CLOCK_WK_DESCR50_1");

  if (!statusTextE) {
    throw new Error("Failed to find status text");
  }
  const statusText = await statusTextE?.evaluate((el) => el.textContent);
  await page.close();
  return statusText || "NO INFO";
};

export const clockOut = async (browser: Browser): Promise<string> => {
  const page = await signIn(browser);
  await goToClock(page);

  console.log("Looking for select box");

  await page.waitForSelector("select.ps-dropdown");
  await page.select("select.ps-dropdown", "2");

  await page.locator("a#TL_WEB_CLOCK_WK_TL_SAVE_PB").click();

  const statusTextE = await page.waitForSelector("#TL_WEB_CLOCK_WK_DESCR50_1");

  if (!statusTextE) {
    throw new Error("Failed to find status text");
  }
  const statusText = await statusTextE?.evaluate((el) => el.textContent);
  await page.close();
  return statusText || "NO INFO";
};
