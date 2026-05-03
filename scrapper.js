const { chromium } = require('playwright');
const XLSX = require('xlsx');

(async () => {
  const browser = await chromium.launch({headless:false});
  const page = await browser.newPage();

  await page.goto('https://books.toscrape.com/');

  const data = await page.$$eval('.product_pod', items =>
    items.map(item => ({
      name: item.querySelector('h3 a').getAttribute('title'),
      price: item.querySelector('.price_color').innerText,
      rating: item.querySelector('.star-rating').className
    }))
  );
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  XLSX.writeFile(workbook, 'products.xlsx');

  console.log("Excel file created!");

  await browser.close();
})();