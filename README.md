# Momentum Sales Progression website

Live site: https://www.momentumsp.co.uk (hosted on GitHub Pages).

* Each page is a single `.html` file in this folder. Page addresses are clean and descriptive (`contact`, `discovery-meeting`). The old Wix addresses `contact-4` and `about-5` are kept as small redirect pages so old links and Google results still work.
* Photos live in `images/`.
* Google Analytics, Google Ads, the form email address and the WhatsApp number are set in one place: the SETTINGS block at the top of `assets/site.js`.
* Forms are delivered by Formspree (formspree.io) to info@momentumsp.co.uk, using the Formspree form ID in `assets/site.js`.
* Any change saved to the `main` branch goes live automatically within a minute or two.

## Search engines

* `sitemap.xml` lists the current pages only, at their canonical addresses, and `robots.txt` points to it. Update a page's `lastmod` date when its content changes. Never add old Wix addresses, `thank-you` or `404`.
* **Verification files.** Google Search Console and Bing Webmaster Tools each give a small file to prove ownership. Save it, unchanged and with its exact file name, in the top folder of this repository (next to `index.html` and `CNAME`), commit it to `main`, and click Verify once the site has updated (a minute or two). For example:
  * Google: `google1234567890abcdef.html`, which must then open at `https://www.momentumsp.co.uk/google1234567890abcdef.html`
  * Bing: `BingSiteAuth.xml`, which must then open at `https://www.momentumsp.co.uk/BingSiteAuth.xml`
* Leave the verification files in place permanently: deleting one un-verifies the property.
