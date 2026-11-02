import { productCard, bindWishButtons } from './layout.js';
import { PRODUCTS, SITE_IMAGES, getProduct, imageUrl } from './products.js';
import { fillSiteImages } from './images.js';

fillSiteImages(SITE_IMAGES, getProduct, imageUrl);

const grid = document.querySelector('[data-featured]');
grid.innerHTML = PRODUCTS.filter((p) => p.featured).slice(0, 4).map(productCard).join('');
bindWishButtons(grid);
