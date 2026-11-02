// Fill <img data-site-img="key"> and <img data-product-img="id"> with the right photo URLs.
export function fillSiteImages(siteImages, getProduct, imageUrl) {
  document.querySelectorAll('[data-site-img]').forEach((img) => {
    const item = siteImages[img.dataset.siteImg];
    if (item) img.src = imageUrl(item, img.closest('.hero') ? 1800 : 1000);
  });
  document.querySelectorAll('[data-product-img]').forEach((img) => {
    const p = getProduct(img.dataset.productImg);
    if (p) img.src = imageUrl(p, 1000);
  });
}
