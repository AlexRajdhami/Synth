import './layout.js';
import { SITE_IMAGES, getProduct, imageUrl } from './products.js';
import { fillSiteImages } from './images.js';

fillSiteImages(SITE_IMAGES, getProduct, imageUrl);
