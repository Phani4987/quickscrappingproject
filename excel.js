const XLSX = require("xlsx");

// 👉 THIS must be filled by your Playwright scraper dynamically
let scrapedEvents = [];

/*
IMPORTANT:
Your Playwright code should push like this:

scrapedEvents.push({
  title,
  date,
  venue,
  eventId,
  autoStatus,
  autoPeriod,
  quantity,
  section,
  price,
  status
});
*/

// 🟢 Convert ONLY real data → Excel format
const rows = scrapedEvents.map(event => ({
  "Event ID": event.eventId,
  "Title": event.title,
  "Date": event.date,
  "Venue": event.venue,

  "Status": event.status,
  "Auto Status": event.autoStatus,
  "Auto Period": event.autoPeriod,

  "Quantity": event.quantity,
  "Section": event.section,
  "Price": event.price,

  "Scraped At": new Date().toISOString()
}));

// 🟢 Create worksheet
const worksheet = XLSX.utils.json_to_sheet(rows);

// 🟢 Auto column width (safe even if empty)
if (rows.length > 0) {
  worksheet["!cols"] = Object.keys(rows[0]).map(key => ({
    wch: Math.max(
      key.length,
      ...rows.map(r => (r[key] ? r[key].toString().length : 10))
    )
  }));
}

// 🟢 Create workbook
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Events");

// 🟢 Save file
const fileName = `ticketmaster_events_${Date.now()}.xlsx`;
XLSX.writeFile(workbook, fileName);

console.log("📊 Excel created successfully:", fileName);
console.log("📦 Total events:", scrapedEvents.length);