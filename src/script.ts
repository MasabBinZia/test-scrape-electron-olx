export const insertionScript = `
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getListingData(rootElement) {
    if (!rootElement) {
        return null;
    }
    const priceElement = rootElement.querySelector('span[data-aut-id="itemPrice"]');
    const titleElement = rootElement.querySelector('div[data-aut-id="itemTitle"]');
    const locationElement = rootElement.querySelector('span[data-aut-id="item-location"]');

    const price = priceElement ? priceElement.textContent.trim() : '';
    const title = titleElement ? titleElement.textContent.trim() : '';
    const location = locationElement ? locationElement.textContent.trim() : '';

    return {
        price,
        title,
        location
    };
}

async function getAllListings() {
    let listings = document.querySelectorAll('li[data-aut-id="itemBox"]');
    const listingMap = {};
    
    for(const listing of listings) {
        const data = getListingData(listing);
        if (data && data.title) {
            listingMap[data.title] = data;
        }
    }
    
    return Object.values(listingMap);
}

getAllListings().then(data => {
    console.log('Scraped data:', data);
    window.dispatchEvent(new CustomEvent('scrapeComplete', { detail: { scrapedData: data } }));
});
`;