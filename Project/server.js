
// const axios = require('axios');
// const apiKey = 'AIzaSyACTfPoef2l9yPFil_bCGyUlEZCpplMHNc';

// async function getSchoolPhoneNumbers(area) {
//   // const radius = '20000'; // The search radius in meters (in this case, 5 km)
//   // const type = 'school'; // The type of place to search for
//   const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=schools+in+${encodeURIComponent(area)}&key=${apiKey}`;
//   let response = await axios.get(url);

//   if (response.data.status !== 'OK') {
//     console.error(`Error while searching for schools in ${area}: ${response.data.status}`);
//     return [];
//   }

//   let results = []
//   results = response.data.results
//   let nextPageToken = response.data.next_page_token

//   // while(response.data.next_page_token) {
//   //   nextPageToken = response.data.next_page_token;
//   //   response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`);

//   //   console.log(`https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`);
//   //   console.log(response.data);

//   //   results = [...results, ...response.data.results]
//   // }

//   while (response.data.next_page_token) {
//     nextPageToken = response.data.next_page_token;
//     const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;

//     console.log(url);

//     // Wait for 1 second before making the API request
//     await new Promise(resolve => setTimeout(resolve, 2000));

//     response = await axios.get(url);

//     results = [...results, ...response.data.results]
//   }


//   const phoneNumbers = [];

//   console.log('Results Length: ', results.length);

//   for (let i = 0; i < results.length; i++) {
//     const placeId = results[i].place_id;
//     const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number&key=${apiKey}`;
//     const placeDetailsResponse = await axios.get(placeDetailsUrl);

//     if (placeDetailsResponse.data.status === 'OK') {
//       const phoneNumber = placeDetailsResponse.data.result.formatted_phone_number;
//       phoneNumbers.push(phoneNumber);
//     }
//   }

//   return phoneNumbers;
// }

// getSchoolPhoneNumbers('Raja park jaiur')
//   .then(phoneNumbers => console.log(phoneNumbers))
//   .catch(error => console.error(error));


// // const axios = require('axios');

// // const area = 'raja park jaipur'; // Replace with the area you want to search in
// // const radius = '5000'; // The search radius in meters (in this case, 5 km)
// // const type = 'school'; // The type of place to search for

// // async function getSchoolPhoneNumbersInArea(area) {
// //   let nextPageToken = '';
// //   let phoneNumbers = [];

// //   // Make initial API call to retrieve phone numbers for schools in the given area
// //   let apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=schools+in+${area}&radius=${radius}&type=${type}&key=${apiKey}`;
// //   let response = await axios.get(apiUrl);

// //   // Retrieve phone numbers from initial API call
// //   phoneNumbers = response.data.results.map(result => result.formatted_phone_number);

// //   // Keep paginating through results as long as there are more pages to retrieve
// //   while (response.data.next_page_token) {
// //     nextPageToken = response.data.next_page_token;
// //     apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;
// //     response = await axios.get(apiUrl);
// //     phoneNumbers = phoneNumbers.concat(response.data.results.map(result => result.formatted_phone_number));
// //   }

// //   return phoneNumbers;
// // }

// // getSchoolPhoneNumbersInArea(area)
// //   .then(phoneNumbers => {
// //     console.log(phoneNumbers);
// //   })
// //   .catch(error => {
// //     console.log(error);
// //   });
const XLSX = require('xlsx');

// const _jpNeighborhoods = process.argv[2].split(",")
const _jpNeighborhoods = ['names', 'names']

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());
const requestParams = {
  baseURL: `http://google.com`,
  query: "schools in raja park jaipur",                                          // what we want to search
  coordinates: "@47.6040174,-122.1854488,11z",                 // parameter defines GPS coordinates of location where you want your query to be applied
  hl: "en",                                                    // parameter defines the language to use for the Google maps search
};
async function scrollPage(page, scrollContainer) {
  let lastHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
  while (true) {
    await page.evaluate(`document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`);
    await page.waitForTimeout(2000);
    let newHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
    if (newHeight === lastHeight) {
      break;
    }
    lastHeight = newHeight;
  }
}
async function fillDataFromPage(page) {
  const dataFromPage = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".bfdHYd")).map((el) => {
      const placeUrl = el.parentElement.querySelector(".hfpxzc")?.getAttribute("href");
      const urlPattern = /!1s(?<id>[^!]+).+!3d(?<latitude>[^!]+)!4d(?<longitude>[^!]+)/gm;                     // https://regex101.com/r/KFE09c/1
      const dataId = [...placeUrl.matchAll(urlPattern)].map(({ groups }) => groups.id)[0];
      const latitude = [...placeUrl.matchAll(urlPattern)].map(({ groups }) => groups.latitude)[0];
      const longitude = [...placeUrl.matchAll(urlPattern)].map(({ groups }) => groups.longitude)[0];
      return {
        title: el.querySelector(".qBF1Pd")?.textContent.trim(),
        rating: el.querySelector(".MW4etd")?.textContent.trim(),
        reviews: el.querySelector(".UY7F9")?.textContent.replace("(", "").replace(")", "").trim(),
        type: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:first-child")?.textContent.replaceAll("·", "").trim(),
        address: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(1) > span:last-child")?.textContent.replaceAll("·", "").trim(),
        openState: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:first-child")?.textContent.replaceAll("·", "").trim(),
        phone: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(3) > span:last-child")?.textContent.replaceAll("·", "").trim(),
        website: el.querySelector("a[data-value]")?.getAttribute("href"),
        description: el.querySelector(".W4Efsd:last-child > .W4Efsd:nth-of-type(2)")?.textContent.replace("·", "").trim(),
        serviceOptions: el.querySelector(".qty3Ue")?.textContent.replaceAll("·", "").replaceAll("  ", " ").trim(),
        gpsCoordinates: {
          latitude,
          longitude,
        },
        placeUrl,
        dataId,
      };
    });
  });
  return dataFromPage;
}
async function getLocalPlacesInfo(query, page) {

  const URL = `${requestParams.baseURL}/maps/search/${query}`;
  await page.setDefaultNavigationTimeout(60000);
  await page.goto(URL);
  await page.waitForNavigation();
  const scrollContainer = ".m6QErb[aria-label]";
  const localPlacesInfo = [];
  // while (true) {
  await page.waitForTimeout(2000);
  // const nextPageBtn = await page.$("#eY4Fjd:not([disabled])");
  // if (!nextPageBtn) break;
  await scrollPage(page, scrollContainer);
  localPlacesInfo.push(...(await fillDataFromPage(page)));
  // await page.click("#eY4Fjd");
  // }
  return localPlacesInfo;
}

const forEveryPlace = async () => {

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();


  let results = []
  for (const iterator of _jpNeighborhoods) {
    const _nresults = await getLocalPlacesInfo(`schools in ${iterator} ${process.argv[3]}`, page)
    results = [...results, ..._nresults]
  }

  await browser.close();

  // console.log(results);

  const newresults = results.map(cell => {
    const _parsedJSON = cell

    if (_parsedJSON.description) {
      const data = _parsedJSON.description;
      const regex = /(\d{5} ?\d{5}|\d{6} ?\d{4}|\d{7} ?\d{5}|\d{8} ?\d{4}|\d{9} ?\d{3}|\d{10} ?\d{2}|\d{3} ?\d{3} ?\d{4})/g;
      const phoneNumbers = data.match(regex);
      return {
        ..._parsedJSON,
        phone: phoneNumbers == null ? "N/A" : phoneNumbers[0].replace(/\s/g, "")
      }
    } else {
      return {
        ..._parsedJSON,
        phone: "N/A"
      }
    }
  });


  // get the keys of all JSON objects
  const allKeys = newresults.reduce((keys, obj) => {
    Object.keys(obj).forEach(key => {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    });
    return keys;
  }, []);

  // create a new workbook with columns matching the object keys
  const newWorkbook = XLSX.utils.book_new();
  const newWorksheet = XLSX.utils.json_to_sheet(newresults, { header: allKeys });
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet');
  XLSX.writeFile(newWorkbook, `${process.argv[4]}.xlsx`);
}

forEveryPlace()