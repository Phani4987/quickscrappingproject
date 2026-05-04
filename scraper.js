const puppeteer = require("puppeteer");
const XLSX = require("xlsx");

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function scrape() {
  const eventId = "3E006497D7DC5322";
  const url = `https://www.ticketmaster.co.uk/skye-newman-london-16-11-2026/event/${eventId}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    console.log("Opening page...");

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await delay(5000);

    await page.waitForSelector("body");

    const result = await page.evaluate(() => {

      const text = (selectors) => {
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.innerText) return el.innerText.trim();
        }
        return "";
      };

      return {
        title: document.querySelector("h1")?.innerText?.trim() || "",

        date: text([
          "[data-testid*='date']",
          "time"
        ]),

        venue: text([
          "[data-testid*='venue']",
          "a[href*='venue']"
        ]),

        section: "",
        price: ""
      };
    });

    const finalResult = {
      title: result.title,
      date: result.date,
      venue: result.venue,
      eventId,
      autoStatus: result.title ? "AVAILABLE" : "UNKNOWN",
      autoPeriod: result.date || ""
    };

    console.log("FINAL RESULT:");
    console.log(finalResult);

    await browser.close();

    
    const rows = [finalResult].map(event => ({
      "Event Title": event.title || "",
      "Event Date": event.date || "",
      "Venue": event.venue || "",
      "Event ID": event.eventId || "",
      "Auto Status": event.autoStatus || "",
      "Auto Period": event.autoPeriod || "",
      "Scraped At": new Date().toISOString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = Object.keys(rows[0]).map(key => ({
      wch: Math.max(
        key.length,
        ...rows.map(r => (r[key] ? r[key].toString().length : 10))
      )
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Events");

    const fileName = `ticketmaster_event_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    console.log("Excel saved:", fileName);

    return finalResult;

  } catch (err) {
    console.log("Scraper failed:", err.message);
    await browser.close();
  }
}

scrape();