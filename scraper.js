const XLSX = require("xlsx");


const scrapedEvents = [
    {
        title: "Tickets: Skye Newman, London | Mon, 16 Nov 2026, 19:00 | Ticketmaster UK",
        date: "16-11-2026",
        venue: "O2 Academy Brixton",
        eventId: "3E006497D7DC5322",
        autoStatus: "AVAILABLE",
        autoPeriod: "16-11-2026"
    },

   
];


const rows = scrapedEvents.map(event => ({
    "Event Title": event.title || "-",
    "Event Date": event.date || "-",
    "Venue": event.venue || "-",
    "Event ID": event.eventId || "-",
    "Auto Status": event.autoStatus || "-",
    "Auto Period": event.autoPeriod || "-",
    "Scraped At": new Date().toISOString()   
}));


const worksheet = XLSX.utils.json_to_sheet(rows);


worksheet["!cols"] = Object.keys(rows[0]).map(key => ({
    wch: Math.max(
        key.length,
        ...rows.map(row => (row[key] ? row[key].toString().length : 10))
    )
}));


const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Events");


const fileName = `ticketmaster_events_${Date.now()}.xlsx`;
XLSX.writeFile(workbook, fileName);

console.log("📊 Excel generated successfully:", fileName);