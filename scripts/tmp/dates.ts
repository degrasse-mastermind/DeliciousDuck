import { sitemapPaths } from "@/lib/sitemap";
import { PAGE_DATES } from "@/data/page-dates";
const missing = sitemapPaths().filter(p=>!PAGE_DATES[p]);
console.log("sitemap paths missing dates:", missing);
console.log("date keys not in sitemap:", Object.keys(PAGE_DATES).filter(k=>!sitemapPaths().includes(k)));
