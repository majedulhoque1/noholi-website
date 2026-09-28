# Noholi catalogue import report

Generated 2026-09-28T20:54:48.513Z by `import-books.mjs --load` from `source/all-book-list.xlsx` (sheet `BookList`). Rules: `mappings.json`.

## Totals

| | Count |
|---|---:|
| Rows (books) | **3016** (expected 3016) |
| Copies as written in the sheet | **8086** (expected 8086) |
| Copies imported (blank copies cell → 1) | **8087** |
| Missing price (null after import) | 1186 (blank 1104, '-' 27, foreign currency 55, unparsed 0) |
| Missing cover URL | 712 (blank 448, '-' 264) |
| Low-res thumbnail URL (gstatic tbn / bing) | 755 |
| Inline data: URI covers | 2 |
| Invalid cover URL | 0 |
| Cover downloads OK | 2056 of 2304 |
| Cover download failures | 248 |
| Books with a stored cover (thumbnail set) | 2046 |
| Duplicate (Bangla title + Bangla author) pairs | 156 pairs, 366 rows |

> The sheet sums to 8086 copies. 1 row(s) had a blank copies cell and were imported as 1 extra cop(ies), so the database total is **8087**. `--load` verifies against 8087.

## Covers

WebP, 400px wide, quality 75. Sizes: min 2.7 KB, median 17.9 KB, p95 41.4 KB, max 80.2 KB, total 40.9 MB.

278 stored covers came from a source narrower than 150px (upscaled, will look soft): BK-0148, BK-0150, BK-0157, BK-0325, BK-0458, BK-0478, BK-0515, BK-0533, BK-0544, BK-0602, BK-0606, BK-0746, BK-0864, BK-0938, BK-0983, BK-1033, BK-1061, BK-1115, BK-1133, BK-1177, BK-1213, BK-1297, BK-1325, BK-1334, BK-1347, BK-1440, BK-1465, BK-1526, BK-1588, BK-1744, BK-1754, BK-1789, BK-1800, BK-1801, BK-1842, BK-2043, BK-2045, BK-2125, BK-2140, BK-2213 … (+238)

Of the 755 low-res thumbnail URLs, 611 downloaded; they are stored but should be replaced with better scans over time.

### Cover download failures

| Error | Count |
|---|---:|
| HTTP 404 | 169 |
| HTTP 403 | 28 |
| fetch failed | 17 |
| HTTP 429 | 12 |
| HTTP 400 | 8 |
| HTTP 530 | 7 |
| Input buffer contains unsupported image format | 2 |
| HTTP 500 | 2 |
| Input buffer has corrupt header: glib: XML parse error: Error domain 1 code 73 on line 1 column 51 of data: Couldn't find end of Start Tag html line 1 | 1 |
| Input buffer has corrupt header: glib: XML parse error: Error domain 1 code 76 on line 37 column 196505 of data: Opening and ending tag mismatch: html line 1 and div | 1 |
| HTTP 401 | 1 |

| Book | Title | Source URL | Error |
|---|---|---|---|
| BK-0001 | Himur Neel Josna | https://shopnobilap.com/wp-content/uploads/2023/01/1464925799-1.jpg | HTTP 429 |
| BK-0005 | Shedin Choitromash | https://th.bing.com/th/id/OIP._EMkEedI4CAjv82cFcRirgAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0010 | Ballpoint | https://th.bing.com/th/id/OIP.LUEAncxFaV9YUM3O7Qw6SQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0025 | Pencile Aka Pori | https://th.bing.com/th/id/OIP.YuznVRO__V7ifHNX-F0Y2QAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0026 | Dorojar Opashe | https://th.bing.com/th/id/OIP.Z9fScgwqE_rmL5F3CJinvQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0027 | Himu | https://th.bing.com/th/id/OIP.hNHytnDf6-r92akpM_9JgAHaLQ?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0030 | Jolpodmo | https://th.bing.com/th/id/OIP.ptWd7-EcO48Ra8xP7Zl7oQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0032 | Shajghor | https://th.bing.com/th/id/OIP.rVm3MqQjdhCYjcWryZjnWwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0040 | May Flower | https://shopnobilap.com/wp-content/uploads/2023/01/1569213868-1.jpg | HTTP 429 |
| BK-0079 | Kalo Jadukor | https://th.bing.com/th/id/OIP.00KVtrwaI5ooYaT15gDWNQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0081 | 1971 | https://th.bing.com/th/id/OIP.MXn-62FsCR6hwUvOn8wmjQHaKe?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0084 | Sokol Kanta Dhonno Kore | https://th.bing.com/th/id/OIP.Fsfna0dLJiWp9_HgaB_MFwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0099 | Sokol Kanta Dhonno Kore | https://th.bing.com/th/id/OIP.Fsfna0dLJiWp9_HgaB_MFwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0102 | Kalo Jadukor | https://th.bing.com/th/id/OIP.00KVtrwaI5ooYaT15gDWNQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0113 | Jolpodmo | https://th.bing.com/th/id/OIP.ptWd7-EcO48Ra8xP7Zl7oQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0115 | May Flower | https://shopnobilap.com/wp-content/uploads/2023/01/1569213868-1.jpg | HTTP 429 |
| BK-0128 | Meyetir Naam Narina | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx38YQWVUIRewZ_5E_zl7qJLj05YxdQET29g&s | HTTP 404 |
| BK-0131 | T-Rexer Shondhane | https://image.prothoma.com/productLongThumbs/2022/02/6208b4ebd7799_1644737771.jpg | HTTP 530 |
| BK-0137 | Shukno Phool Rongin Phool | https://th.bing.com/th/id/OIP.weUrzzQ5oBGaDZU42gf7LwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0138 | Kach Somudro | https://booksofbengal.in/wp-content/uploads/2023/07/5b98449503295d20e0a695e0a6bee0a69a20e0a6b8e0a6aee0a781e0a6a6e0a78de0 | HTTP 404 |
| BK-0142 | Canvas er Golpo | https://ourcanvass.com/wp-content/uploads/2018/10/canvas-er-golpo-1.png | HTTP 404 |
| BK-0165 | May Flower | https://shopnobilap.com/wp-content/uploads/2023/01/1569213868-1.jpg | HTTP 429 |
| BK-0166 | Mirar Gramer Bari | https://th.bing.com/th/id/OIP.k_ZqQigM3xJLXwuEx24anwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0171 | Megher Chaya | https://shopnobilap.com/wp-content/uploads/2023/01/1464925870-1.jpg | HTTP 429 |
| BK-0177 | Nishad | https://shopnobilap.com/wp-content/uploads/2023/01/1464926026-1.jpg | HTTP 429 |
| BK-0178 | Nolini Babu B. Sc | https://th.bing.com/th/id/OIP.r5BRnNliX32xx4Dglki4UwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0202 | Bashor | https://th.bing.com/th/id/OIP.vVj6e82G_re9MMAH3xt3uwHaFq?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0207 | Pencile Aka Pori | https://th.bing.com/th/id/OIP.YuznVRO__V7ifHNX-F0Y2QAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0208 | Shedin Choitromash | https://th.bing.com/th/id/OIP._EMkEedI4CAjv82cFcRirgAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0212 | Jolpodmo | https://th.bing.com/th/id/OIP.ptWd7-EcO48Ra8xP7Zl7oQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0213 | Amader Shada Bari | https://th.bing.com/th/id/OIP.ptWd7-EcO48Ra8xP7Zl7oQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0216 | Ballpoint | https://th.bing.com/th/id/OIP.LUEAncxFaV9YUM3O7Qw6SQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0232 | Priyotomeshu | https://th.bing.com/th/id/OIP.snWNiFg-sPyWPoOxO8w_CAHaIe?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0234 | Ami ebong koyekti projapoti | https://www.anuperona.com/wp-content/uploads/2023/04/ami-ebong-koyekti-projapoti-humayun-ahmed.jpg | HTTP 404 |
| BK-0235 | Uralponkhi | https://shopnobilap.com/wp-content/uploads/2023/01/1509589883-1.jpg | HTTP 429 |
| BK-0240 | Dorojar Opashe | https://th.bing.com/th/id/OIP.Z9fScgwqE_rmL5F3CJinvQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0245 | Protham Prohar | https://th.bing.com/th/id/OIP.wulVEHTze5xjc7thf3PTfQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0250 | Chayasongi | https://th.bing.com/th/id/OIP.WOU2NV3am0jEnUEx7DNQwwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0258 | Gouripur Jongshon | https://ofuronto.com/product/gouripur-junction-344987/344987.jpg | HTTP 404 |
| BK-0264 | Himur Neel Josna | https://shopnobilap.com/wp-content/uploads/2023/01/1464925799-1.jpg | HTTP 429 |
| BK-0272 | Kalo Jadukor | https://th.bing.com/th/id/OIP.00KVtrwaI5ooYaT15gDWNQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0276 | Elebele - 2nd Porbo | https://www.boipokabd.com/storage/app/public/product/meta/2024-02-02-65bc6ebaa010f.webp | HTTP 404 |
| BK-0278 | Ekattor Ebong Amar Baba | https://th.bing.com/th/id/OIP.xkIZxAwPoqcfQCLQIl6TFgHaHZ?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0282 | Eki Kando! | https://th.bing.com/th/id/OIP.JzQ1XMbP4fdCQGPvAD0TQgAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0285 | Udbhot Golpo | https://image.prothoma.com/productImages/2021/02/60223dfd7d5c3_1612856829.jpg | HTTP 530 |
| BK-0297 | Aynaghor | https://th.bing.com/th/id/OIP.szusL4QF2xQu1Gcaqqwk-AAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0300 | Amar Chelebela | https://tiltony.com/wp-content/uploads/2021/05/%E0%A6%86%E0%A6%AE%E0%A6%BE%E0%A6%B0-%E0%A6%9B%E0%A7%87%E0%A6%B2%E0%A7%87 | HTTP 404 |
| BK-0315 | Himu | https://th.bing.com/th/id/OIP.hNHytnDf6-r92akpM_9JgAHaLQ?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0318 | Humayun Ahmeder Shrestho Golpo | https://th.bing.com/th/id/OIP.VR21R3Y9Y4ZCVq8LpDBuMgHaK7?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0320 | Shonkhonil Karagar | https://th.bing.com/th/id/OIP.xIPzg6E7WMb9DRBt6qjYhwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0323 | Sokol Kanta Dhonno Kore | https://th.bing.com/th/id/OIP.Fsfna0dLJiWp9_HgaB_MFwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0324 | Shajghor | https://th.bing.com/th/id/OIP.rVm3MqQjdhCYjcWryZjnWwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0326 | Sheet O Onnanno Golpo | https://th.bing.com/th/id/OIP.LE8azux8CDHiRTTZUBo3qQHaKe?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0336 | Raboner Deshe Ami Ebong Amra | https://th.bing.com/th/id/OIP.vKIsVOBD2oKpuVvmZc8f0AAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0337 | Rumali | https://th.bing.com/th/id/OIP.eeySxLnJciec5-uewTfgJgAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0347 | Aporahno | https://image.prothoma.com/productThumbs/2021/02/60223e4c78127_1612856908.jpg | HTTP 530 |
| BK-0349 | Achinpur | https://th.bing.com/th/id/OIP.y08cugs0XmA4j2jWeaZmWgHaKg?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0355 | 1971 | https://th.bing.com/th/id/OIP.MXn-62FsCR6hwUvOn8wmjQHaKe?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0356 | Phera | https://th.bing.com/th/id/OIP.9nRhvWZz1drKWNqRv7XyTwHaKe?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0357 | Shukno Phool Rongin Phool | https://th.bing.com/th/id/OIP.weUrzzQ5oBGaDZU42gf7LwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0361 | Kolamshomogro | https://booksofbengal.in/wp-content/uploads/2023/06/5b97898443283655d20e0a695e0a6b2e0a6bee0a6aee0a6b8e0a6aee0a697e0a78de | HTTP 404 |
| BK-0365 | Chelemanushi | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGBpj9xI7ZaPIfoamWazLSURJbttDPKezHlg&s | HTTP 404 |
| BK-0376 | Ek Tukro Lal Shobuj Kapor | https://secure.pathokseba.com/image_directory/product_image/2022/03/8958cc1314-2022-03-10.webp | fetch failed |
| BK-0393 | T-Rexer Shondhane | https://image.prothoma.com/productLongThumbs/2022/02/6208b4ebd7799_1644737771.jpg | HTTP 530 |
| BK-0394 | Meyetir Naam Narina | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx38YQWVUIRewZ_5E_zl7qJLj05YxdQET29g&s | HTTP 404 |
| BK-0408 | Dhaka Namer Shohor O Onnanno | https://booksofbengal.in/wp-content/uploads/2023/07/5b97898489338525d20e0a6a2e0a6bee0a695e0a6be20e0a6a8e0a6bee0a6aee0a78 | HTTP 404 |
| BK-0409 | Triton | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScMVxToUl0nf_UrgpZNWldNK6ffxCGZj55Hw&s | HTTP 404 |
| BK-0418 | Project Nebula | https://image.prothoma.com/productLongThumbs/2022/02/6208bedddbdbb_1644740317.jpg | HTTP 530 |
| BK-0421 | Neurone Onuronon | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2Bsg_o5Nzzvks2q5FZzKDzyQiDrd-R6rWEw&s | HTTP 404 |
| BK-0440 | Phoenix | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc3SEx5gleIhnFenVrdUt9NXmPKOpKCuY69A&s | HTTP 404 |
| BK-0448 | Mohabbat Alir Ekdin | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1z_89BGLPDZ0XZT8LOpBa0wWAO1RBtQ1Qbg&s | HTTP 404 |
| BK-0469 | Rochona Shomogro - 1 | https://mamun-books.sgp1.cdn.digitaloceanspaces.com/public/frontend/thumbnail/679736732f5b5.jpg | fetch failed |
| BK-0506 | Shreshtho Bharotiyo Adhunik Gaaner Swarolipi | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQgOTsfoO-BJv0jysCB_Yu436s-MiLQseueg&s | HTTP 404 |
| BK-0512 | Jongibad: Bangladesh Keno Target | https://www.pathagar.com/contents/records/bookmaster/201709/1867_1.jpg | HTTP 403 |
| BK-0518 | Markin Muluke | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSPeB559nPTo_8aqr38-YrCxCtsyogUmoisg&s | HTTP 404 |
| BK-0529 | Shoiracharer Dalal Bolchi | https://image.prothoma.com/productLongThumbs/2021/02/602254a3b4fcd_1612862627.jpg | HTTP 530 |
| BK-0541 | Muktijuddho Hridoye Momo | https://pathokpoint.com/_next/image?url=https%3A%2F%2Fpathokpoint.s3.ap-southeast-1.amazonaws.com%2Fbook%2F202-3213.jpg& | HTTP 400 |
| BK-0554 | Bangladesh-er Birgatha | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9ONmYQ3KXgUbTTeJLw5FlLsDj3SbzhWCRFA&s | HTTP 404 |
| BK-0565 | Anatolia Hote Andalusia | https://mamun-books.sgp1.cdn.digitaloceanspaces.com/public/frontend/thumbnail/677b87d44e231.jpg | fetch failed |
| BK-0573 | I Am Malala | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwBi0czDDzMMpiPd2GLmdb108tveVze6UnSw&s | HTTP 404 |
| BK-0585 | Priyo Pathok, Ektu Hashun | https://mamun-books.sgp1.cdn.digitaloceanspaces.com/public/frontend/thumbnail/6790f74449dd7.jpg | fetch failed |
| BK-0587 | Ondho Smritir Goli | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiiEM7LXt9AkKsCCl6mBis9ugw-JUFKaLaqg&s | HTTP 404 |
| BK-0599 | Swadhinota 5th Khondo | https://mamun-books.sgp1.cdn.digitaloceanspaces.com/public/frontend/thumbnail/6763c17a7d9b1.jpg | fetch failed |
| BK-0638 | Nil-Dorpon | https://image.prothoma.com/productLongThumbs/2021/02/60223eba8796d_1612857018.jpg | HTTP 530 |
| BK-0662 | Subarnalata | https://scientiabooks.in/wp-content/uploads/2021/09/7147A-BAKUL-KATHA-ASHAPURNA-DEVI.jpg | HTTP 403 |
| BK-0673 | Shreshtho Feluda | https://i0.wp.com/www.bdcoast.com/wp-content/uploads/2019/05/sfd_bdc1.jpg?fit=775%2C1200&ssl=1 | HTTP 400 |
| BK-0689 | Sagortole Shat Hajaar Mile | https://mamunbooks.com/public/frontend/thumbnail/66b216489071c.jpg | HTTP 404 |
| BK-0716 | Kishor Anondo 12 | https://mamun-books.sgp1.cdn.digitaloceanspaces.com/public/frontend/thumbnail/6745e2ba5288a.jpg | fetch failed |
| BK-0726 | Rifater Od-Bhoot Bondhu | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNeMNmonyNQC6A42DKQeY6FhfEDs5bieRaXw&s | HTTP 404 |
| BK-0793 | READING FOR PLEASURE- 13 | https://mamun-books.sgp1.cdn.digitaloceanspaces.com/public/frontend/thumbnail/675081407a845.jpg | fetch failed |
| BK-0820 | Biraj Bou | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHU58cNP9a5dJuhPi0lXPZs9GRHGeMpcIjtA&s | HTTP 404 |
| BK-0829 | Sera Doshti Uponyas | https://matribhasa.com/wp-content/uploads/2024/11/httpsboichitro.inwp-contentuploads202406download-54.jpg | HTTP 404 |
| BK-0833 | Canvas er Golpo | https://ourcanvass.com/wp-content/uploads/2018/10/canvas-er-golpo-1.png | HTTP 404 |
| BK-0838 | Chhappanno Hazar Borgomail | https://upload.wikimedia.org/wikipedia/bn/thumb/4/4e/%E0%A6%9B%E0%A6%BE%E0%A6%AA%E0%A7%8D%E0%A6%AA%E0%A6%BE%E0%A6%A8%E0% | HTTP 400 |
| BK-0873 | Ispat | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4oOvqKOvcoOqpnfb0wd43hxlt97_RfHZKnQ&s | HTTP 404 |
| BK-0902 | Robin Hood | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaDp59Al2SzfGkC9g-ODcDunp5m6b3c6418w&s | HTTP 404 |
| BK-0916 | Kach Shomudro | https://booksofbengal.in/wp-content/uploads/2023/07/5b98449503295d20e0a695e0a6bee0a69a20e0a6b8e0a6aee0a781e0a6a6e0a78de0 | HTTP 404 |
| BK-0984 | Miss Silver Intervenes | https://th.bing.com/th/id/OIP.rzT-4EFPurp1LJhPezoBjQHaLP?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-0986 | Stupid Whiteman | https://th.bing.com/th/id/R.dab1b478ce342fb4c1da36572354a227?rik=HrsbeZeKXRuFcw&pid=ImgRaw&r=0 | HTTP 404 |
| BK-0987 | Coming Home | https://th.bing.com/th/id/R.cb81026de26b7d296b6293a4b536881f?rik=iJhdzZF7L37zMA&pid=ImgRaw&r=0 | HTTP 404 |
| BK-0989 | Snow Leopard The | https://th.bing.com/th/id/R.ddf5ed8ecb7b56448e2b7dd43a68e9f2?rik=cW6TdFjEA29mfQ&pid=ImgRaw&r=0 | HTTP 404 |
| BK-0996 | the silver sty | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQybOOUZ3sax3hspevnlcQDfjvY_nkb1kREJg&s | HTTP 404 |
| BK-1001 | Three Little Secrets | https://th.bing.com/th/id/OIP.PKcc6t95YXmdJtdzjJe8MAHaML?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1002 | A CEMETRY IN MUNICH | https://www.ebay.co.uk/p/86364257 | Input buffer has corrupt header: glib: XML parse error: Error domain 1 code 73 on line 1 column 51 of data: Couldn't find end of Start Tag html line 1 |
| BK-1006 | A FEAST FOR CROWS | https://awoiaf.westeros.org/images/thumb/a/a3/AFeastForCrows.jpg/440px-AFeastForCrows.jpg | HTTP 403 |
| BK-1007 | GIVING up the GHOST | https://th.bing.com/th/id/OIP.sGzyRx5xlLU9CFNSGmE8vgAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1011 | CHAT | https://th.bing.com/th/id/OIF.cPf0Ad0Uvg8ICKHUb8T8Eg?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1015 | MOTE IN GOD'S EYE THE | https://th.bing.com/th/id/R.5167663bf8fb5533e6df4ce77957a8c2?rik=F0qKpva3ZJIJ4w&pid=ImgRaw&r=0 | HTTP 404 |
| BK-1023 | WATERWORKS THE | https://th.bing.com/th/id/OIP.94LznTa3kaqcYe5gVFx8twHaLS?w=1664&h=2536&rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1024 | PIG ISLAND | https://th.bing.com/th/id/OIP.Nl86DW3czvmNYFU9JfjsEwHaLg?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1027 | TESS OF THE D'URBERVILLES | https://th.bing.com/th/id/OIP.ERVPb9tuC3YEpEokX0yhlAHaJ3?w=203&h=271&c=7&r=0&o=5&pid=1.7 | HTTP 404 |
| BK-1030 | GOLDEN LILY THE | https://th.bing.com/th/id/OIP.Orir42HyUqwRUFUeZy6R_gHaLH?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1032 | LISA & CO. | https://th.bing.com/th/id/OIP.If4gj4J1ZomyqcevPzkbXwHaMI?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1036 | AENID THE | https://th.bing.com/th/id/R.074657317f30aec37ba29d38b7521108?rik=kL6yXwIvaKjGng&riu=http%3a%2f%2fwww.sffaudio.com%2fimag | HTTP 404 |
| BK-1037 | LONG TIME GONE | https://www.fictiondb.com/covers/0380724359.jpg | HTTP 404 |
| BK-1038 | FAUN & GAMES | https://th.bing.com/th/id/OIP.jI1wDCl_kSQvRiqBepmKhgAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1044 | LIFE YOU'VE ALWAYS WANTED THE | https://th.bing.com/th/id/OIP.3bNNMPYTne3cGlQqkbrlyQAAAA?w=196&h=300&rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1045 | COMMAND | https://th.bing.com/th/id/OIP.I1UrinWsFENDyL6neVpPlAAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1050 | PRESUMED INNOCENT | https://th.bing.com/th/id/R.38be182c0a738293751ae59fa380c9a4?rik=NpWGyMUrGk%2b0%2bA&pid=ImgRaw&r=0 | HTTP 404 |
| BK-1051 | DON TRACY THE BIG X | https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.thriftbooks.com%2Fa%2Fdon-tracy%2F772439%2F&psig=AOvVaw2i57dDz0Wsx | Input buffer contains unsupported image format |
| BK-1055 | Circle of Magic | https://th.bing.com/th/id/OIP.wtsJG_NH6CxGavSs4N8hzQHaMG?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1056 | INNOCENTS CLUB THE | https://th.bing.com/th/id/OIP.eonMjX0Sd_taCSWwl1pnoAAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1057 | SLEEPING MURDER | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRH4ofAuLZpmKN31Rc-IOg22OXU4ogbLvOKZQ&s | HTTP 404 |
| BK-1058 | THREE TO GET DEADLY | https://th.bing.com/th/id/OIP.wNPxww1Xp82ayE13fYFmoQHaLH?w=183&h=275&c=7&r=0&o=5&pid=1.7 | HTTP 404 |
| BK-1060 | LEAN MEAN THIRTEEN | https://th.bing.com/th/id/R.216d4087f3eeb4a297a36c94f104a21e?rik=0bf7OVkU5o3aMA&riu=http%3a%2f%2fprodimage.images-bn.com | HTTP 404 |
| BK-1083 | MONSTER | https://www.kennys.ie/products/full/9780316853583.jpg | HTTP 403 |
| BK-1098 | OYSTER BLUES | https://www.fictiondb.com/coversth/th_0743477316.jpg | HTTP 404 |
| BK-1103 | THE CHRONICLES OF NARNIA | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlO1g7yH_emjRbYNjckJ9svZJ8qAPTeFN1og&s | HTTP 404 |
| BK-1113 | Birthright | https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcS7qYSGM0HoNSH27yniH9sr6PNoa-P5ezWrR2UgSDBrS6Pqy9xM | HTTP 404 |
| BK-1153 | Finch's Fortune | https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQnzFG91mg5oRpX9zoPUBuXR-GJeCU3X6SqP8FhCNc5_XV_zDBD | HTTP 404 |
| BK-1200 | NOBLE SAVAGE | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWpIpKBbSwe9UeEFlQYgsnICzFcNEoBCGabw&s | HTTP 404 |
| BK-1230 | Faceless Killers | https://ia601709.us.archive.org/BookReader/BookReaderPreview.php?id=facelesskillers0000mank_h0r7&subPrefix=facelesskille | fetch failed |
| BK-1246 | AIRPORT | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMrE5-RCYcRzN1gJkddy4DutBtEtrlLwn4qoVpLfqMqEqexnad5V78asW1b2edZCrK | HTTP 404 |
| BK-1249 | DRAGONFIRE | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFiyCk8rn8F-tdU3jAP4kph4RfsK_pVL8VTA&s | HTTP 404 |
| BK-1278 | To cut a long story short | https://upload.wikimedia.org/wikipedia/en/7/77/ToCutALongStoryShort.jpg | HTTP 429 |
| BK-1299 | Lonely Man The | https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcThjLiCM0S9YPWXXTieOVK_DTzpxaE4cCmHo4bah463-zUtmprS | HTTP 404 |
| BK-1314 | SHIELD AND THE SWORD THE | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZpIxrZfyjCaunnn7di4_06u5IE8HBWCIiNw&s | HTTP 404 |
| BK-1315 | Christmas Bride The | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3YA9cdGcbSBFVWoeBBw1X7lUpHL-CPs-YRw&s | HTTP 404 |
| BK-1335 | MUHAMMAD ALI | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfviqM1QuHsYKn6HxrNXHORFwLYr6NBgrHIQ&s | HTTP 404 |
| BK-1365 | english prose style | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVyBgNGZKb1vmJkYsmYFSHB5yPScEdnbyhsA&s | HTTP 404 |
| BK-1383 | BEAR ISLAND | https://booksmandala.com/_next/image?url=https%3A%2F%2Fbooks.bizmandala.com%2Fmedia%2Fbooks%2F9788172235987%2Fimage_p7yp | HTTP 404 |
| BK-1391 | LONDON MATCH | https://upload.wikimedia.org/wikipedia/en/9/92/LondonMatch.jpg | HTTP 429 |
| BK-1397 | Hunchback of Notre-Dame The | https://rupapublications.co.in/wp-content/uploads/2016/12/1-280.jpg | HTTP 404 |
| BK-1423 | Jurtjyrkogarden | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjoiP_tK9TJgf4RpJkBltUdFzQNJmlBveg8A&s | HTTP 404 |
| BK-1434 | LAST RAVEN THE | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsQnTPeE-14nDJTstlSFsBY_cvQt1VoutP1Q&s | HTTP 404 |
| BK-1437 | towards ZERO | https://moly.hu/system/covers/big/covers_272075.jpg?1395471532 | HTTP 403 |
| BK-1443 | Big Girl | https://daniellesteel.com/files/2011/03/biggirl.jpg | HTTP 404 |
| BK-1451 | LONE EAGLE | https://daniellesteel.com/wp-content/themes/danielle-steel/images/uk-covers/lone-eagle-sized.jpg | HTTP 404 |
| BK-1456 | HONEYMOON & HOWARD ROUGHAN | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSX8fyg2TFnFFv1tsXqnxdbu_ozA8cY9uKcQ&s | HTTP 404 |
| BK-1457 | 4th OF JULY | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdSfXNX_jr4qFU9CaDcrLI0n_PUmSqf-Pa3g&s | HTTP 404 |
| BK-1483 | THE ANGELS WEEP | https://static.nadirkitap.com/fotograf/125706/25/Kitap_202112291501071257064.jpg | HTTP 403 |
| BK-1485 | THOSE IN PERIL | https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Thoseinperillge.jpeg/220px-Thoseinperillge.jpeg | HTTP 400 |
| BK-1493 | THE APOCALYPSE WATCH | https://hachette.imgix.net/books/9781409128250.jpg?auto=compress&w=440 | HTTP 403 |
| BK-1516 | HARRY POTTER and the Order of the Phoenix | https://static.wikia.nocookie.net/harrypotter/images/3/31/Order_of_the_Phoenix_New_Cover.jpg/revision/latest/scale-to-wi | HTTP 403 |
| BK-1522 | LAST JUROR THE | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMVvpOR0nVCNca7zhBEihIag59W_9YjfqWUw&s | HTTP 404 |
| BK-1523 | Road Less Travel The | https://rhbooks.com.ng/storage/2020/08/Untitled-design-5.png | HTTP 403 |
| BK-1525 | COLD MOUNTAIN | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyRLgkNqDqKdemVgd-yOiOD2nZMXxoe0u2xLQzv70rXzIG4wrO | HTTP 404 |
| BK-1547 | ROYAL ESCAPE | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC8bQ48xZcMorzfs3Bt0S1qpFw6wBxQxZC0Q&s | HTTP 404 |
| BK-1552 | SILAS MARNER | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5ZTjSCioEP3R--8uXLFsgJzu7EaZRr0z1Dw&s | HTTP 404 |
| BK-1558 | Message in a Bottle | https://hachette.imgix.net/books/9780748130443.jpg?auto=compress&w=440 | HTTP 403 |
| BK-1560 | LADY MARGERY'S INRIGUES | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXXZty1rQ2xJ8nhUIzICINENe4nrGC4Sf1RA&s | HTTP 404 |
| BK-1568 | Concubine of Shanghai The | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBzc4MgtCjFp3A7OgmBDHi8BtAzNmk6DtsMA&s | HTTP 404 |
| BK-1584 | CRAFT OF AMERICAN HISTORY THE | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY2C2kPuNtCANwqRe-dAspiq8wvzmLrF7BEw&s | HTTP 404 |
| BK-1585 | BEST SPORTS STORIES 1967 | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAZhFNcedAe7u3jvpN6sduQjCtzfRpMoSSUg&s | HTTP 404 |
| BK-1610 | CHARLOTTE BRONTE | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfMPELAf1N_Aw7AiacM1uKpnpcC2f87lQKcPqrsiPKgryAD7_ifxav3qW3vkmghvTo | HTTP 404 |
| BK-1631 | DAY AFTER TOMORROW THE | https://th.bing.com/th/id/R.460df764342b308935c7d0d24275d576?rik=HoWJCAXm%2fFbMKg&riu=http%3a%2f%2fprodimage.images-bn.c | HTTP 404 |
| BK-1632 | SEEKERS THE | https://th.bing.com/th/id/R.7750b5295681e740d04fcfa14b4224f7?rik=IlocHBbWx%2fPO%2bw&riu=http%3a%2f%2fprodimage.images-bn | HTTP 404 |
| BK-1638 | HAVANA BAY | https://th.bing.com/th/id/R.88f8d0851be0440f8876241614f8690a?rik=15V6U1f%2flIg7CA&riu=http%3a%2f%2fwww.fictiondb.com%2fc | HTTP 404 |
| BK-1643 | SECRET GARDEN THE | https://th.bing.com/th/id/OIP.NU_TrYtH-P_gIwKXxq0JowHaHa?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1644 | FIRST AMONG EQUALS | https://th.bing.com/th/id/R.3514826436313ece48ec1ee60919344c?rik=yeI%2fFIPGUKFGeA&riu=http%3a%2f%2fwww.jeffreyarcher.co. | HTTP 404 |
| BK-1647 | Unfortunates The | https://th.bing.com/th/id/OIP.o3G2Hu-bgwRa10WVkNEjPwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1651 | Grendel | https://th.bing.com/th/id/OIP.mAx-spUs7qMitHYpR8VAtQHaJ4?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1664 | RISING TIDES | https://th.bing.com/th/id/R.c33c98040bae36f4bd1825037efd1123?rik=82%2fbqims4NXeig&pid=ImgRaw&r=0 | HTTP 404 |
| BK-1665 | JOSEPH ANDREWS | https://th.bing.com/th/id/OIP.0bfxKzUooCsl9JfTkNwmfwAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1667 | DIAMOND TRAP THE | https://th.bing.com/th/id/OIP.uxD3pO1J_bMjd1MxFlPKewAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1670 | QUICK RED FOX THE | https://th.bing.com/th/id/OIP.ypIB9yFLik0Dn4YdWmztWgAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1671 | FARSEER | https://th.bing.com/th/id/OIP.Usi084MQRBKKPdljkxu2ugHaMB?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1677 | SKY IS FALLING THE | https://th.bing.com/th/id/OIP.evMSP07zkXe1ka1ERcgBswHaL6?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1680 | MASTER OF THE GAME | https://th.bing.com/th/id/OIP.DPJjKL2vdHjyikJr5AhCmQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1687 | HALF GIRLFRIEND | https://th.bing.com/th/id/OIP.kz_Au2XlAUfeM2_Kx0Yo3QAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1693 | THROWN AWAY CHILD | https://th.bing.com/th/id/OIP.3GH7I5xKtNILBKNH0WYkQgAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1695 | WHITE HART THE | https://th.bing.com/th/id/OIP.iRENJpPSrSytWvIV0M5vkAHaMM?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1698 | Among the imposters | https://th.bing.com/th/id/OIP.9EPF-Tk4KZreQFlLrFK98wHaJ4?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1703 | MAXIMUM RIDE | https://th.bing.com/th/id/R.e27ca35fd3da74f923def799b0690db9?rik=PU9EIuju4qQoiQ&pid=ImgRaw&r=0 | HTTP 404 |
| BK-1708 | JOURNEY INTO DARKNESS | https://th.bing.com/th/id/OIP.UcTK_t3BN2rf-Lmq4cL5UQHaN0?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1713 | FINAL IMPACT | https://th.bing.com/th/id/OIP.nsvS6OJ4klab0gC3r05NJwHaHa?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1714 | ASHES OF EDEN THE | https://th.bing.com/th/id/OIP.ju8IUxTQQYXgeJzVHCcOGgHaLH?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1716 | SISTERS O'DONNELL The | https://th.bing.com/th/id/OIP.ECD0Xtb7tXKUmcmCkGyEeAAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1720 | ILLICIT | https://th.bing.com/th/id/OIP.qQ-vBZdM7eCdZFL-Me3f4gHaKu?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1722 | LISTENING TO GRASS-HOPPERS | https://th.bing.com/th/id/OIP.W7MNrSyXxD_mudH-xyb9TQAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1723 | THIRD TWIN THE | https://th.bing.com/th/id/OIP.AGbVNqlPhew15XDcu9hQfAAAAA?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1724 | CODE TO ZERO | https://th.bing.com/th/id/R.9959047bd05d7669b9ba0254fd7cd451?rik=EigOpf73mkbgxQ&pid=ImgRaw&r=0 | HTTP 404 |
| BK-1725 | HAMMER OF EDEN THE | https://th.bing.com/th/id/R.eadb55916c7a650b0909b8ac54249ea0?rik=ot2DqoHUjOx6Ug&pid=ImgRaw&r=0 | HTTP 404 |
| BK-1728 | PELICAN BRIEF THE | https://th.bing.com/th/id/OIP.JXhDeyFcC_tok3hMMvQXPAHaMQ?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1729 | SUMMONS THE | https://th.bing.com/th/id/OIP.BKUQ9FmQjEvmjVArYYj9VAHaL-?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1735 | A PAINTED HOUSE | https://th.bing.com/th/id/OIP.5det3Tn-jzpEJEGTBLyn8wHaMU?rs=1&pid=ImgDetMain | HTTP 404 |
| BK-1743 | English Literature of the 20 th Century | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQouL-Y-W3mdeYyS9d7I_CdxWtkhBtjvdQuQ&s | HTTP 404 |
| BK-1746 | Harry Potter and Half Blood Prince | https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/Harry_Potter_and_the_Half-Blood_Prince_cover.png/220px-Harry_Potter | HTTP 400 |
| BK-1753 | Tom Jones | https://images.saymedia-content.com/.image/c_limit%2Ccs_srgb%2Cq_auto:eco%2Cw_700/MjA0NzMzOTUwNjE3MzMwNzE3/exuberant-wor | HTTP 404 |
| BK-1755 | Coffe Tea or Me? | https://upload.wikimedia.org/wikipedia/en/thumb/2/20/Coffee-Tea-or-Me-first-edition.jpg/220px-Coffee-Tea-or-Me-first-edi | HTTP 400 |
| BK-1787 | Bangladesh-er Jonmo | https://uplbooks.com/web/image/product.product/12561/image_1024 | fetch failed |
| BK-1790 | Her Benny | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuGBAeRz6bK3dWYCZEhOWz7AMYxCoo3RbKUQ&s | HTTP 404 |
| BK-1797 | Rituchinho Guli | https://imrulhassan.com/wp-content/uploads/1998/01/183035_500703417092_5983537_n.jpg | fetch failed |
| BK-1799 | Black Holes and Baby Universes and Other Essays | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMiUWS5PU6ThiMVaKQY7GAi4lpY4O3WpDcqyRKdWm38PPQ_tfEPEYJbKo7gIxL8KpV | HTTP 404 |
| BK-1833 | Ekushe February | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEqM7CjBJqDvwhtDNJW4-oskmSoNUzzxz-Qg&s | HTTP 404 |
| BK-1879 | Office XP 2007 (Volume 1) | https://tunabari.com/public/uploads/all/A6gjBuJNHh65tIRNYXZSt6c8LB9sY5YkxQnvNHIH.jpg | HTTP 404 |
| BK-1909 | The Decade of Stagnation | https://uplbooks.com/web/image/product.template/2982/image_512/%5B9789840511617%5D%20The%20Decade%20of%20Stagnation:%20T | fetch failed |
| BK-1942 | MATHEMATICS ONE | https://boicycle.com/wp-content/uploads/MATHEMATICS-TWO-L.-HARWOOD-CLARKE-Math-BoiBoiBoi.jpg | HTTP 404 |
| BK-1943 | SECURITIES & EXCHANGE LAWS | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRB1i8lRspbPltUmgUaqsuOoB9vOc9CwYb-gw&s | HTTP 404 |
| BK-1959 | Diary of a Wimpy Kid- DOG DAYS | https://upload.wikimedia.org/wikipedia/en/7/78/Diary_of_a_Wimpy_Kid_Dog_Days_book_cover.jpg | HTTP 429 |
| BK-1989 | Rat-A-Tat Mystery The | https://www.enidblytonsociety.co.uk/author/covers/the-rat-a-tat-mystery-7.jpg | HTTP 403 |
| BK-1998 | Hardy Boys No. 2 The | https://www.chickenmashfarm.com/cdn/shop/products/TheHardyBoysNo2EvilIncByFranklinWDixonFirstArchway1987_600x.jpg?v=1648 | HTTP 404 |
| BK-1999 | Hardy Boys No. 60 The | https://nationalbookswap.com/pbs/l/63/0963/9780671730963.jpg | fetch failed |
| BK-2004 | Give Yourself Goosebumps | https://prodimage.images-bn.com/pimages/9780545841788_p0_v1_s1200x630.jpg | HTTP 500 |
| BK-2017 | GOOSEBUMPS- SAY CHEESE AND DIE! | https://static.wikia.nocookie.net/goosebumps/images/8/87/Saycheeseanddie-reprint.jpg/revision/latest/scale-to-width/360? | HTTP 403 |
| BK-2019 | the beacon readers | https://getmybooks.sgp1.cdn.digitaloceanspaces.com/images/33568895_1.jpg | fetch failed |
| BK-2026 | Old Mali and The Boy | https://ideacdn.net/idea/ig/91/myassets/products/006/9780435272265.png?revision=1720001319 | fetch failed |
| BK-2048 | Sleep overs | https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Sleepovers_%28book%29.jpg/220px-Sleepovers_%28book%29.jpg | HTTP 400 |
| BK-2051 | Matilda | https://bakgatbooks.co.za/wp-content/uploads/2024/11/282_matilda_dahl-scaled.jpg | HTTP 403 |
| BK-2077 | New Brighter Grammar -1 | https://d129gwz7aecqjo.cloudfront.net/images/thumbs/0013161_new-brighter-grammar-1-new-edition_550.webp | fetch failed |
| BK-2082 | Goldilock and the three bears | https://boibichitra.com/public/uploads/products/photos/MU0tQqhp1nNaiDaL991H8I662rQ1BcGwosN5vi3R.jpeg | HTTP 404 |
| BK-2097 | Treasure Island | https://ruralchild.org.za/wp-content/uploads/2024/03/A68619C6-191B-DA43-982D-95BB5EDFAF25.jpg | HTTP 403 |
| BK-2111 | Robinson Crusoe | https://static.wikia.nocookie.net/literature/images/e/ee/1889RobinsonCrusoeUSA.jpg/revision/latest?cb=20170211102934 | HTTP 403 |
| BK-2118 | Rat-a-Tat Mystery | https://www.enidblytonsociety.co.uk/author/covers/the-rat-a-tat-mystery-5.jpg | HTTP 403 |
| BK-2120 | Animorphs: The Beginning | https://static.wikia.nocookie.net/animorphs/images/4/42/Animorphs_the_beginning_book_54_front_cover_hi_res.jpg/revision/ | HTTP 403 |
| BK-2121 | Animorphs: The Proposal | https://static.wikia.nocookie.net/animorphs/images/5/51/Animorphs_35_the_proposal_ebook_cover.jpg/revision/latest/scale- | HTTP 403 |
| BK-2122 | Animorphs: The Mutation | https://static.wikia.nocookie.net/animorphs/images/c/c4/Animorphs_36_the_mutation_ebook_cover.jpeg/revision/latest/scale | HTTP 403 |
| BK-2123 | Animorphs : The Revelation | https://static.wikia.nocookie.net/animorphs/images/a/a7/Animorphs_book_45_revelation_hi_res.jpg/revision/latest/scale-to | HTTP 403 |
| BK-2124 | Animorphs: The Unknown | https://static.wikia.nocookie.net/animorphs/images/4/42/Animorphs_14_the_unknown_ebook_Scholastic_Cover.jpg/revision/lat | HTTP 403 |
| BK-2133 | Kristy's Big Day | https://static.wikia.nocookie.net/babysittersclub/images/d/d3/6%2C_Kristy%27s_Big_Day.png/revision/latest?cb=20110510183 | HTTP 403 |
| BK-2135 | Stacy and the Mystery at the Empty House | https://static.wikia.nocookie.net/babysittersclub/images/2/2a/BSC_Mystery_18_Stacey_Mystery_at_the_Empty_House_ebook_cov | HTTP 403 |
| BK-2151 | Mary Anne Breaks the Rules. | https://static.wikia.nocookie.net/babysittersclub/images/1/11/BSC_79_Mary_Anne_Breaks_the_Rules_ebook_cover.jpg/revision | HTTP 403 |
| BK-2154 | Pinocchio | https://getmybooks.sgp1.cdn.digitaloceanspaces.com/images/33631991_1.jpg | fetch failed |
| BK-2171 | Goosebumps: Iluasion of the Body Squeezers Part 1 #4 | https://static.wikia.nocookie.net/goosebumps/images/1/16/Invasion_of_the_Body_Squeezers%3B_Part_1_%28Cover%29.jpg/revisi | HTTP 403 |
| BK-2175 | Whispers in the Graveyard | https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Whispers_in_the_Graveyard_cover.jpg/220px-Whispers_in_the_Graveyard | HTTP 400 |
| BK-2182 | Danger on Vampire Trail | https://static.wikia.nocookie.net/hardyboys/images/8/89/HBArmadaDangerVampireTrail.jpg/revision/latest?cb=20220103041731 | HTTP 403 |
| BK-2191 | Sottota Mithya | https://cdn.baatighar.com/web/image/product.product/73564/image_1024/%5B9789849683438%5D%20%E0%A6%B8%E0%A6%A4%E0%A7%8D%E | fetch failed |
| BK-2195 | Ardhobritta | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGStW6w9LGtxG5PQXUqIAvJ_qp-tMj_uY8fQ&s | HTTP 404 |
| BK-2209 | Coma | https://www.google.com/url?sa=i&url=https%3A%2F%2Fonubhob.wordpress.com%2F2014%2F09%2F04%2Fcoma-by-robin-cook-translated | Input buffer contains unsupported image format |
| BK-2216 | Intensity | https://www.rokomari.com/book/93921 | Input buffer has corrupt header: glib: XML parse error: Error domain 1 code 76 on line 37 column 196505 of data: Opening and ending tag mismatch: html line 1 and div |
| BK-2480 | Samvala Ditio Jatra | https://wwwamaderswapnocomec1eb.zapwp.com/q:i/r:0/wp:1/w:1/u:https://www.amaderswapno.com/wp-content/uploads/2020/03/202 | HTTP 500 |
| BK-2544 | Kalbela | https://www.google.com/imgres?q=%E0%A6%95%E0%A6%BE%E0%A6%B2%E0%A6%AC%E0%A7%87%E0%A6%B2%E0%A6%BE&imgurl=https%3A%2F%2Fwww | HTTP 429 |
| BK-2785 | Dua’r Bhandar | https://www.quranicbooks.com/assets/admin/img/products/small/918562159.jpg | HTTP 404 |
| BK-2788 | Zarratin Khairan | https://goonok.b-cdn.net/wp-content/uploads/2023/05/%E0%A6%AF%E0%A6%BE%E0%A6%B0%E0%A6%B0%E0%A6%BE%E0%A6%A4%E0%A6%BF%E0%A | HTTP 403 |
| BK-2811 | America Muslimder Abishkar | https://www.raiyaanshop.com/wp-content/uploads/2020/12/america-musolman-der-abiskar.jpg | HTTP 403 |
| BK-2829 | Namaz Shikkha Shahayika | https://aminahbd.com/wp-content/uploads/2021/04/%E0%A6%A8%E0%A6%BE%E0%A6%AE%E0%A6%BE%E0%A6%AF-%E0%A6%B6%E0%A6%BF%E0%A6%9 | HTTP 404 |
| BK-2954 | Tawhider Mormokotha | https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlkzgmw9xvjoScWyRcccubhiv6EOgdd6JAsg&s | HTTP 404 |
| BK-2981 | Shobdo Shotok Golpo Kotok | https://drive.google.com/file/d/1YJmDB0CVfD6quuRjkuOk0O7FlOFVun2H/view?usp=drive_link | HTTP 401 |

## Flagged rows

**Blank copies → 1 copy (1):** BK-1776

**Blank condition → Good (228):** BK-1776, BK-2208, BK-2296, BK-2785, BK-2786, BK-2787, BK-2788, BK-2789, BK-2790, BK-2791, BK-2792, BK-2793, BK-2794, BK-2795, BK-2796, BK-2797, BK-2798, BK-2799, BK-2800, BK-2801, BK-2802, BK-2803, BK-2804, BK-2805, BK-2806, BK-2807, BK-2808, BK-2809, BK-2810, BK-2811, BK-2812, BK-2813, BK-2814, BK-2815, BK-2816, BK-2817, BK-2818, BK-2819, BK-2820, BK-2821, BK-2822, BK-2823, BK-2824, BK-2825, BK-2826, BK-2827, BK-2828, BK-2829, BK-2830, BK-2831, BK-2832, BK-2833, BK-2835, BK-2836, BK-2837, BK-2838, BK-2839, BK-2840, BK-2841, BK-2842, BK-2843, BK-2844, BK-2845, BK-2846, BK-2847, BK-2848, BK-2849, BK-2850, BK-2851, BK-2852, BK-2853, BK-2854, BK-2855, BK-2856, BK-2857, BK-2858, BK-2859, BK-2860, BK-2861, BK-2862, BK-2863, BK-2864, BK-2865, BK-2866, BK-2867, BK-2868, BK-2869, BK-2870, BK-2871, BK-2872, BK-2873, BK-2874, BK-2875, BK-2876, BK-2877, BK-2878, BK-2879, BK-2880, BK-2881, BK-2882, BK-2883, BK-2884, BK-2885, BK-2886, BK-2887, BK-2888, BK-2889, BK-2890, BK-2891, BK-2892, BK-2893, BK-2894, BK-2895, BK-2896, BK-2897, BK-2898, BK-2899, BK-2900, BK-2901, BK-2902, BK-2903, BK-2904, BK-2905, BK-2906, BK-2907, BK-2908, BK-2909, BK-2910, BK-2911, BK-2912, BK-2913, BK-2914, BK-2915, BK-2916, BK-2917, BK-2918, BK-2919, BK-2920, BK-2921, BK-2922, BK-2923, BK-2924, BK-2925, BK-2926, BK-2927, BK-2928, BK-2929, BK-2930, BK-2931, BK-2932, BK-2933, BK-2934, BK-2935, BK-2936, BK-2937, BK-2938, BK-2939, BK-2940, BK-2941, BK-2942, BK-2943, BK-2944, BK-2945, BK-2946, BK-2947, BK-2948, BK-2949, BK-2950, BK-2951, BK-2952, BK-2959, BK-2960, BK-2961, BK-2962, BK-2963, BK-2964, BK-2965, BK-2966, BK-2967, BK-2968, BK-2969, BK-2970, BK-2971, BK-2972, BK-2973, BK-2974, BK-2975, BK-2976, BK-2977, BK-2978, BK-2979, BK-2980, BK-2981, BK-2982, BK-2983, BK-2984, BK-2985, BK-2986, BK-2987, BK-2988, BK-2989, BK-2990, BK-2991, BK-2992, BK-2993, BK-2994, BK-2995, BK-2996, BK-2997, BK-2998, BK-2999, BK-3000, BK-3001, BK-3002, BK-3003, BK-3004, BK-3005, BK-3006, BK-3007, BK-3008, BK-3009, BK-3010, BK-3011, BK-3012, BK-3013, BK-3014, BK-3015, BK-3016

**Condition column held something that is not a condition → Good (3):** BK-0139 ('Aronno Prokashoni'), BK-0140 ('Aronno Prokashoni'), BK-0141 ('Aronno Prokashoni')

**Foreign-currency price → null (55):** BK-0982 ('RS 60'), BK-0983 ('p 7'), BK-0984 ('p 1.25'), BK-0987 ('P 7'), BK-0989 ('P 5'), BK-0990 ('p 5'), BK-0992 ('p 6'), BK-0994 ('p 10'), BK-1002 ('p 4.15'), BK-1004 ('RS 790'), BK-1005 ('RS 450'), BK-1006 ('P 8.99'), BK-1018 ('p 6.99'), BK-1022 ('p 5.99'), BK-1024 ('p 11.59'), BK-1028 ('RS 40'), BK-1030 ('p 7.99'), BK-1032 ('p 1.50'), BK-1035 ('RM 11.0'), BK-1040 ('P 4.99'), BK-1041 ('P 6.99'), BK-1045 ('p 6.99'), BK-1048 ('P 6.99'), BK-1052 ('P 1.90'), BK-1054 ('P 6.99'), BK-1056 ('P 5.99'), BK-1059 ('P 1.95'), BK-1063 ('P 6.99'), BK-1068 ('p 6.99'), BK-1069 ('p 3.95'), BK-1071 ('RS 230'), BK-1072 ('CAD 2.30'), BK-1073 ('P 4.50'), BK-1074 ('p 1.75'), BK-1081 ('p 4.99'), BK-1082 ('RS 395'), BK-1083 ('P 10.99'), BK-1085 ('P 12.99'), BK-1086 ('P 13.99'), BK-1087 ('P 9.99'), BK-1089 ('P 4.50'), BK-1090 ('P 6.99'), BK-1091 ('P 1.00'), BK-1102 ('P 12.99'), BK-1104 ('P 6.99'), BK-1105 ('RS 199'), BK-1106 ('P 5.99'), BK-1109 ('RS 50'), BK-1110 ('P 5.99'), BK-1111 ('P 6.99'), BK-1112 ('P 6.99'), BK-1113 ('RS 495'), BK-1116 ('AUD 0.85'), BK-1121 ('P 6.99'), BK-1123 ('RS 795')

**Pages written as two numbers → summed (3):** BK-2301 ("152\n128" → 280), BK-2679 ("86\n110" → 196), BK-2916 ("88\n68" → 156)

**English title missing → Bangla title used (1):** BK-1886

**English author missing → '' (column is NOT NULL) (83):** BK-0142, BK-0145, BK-0495, BK-0549, BK-0552, BK-0553, BK-0733, BK-0735, BK-0749, BK-0833, BK-0860, BK-0953, BK-0969, BK-1417, BK-1441, BK-1563, BK-1681, BK-1738, BK-1739, BK-1740, BK-1741, BK-1742, BK-1758, BK-1759, BK-1762, BK-1789, BK-1792, BK-1794, BK-1813, BK-1814, BK-1839, BK-1842, BK-1845, BK-1852, BK-1858, BK-1875, BK-1885, BK-1888, BK-1906, BK-1907, BK-1909, BK-1912, BK-1914, BK-1924, BK-1932, BK-1934, BK-2066, BK-2068, BK-2082, BK-2083, BK-2084, BK-2085, BK-2086, BK-2087, BK-2088, BK-2089, BK-2090, BK-2091, BK-2092, BK-2093, BK-2094, BK-2095, BK-2096, BK-2098, BK-2099, BK-2100, BK-2101, BK-2103, BK-2104, BK-2105, BK-2474, BK-2501, BK-2645, BK-2652, BK-2653, BK-2655, BK-2727, BK-2832, BK-2836, BK-2904, BK-2906, BK-2952, BK-2958

**Year is not a single 4-digit year (kept as written) (14):** BK-1000 ('1859-1885'), BK-1036 ('29–19 BCE'), BK-1103 ('1950–1956'), BK-1133 ('1595-1596'), BK-1193 ('1880/1881'), BK-1231 ('2002, 2005'), BK-1272 ('1988, 1991'), BK-1565 ('1944-1964'), BK-1702 ('5th Century BC'), BK-1876 ('2014/2015'), BK-1877 ('2015/2016'), BK-1884 ('2015/2016'), BK-1885 ('2019-2020'), BK-2278 ('1981 & 2012')

**Manual row fixes (2):**
- BK-1776: Bangla title and Bangla author are swapped in the sheet (English columns say 'Dune Messiah' / 'Frank Herbert'). Set {"title_bangla":"ডিউন মেসাইয়া","author_bangla":"ফ্র্যাঙ্ক হার্বার্ট"}
- BK-2918: Price typed as '48o' (letter o for zero). Set {"price":480}

## Normalisations applied

Every text field is trimmed and internal runs of whitespace are collapsed to one space (1378 cells changed). '-' and blank become null.

### Category → audience

Every row is listed (identity mappings included) so the table is the full picture. Raw value kept in `category_raw`.

| From | To | Rows | Books |
|---|---|---:|---|
| "Adults" | Adults | 1363 |  |
| "Fiction" | General | 493 |  |
| "Young Adults" | Young Adults | 290 |  |
| (blank) | General | 226 |  |
| "Children" | Children | 150 |  |
| "All Ages" | All Ages | 108 |  |
| "Young Adults & Adults" | Young Adults | 84 |  |
| "Translation" | General | 82 |  |
| "Kids & Teens" | Children | 59 |  |
| "Young Adult" | Young Adults | 31 |  |
| "Non Fiction" | General | 30 |  |
| "All ages" | All Ages | 23 |  |
| "Academic Books for Adults" | Adults | 20 |  |
| "General" | General | 10 |  |
| "Education" | General | 8 | BK-2066, BK-2075, BK-2076, BK-2077, BK-2078, BK-2079, BK-2080, BK-2172 |
| "Adult" | Adults | 7 | BK-0202, BK-1771, BK-1772, BK-1773, BK-1774, BK-1775, BK-1776 |
| " Adults" | Adults | 3 | BK-0090, BK-0104, BK-0168 |
| "Children, Young Adults" | Children | 3 | BK-1103, BK-1105, BK-1257 |
| "Kids & Adults" | All Ages | 3 | BK-1786, BK-1808, BK-1839 |
| "Collection" | General | 3 | BK-2451, BK-2452, BK-2453 |
| "young Adults & Adults" | Young Adults | 2 | BK-0051, BK-0231 |
| " Young Adults & Adults" | Young Adults | 2 | BK-0062, BK-0169 |
| "Academic" | General | 2 | BK-1131, BK-1161 |
| "Educational" | General | 2 | BK-1206, BK-1256 |
| "Reference" | General | 1 | BK-0721 |
| "Children, Adults" | All Ages | 1 | BK-0988 |
| "Family" | All Ages | 1 | BK-1070 |
| "Children/Young Adults" | Children | 1 | BK-1097 |
| "Teens & Adults" | Young Adults | 1 | BK-1818 |
| "Students" | General | 1 | BK-1860 |
| "Dictionary" | General | 1 | BK-1906 |
| "Religious" | General | 1 | BK-1907 |
| "Comics Children" | Children | 1 | BK-2164 |
| "Biography" | General | 1 | BK-2184 |
| "Non Fiction " | General | 1 | BK-2223 |
| "Adaptation" | General | 1 | BK-2476 |

### Condition

Raw value kept in `condition_raw`.

| From | To | Rows | Books |
|---|---|---:|---|
| "Good" | Good | 2663 |  |
| (blank) | Good | 228 |  |
| "Medium" | Fair | 67 |  |
| "Bad" | Poor | 15 |  |
| "Medium(Need to repair)" | Needs Repair | 10 |  |
| "Medium (Need to repair)" | Needs Repair | 9 |  |
| "Medium(Need to repair pages)" | Needs Repair | 5 | BK-0064, BK-0197, BK-0309, BK-0368, BK-2007 |
| "Medium (Need to repair pages)" | Needs Repair | 5 | BK-0903, BK-1532, BK-1534, BK-1641, BK-1823 |
| "Aronno Prokashoni" | Good | 3 | BK-0139, BK-0140, BK-0141 |
| "Medium repair needed" | Needs Repair | 3 | BK-2149, BK-2174, BK-2186 |
| "Bad Binding Needed" | Needs Repair | 3 | BK-2183, BK-2184, BK-2190 |
| "Medium " | Fair | 2 | BK-0387, BK-1816 |
| "Bad(Need to repair)" | Needs Repair | 1 | BK-1409 |
| "Medium (Page Missing)" | Poor | 1 | BK-1878 |
| "Medium (Pages Missing) " | Poor | 1 | BK-1917 |

### Genre

153 rows changed by trimming/collapsing whitespace (or '-' → null). Distinct values: 721 raw → 694 after. Raw value kept in `genre_raw`.

| From | To | Rows |
|---|---|---:|
| "-" | (null) | 59 |
| "Poem " | Poem | 9 |
| " Novel / Psychological" | Novel / Psychological | 5 |
| "Historical  Novel" | Historical Novel | 5 |
| "Historical " | Historical | 5 |
| " Children's Literature / Fantasy" | Children's Literature / Fantasy | 4 |
| "Religious " | Religious | 4 |
| "Young Adult " | Young Adult | 4 |
| "Autobiography " | Autobiography | 4 |
| "Thriller Mystery " | Thriller Mystery | 4 |
| "Suspense Crime Thriller Mystery " | Suspense Crime Thriller Mystery | 4 |
| " Novel / Mystery" | Novel / Mystery | 3 |
| "Novel / Social " | Novel / Social | 3 |
| " Novel / Romantic" | Novel / Romantic | 3 |
| " Novel" | Novel | 3 |
| "Supernatural " | Supernatural | 3 |
| " Children's Literature / Mystery" | Children's Literature / Mystery | 2 |
| "Humurous Story " | Humurous Story | 2 |
| " Mystery / Supernatural" | Mystery / Supernatural | 2 |
| "Detective " | Detective | 2 |
| "Contemporary " | Contemporary | 2 |
| " Horror / Supernatural" | Horror / Supernatural | 1 |
| " Science Fiction" | Science Fiction | 1 |
| "Dictionary " | Dictionary | 1 |
| " Romance, Holiday Fiction" | Romance, Holiday Fiction | 1 |
| "Short Stories, Fiction " | Short Stories, Fiction | 1 |
| "Sports " | Sports | 1 |
| "Liberation War Young Adult " | Liberation War Young Adult | 1 |
| "Novel " | Novel | 1 |
| "Crime Thriller\nSciFi Thriller" | Crime Thriller SciFi Thriller | 1 |
| " Contemporary Novel" | Contemporary Novel | 1 |
| "Drama  " | Drama | 1 |
| "Drama " | Drama | 1 |
| "Children " | Children | 1 |
| " Pilgrimage Story Collection" | Pilgrimage Story Collection | 1 |
| "Psychological Gothic  Horror" | Psychological Gothic Horror | 1 |
| "Contemporary Fantasy " | Contemporary Fantasy | 1 |
| " Memoir and Collection of Jokes" | Memoir and Collection of Jokes | 1 |
| "Spiritual Fantasy Adventure " | Spiritual Fantasy Adventure | 1 |
| "Liberation War " | Liberation War | 1 |
| "Contemporary\nLiberation War" | Contemporary Liberation War | 1 |
| "High Fantasy " | High Fantasy | 1 |

### Price

| From | To | Rows | Books |
|---|---|---:|---|
| "-" | (null) | 27 |  |
| "P 6.99" | (null, foreign currency) | 9 |  |
| "p 6.99" | (null, foreign currency) | 3 | BK-1018, BK-1045, BK-1068 |
| "P 5.99" | (null, foreign currency) | 3 | BK-1056, BK-1106, BK-1110 |
| "P 4.50" | (null, foreign currency) | 2 | BK-1073, BK-1089 |
| "P 12.99" | (null, foreign currency) | 2 | BK-1085, BK-1102 |
| "RS 60" | (null, foreign currency) | 1 | BK-0982 |
| "p 7" | (null, foreign currency) | 1 | BK-0983 |
| "p 1.25" | (null, foreign currency) | 1 | BK-0984 |
| "P 7" | (null, foreign currency) | 1 | BK-0987 |
| "P 5" | (null, foreign currency) | 1 | BK-0989 |
| "p 5" | (null, foreign currency) | 1 | BK-0990 |
| "p 6" | (null, foreign currency) | 1 | BK-0992 |
| "p 10" | (null, foreign currency) | 1 | BK-0994 |
| "p 4.15" | (null, foreign currency) | 1 | BK-1002 |
| "RS 790" | (null, foreign currency) | 1 | BK-1004 |
| "RS 450" | (null, foreign currency) | 1 | BK-1005 |
| " P 8.99" | (null, foreign currency) | 1 | BK-1006 |
| "BDT 125" | 125 | 1 | BK-1012 |
| "p 5.99" | (null, foreign currency) | 1 | BK-1022 |
| "p 11.59" | (null, foreign currency) | 1 | BK-1024 |
| "RS 40" | (null, foreign currency) | 1 | BK-1028 |
| "p 7.99" | (null, foreign currency) | 1 | BK-1030 |
| "p 1.50" | (null, foreign currency) | 1 | BK-1032 |
| "RM 11.0" | (null, foreign currency) | 1 | BK-1035 |
| "P 4.99" | (null, foreign currency) | 1 | BK-1040 |
| "P 1.90" | (null, foreign currency) | 1 | BK-1052 |
| "P 1.95" | (null, foreign currency) | 1 | BK-1059 |
| "p 3.95" | (null, foreign currency) | 1 | BK-1069 |
| "RS 230" | (null, foreign currency) | 1 | BK-1071 |
| "CAD 2.30" | (null, foreign currency) | 1 | BK-1072 |
| "p 1.75" | (null, foreign currency) | 1 | BK-1074 |
| "p 4.99" | (null, foreign currency) | 1 | BK-1081 |
| "RS 395" | (null, foreign currency) | 1 | BK-1082 |
| "P 10.99" | (null, foreign currency) | 1 | BK-1083 |
| "P 13.99" | (null, foreign currency) | 1 | BK-1086 |
| "P 9.99" | (null, foreign currency) | 1 | BK-1087 |
| "P 1.00" | (null, foreign currency) | 1 | BK-1091 |
| "BDT 1495" | 1495 | 1 | BK-1101 |
| "RS 199" | (null, foreign currency) | 1 | BK-1105 |
| "RS 50" | (null, foreign currency) | 1 | BK-1109 |
| "RS 495" | (null, foreign currency) | 1 | BK-1113 |
| "AUD 0.85" | (null, foreign currency) | 1 | BK-1116 |
| "RS 795" | (null, foreign currency) | 1 | BK-1123 |
| "48o" | (null, unparsed) | 1 | BK-2918 |

### Pages

| From | To | Rows | Books |
|---|---|---:|---|
| "-" | (null) | 35 |  |
| "340+" | 340 | 1 | BK-0541 |
| "612+" | 612 | 1 | BK-1888 |
| "152\n128" | 280 (summed volumes) | 1 | BK-2301 |
| "`1176" | 1176 | 1 | BK-2442 |
| "86\n110" | 196 (summed volumes) | 1 | BK-2679 |
| "88\n68" | 156 (summed volumes) | 1 | BK-2916 |

### Year of publication

| From | To | Rows | Books |
|---|---|---:|---|
| "-" | (null) | 16 |  |
| " " | (null) | 1 | BK-2050 |

### Edition

Ordinals rewritten (1ST → 1st, 21th → 21st, 63th → 63rd).

| From | To | Rows | Books |
|---|---|---:|---|
| "1ST" | 1st | 12 |  |
| "1st " | 1st | 12 |  |
| "-" | (null) | 8 | BK-0161, BK-0750, BK-0946, BK-0969, BK-1428, BK-1882, BK-1907, BK-1919 |
| "15TH" | 15th | 2 | BK-0027, BK-0315 |
| "21th" | 21st | 1 | BK-0199 |
| "10th " | 10th | 1 | BK-2413 |
| "7th " | 7th | 1 | BK-2446 |
| "31th" | 31st | 1 | BK-2554 |
| "63th" | 63rd | 1 | BK-2572 |
| "3th" | 3rd | 1 | BK-2759 |
| "2nd " | 2nd | 1 | BK-2783 |
| " " | (null) | 1 | BK-2838 |

## Duplicate (Bangla title + Bangla author) pairs

All rows are imported; the sheet is authoritative. 156 pairs (after trimming whitespace), covering 366 rows. Staff may want to merge some into one row with a higher copy count.

| Bangla title | Bangla author | Books | Copies each |
|---|---|---|---|
| আনন্দে আনন্দে ইংরেজি | আব্দুল্লাহ আবু সায়ীদ | BK-0784, BK-0785, BK-0786, BK-0787, BK-0788, BK-0789, BK-0790, BK-0791, BK-0792, BK-0793, BK-0794, BK-0795, BK-0796, BK-0797, BK-0798, BK-0799, BK-0800 | 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 |
| রচনাবলি খণ্ড | সৈয়দ মুজতবা আলী | BK-2462, BK-2463, BK-2464, BK-2465, BK-2466, BK-2467, BK-2468, BK-2469, BK-2470, BK-2471 | 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 |
| আত্মপ্রকাশ | মোঃ ওয়ালীউল্লাহ অলি | BK-2628, BK-2686, BK-2687, BK-2688 | 1, 1, 1, 1 |
| অনন্ত অম্বরে | হুমায়ূন আহমেদ | BK-0091, BK-0122, BK-0352 | 1, 2, 1 |
| অপেক্ষা | হুমায়ূন আহমেদ | BK-0043, BK-0109, BK-0348 | 1, 1, 1 |
| আজ হিমুর বিয়ে | হুমায়ূন আহমেদ | BK-0041, BK-0108, BK-0293 | 1, 3, 1 |
| আমরা কেউ বাসায় নেই | হুমায়ূন আহমেদ | BK-0021, BK-0125, BK-0237 | 1, 1, 1 |
| আমেরিকা মুসলিমদের আবিষ্কার | মুসা আল হাফিজ | BK-0867, BK-2811, BK-2877 | 1, 1, 1 |
| আশাবরী | হুমায়ূন আহমেদ | BK-0073, BK-0118, BK-0298 | 1, 1, 1 |
| ইমা | হুমায়ূন আহমেদ | BK-0092, BK-0119, BK-0205 | 1, 1, 1 |
| এই শুভ্র! এই | হুমায়ূন আহমেদ | BK-0070, BK-0106, BK-0283 | 1, 1, 1 |
| এপিটাফ | হুমায়ূন আহমেদ | BK-0050, BK-0126, BK-0284 | 1, 1, 1 |
| এবং হিমু | হুমায়ূন আহমেদ | BK-0007, BK-0123, BK-0281 | 1, 2, 1 |
| কবি | হুমায়ূন আহমেদ | BK-0018, BK-0107, BK-0270 | 1, 1, 1 |
| কালো জাদুকর | হুমায়ূন আহমেদ | BK-0079, BK-0102, BK-0272 | 1, 1, 1 |
| কিছুক্ষণ | হুমায়ূন আহমেদ | BK-0088, BK-0103, BK-0273 | 1, 2, 1 |
| ছায়াবীথি | হুমায়ূন আহমেদ | BK-0069, BK-0098, BK-0203 | 1, 1, 1 |
| জলপদ্ম | হুমায়ূন আহমেদ | BK-0030, BK-0113, BK-0212 | 1, 2, 1 |
| তিথির নীল তোয়ালে | হুমায়ূন আহমেদ | BK-0058, BK-0116, BK-0196 | 1, 1, 1 |
| দিঘীর জলে কার ছায়া গো | হুমায়ূন আহমেদ | BK-0074, BK-0121, BK-0206 | 1, 1, 1 |
| নি | হুমায়ূন আহমেদ | BK-0076, BK-0114, BK-0187 | 1, 1, 1 |
| পারুল ও তিনটি কুকুর | হুমায়ূন আহমেদ | BK-0011, BK-0112, BK-0225 | 1, 1, 1 |
| ভূত ভূতং ভূতৌ | হুমায়ূন আহমেদ | BK-0044, BK-0117, BK-0218 | 1, 1, 1 |
| ময়ূরাক্ষী | হুমায়ূন আহমেদ | BK-0090, BK-0104, BK-0168 | 1, 2, 1 |
| মে ফ্লাওয়ার | হুমায়ূন আহমেদ | BK-0040, BK-0115, BK-0165 | 1, 1, 1 |
| রঙপেন্সিল | হুমায়ূন আহমেদ | BK-0028, BK-0120, BK-0335 | 1, 1, 1 |
| রূপালী দ্বীপ | হুমায়ূন আহমেদ | BK-0048, BK-0111, BK-0915 | 1, 1, 1 |
| সকল কাঁটা ধন্য করে | হুমায়ূন আহমেদ | BK-0084, BK-0099, BK-0323 | 1, 1, 1 |
| হিজিবিজি | হুমায়ূন আহমেদ | BK-0056, BK-0124, BK-0186 | 1, 1, 1 |
| হিমু এবং একটি রাশিয়ান পরী | হুমায়ূন আহমেদ | BK-0042, BK-0101, BK-0312 | 1, 2, 1 |
| হিমুর আছে জল | হুমায়ূন আহমেদ | BK-0012, BK-0105, BK-0229 | 1, 2, 1 |
| হিমুর দ্বিতীয় প্রহর | হুমায়ূন আহমেদ | BK-0055, BK-0110, BK-0311 | 1, 3, 1 |
| ১৯৭১ | হুমায়ূন আহমেদ | BK-0081, BK-0355 | 1, 1 |
| অনিল বাগচীর একদিন | হুমায়ূন আহমেদ | BK-0019, BK-0354 | 1, 1 |
| অয়োময় | হুমায়ূন আহমেদ | BK-0046, BK-0353 | 1, 1 |
| অরণ্য | হুমায়ূন আহমেদ | BK-0085, BK-0351 | 1, 1 |
| আনন্দ বেদনার কাব্য | হুমায়ূন আহমেদ | BK-0057, BK-0291 | 1, 1 |
| আমার আপন আঁধার | হুমায়ূন আহমেদ | BK-0047, BK-0292 | 1, 1 |
| আমি এবং আমরা | হুমায়ূন আহমেদ | BK-0009, BK-0296 | 1, 1 |
| আর্কএঞ্জেল | রবার্ট হ্যারিস | BK-0935, BK-1310 | 1, 1 |
| আসমানীরা তিন বোন | হুমায়ূন আহমেদ | BK-0013, BK-0299 | 1, 1 |
| এ ওয়াক টু রিমেম্বার | নিকোলাস স্পার্কস | BK-0931, BK-1557 | 1, 1 |
| এই আমি | হুমায়ূন আহমেদ | BK-0086, BK-0279 | 1, 1 |
| এই মেঘ, রৌদ্রছায়া | হুমায়ূন আহমেদ | BK-0080, BK-0239 | 1, 1 |
| একজন মায়াবতী | হুমায়ূন আহমেদ | BK-0039, BK-0286 | 1, 1 |
| একাত্তরের দিনগুলি | জাহানারা ইমাম | BK-0497, BK-2662 | 1, 1 |
| একুশের একুশ কবিতা | নির্মলেন্দু গুণ | BK-0148, BK-2249 | 2, 3 |
| কপালকুণ্ডলা | বঙ্কিমচন্দ্র চট্টোপাধ্যায় | BK-0153, BK-0656 | 1, 1 |
| কবি | তারাশঙ্কর বন্দ্যোপাধ্যায় | BK-0156, BK-0645 | 1, 1 |
| কমলাকান্তের দপ্তর | বঙ্কিমচন্দ্র চট্টোপাধ্যায় | BK-0144, BK-0658 | 1, 1 |
| কালবেলা | সমরেশ মজুমদার | BK-0154, BK-2544 | 1, 4 |
| কালো গোলাপ | জেসমিন জলি | BK-0143, BK-0835 | 2, 1 |
| কিছু শৈশব | হুমায়ূন আহমেদ | BK-0016, BK-0267 | 1, 1 |
| কুহক | হুমায়ূন আহমেদ | BK-0008, BK-0266 | 1, 1 |
| কুহুরানী | হুমায়ূন আহমেদ | BK-0068, BK-0265 | 1, 1 |
| ক্যানভাসের গল্প | (blank) | BK-0142, BK-0833 | 3, 1 |
| ক্রুসেড সমগ্র ১ | আসাদ বিন হাফিজ | BK-0139, BK-2813 | 1, 1 |
| ক্রুসেড সমগ্র ২ | আসাদ বিন হাফিজ | BK-0140, BK-2814 | 2, 1 |
| ক্রুসেড সমগ্র ৩ | আসাদ বিন হাফিজ | BK-0141, BK-2815 | 2, 1 |
| ক্রোমিয়াম অরণ্য | মুহম্মদ জাফর ইকবাল | BK-0127, BK-0370 | 2, 1 |
| গল্পগুচ্ছ | রবীন্দ্রনাথ ঠাকুর | BK-0825, BK-2749 | 1, 1 |
| গল্পগুলো রম্য | সত্যজিৎ বিশ্বাস | BK-0150, BK-2248 | 1, 2 |
| গল্পদ্যুতির দ্বিতীয় প্রহর | মোঃ সেলিম রেজা | BK-0146, BK-2309 | 4, 4 |
| চলে যায় বসন্তের দিন | হুমায়ূন আহমেদ | BK-0014, BK-0257 | 1, 1 |
| চাকা | সেলিম আল দীন | BK-0607, BK-2640 | 1, 1 |
| চৈত্রের দ্বিতীয় দিবস | হুমায়ূন আহমেদ | BK-0067, BK-0189 | 1, 1 |
| চোখের বালি | রবীন্দ্রনাথ ঠাকুর | BK-0151, BK-0623 | 1, 1 |
| জনম জনম | হুমায়ূন আহমেদ | BK-0065, BK-0247 | 1, 1 |
| জীবনকৃষ্ণ মেমোরিয়াল হাইস্কুল | হুমায়ূন আহমেদ | BK-0054, BK-0254 | 1, 1 |
| জোছনাত্রয়ী | হুমায়ূন আহমেদ | BK-0053, BK-0252 | 1, 1 |
| জোসেফ অ্যান্ড্রুজ | হেনরি ফিল্ডিং | BK-1478, BK-1665 | 1, 1 |
| টি-রেক্সের সন্ধানে | মুহম্মদ জাফর ইকবাল | BK-0131, BK-0393 | 1, 1 |
| টুকুনজিল | মুহম্মদ জাফর ইকবাল | BK-0412, BK-0416 | 1, 1 |
| টেস অফ দ্য ডার্বারভিলস | থমাস হার্ডি | BK-1027, BK-1672 | 1, 1 |
| ডাকঘর | রবীন্দ্রনাথ ঠাকুর | BK-0613, BK-2414 | 1, 1 |
| তন্দ্রাবিলাস | হুমায়ূন আহমেদ | BK-0064, BK-0197 | 1, 1 |
| তিতাস একটি নদীর নাম | অদ্বৈত মল্লবর্মণ | BK-0157, BK-0602 | 1, 1 |
| তুমি আমায় ডেকেছিলে ছুটির নিমন্ত্রণে | হুমায়ূন আহমেদ | BK-0071, BK-0194 | 1, 1 |
| তুমিও জিতবে | শিব খেরা | BK-0576, BK-1829 | 1, 1 |
| তোমাদের এই নগরে | হুমায়ূন আহমেদ | BK-0037, BK-0188 | 1, 1 |
| ত্রিনিত্রি রাশিমালা | মুহম্মদ জাফর ইকবাল | BK-0130, BK-0407 | 1, 1 |
| দরজার ওপাশে | হুমায়ূন আহমেদ | BK-0026, BK-0240 | 1, 1 |
| দারুচিনি দ্বীপ | হুমায়ূন আহমেদ | BK-0033, BK-0185 | 1, 1 |
| দুই দুয়ারী | হুমায়ূন আহমেদ | BK-0015, BK-0183 | 1, 1 |
| দেখা না-দেখা | হুমায়ূন আহমেদ | BK-0035, BK-0262 | 2, 1 |
| দেয়াল | হুমায়ূন আহমেদ | BK-0075, BK-0914 | 1, 1 |
| দ্বীপ | হুমায়ূন আহমেদ | BK-0077, BK-0184 | 1, 1 |
| দ্য দা ভিঞ্চি কোড | ড্যান ব্রাউন | BK-0975, BK-1436 | 1, 1 |
| দ্য পেলিকান ব্রিফ | জন গ্রিশাম | BK-1520, BK-1728 | 1, 1 |
| দ্য লাস্ট জুরর | জন গ্রিশাম | BK-1522, BK-1736 | 1, 1 |
| দ্য সিক্রেট গার্ডেন | ফ্রান্সেস হজসন বার্নেট | BK-1198, BK-1643 | 1, 1 |
| নন্দিত নরকে | হুমায়ূন আহমেদ | BK-0060, BK-0174 | 1, 1 |
| নবনী | হুমায়ূন আহমেদ | BK-0023, BK-0179 | 1, 1 |
| নিউইয়র্কের নীল আকাশে ঝকঝকে রোদ | হুমায়ূন আহমেদ | BK-0059, BK-0176 | 1, 1 |
| নীল মানুষ | হুমায়ূন আহমেদ | BK-0094, BK-0180 | 1, 1 |
| নীল রহস্য | সমরেশ মজুমদার | BK-0686, BK-2548 | 1, 1 |
| নুহাশ এবং আলাদিনের আশ্চর্য চেরাগ | হুমায়ূন আহমেদ | BK-0022, BK-0227 | 1, 1 |
| পাখি আমার একলা পাখি | হুমায়ূন আহমেদ | BK-0072, BK-0226 | 1, 1 |
| পারাপার | হুমায়ূন আহমেদ | BK-0034, BK-0228 | 1, 1 |
| পুতুল | হুমায়ূন আহমেদ | BK-0020, BK-0246 | 1, 1 |
| পুতুল নাচের ইতিকথা | মানিক বন্দ্যোপাধ্যায় | BK-0155, BK-0782 | 1, 1 |
| পেন্সিলে আঁকা পরী | হুমায়ূন আহমেদ | BK-0025, BK-0207 | 1, 1 |
| পোকা | হুমায়ূন আহমেদ | BK-0082, BK-0233 | 1, 1 |
| ফিহা সমীকরণ | হুমায়ূন আহমেদ | BK-0063, BK-0222 | 1, 1 |
| বঙ্কিম রচনা সমগ্র ১ | বঙ্কিমচন্দ্র বন্দ্যোপাধ্যায় | BK-2745, BK-2746 | 1, 1 |
| বলপয়েন্ট | হুমায়ূন আহমেদ | BK-0010, BK-0216 | 1, 1 |
| বাইবেল কুরআন ও বিজ্ঞান | মরিস বুকাইলি | BK-2801, BK-2802 | 2, 1 |
| বাচ্চা ভয়ংকর কাচ্চা ভয়ংকর | মুহম্মদ জাফর ইকবাল | BK-0132, BK-0397 | 2, 1 |
| বিপদ | হুমায়ূন আহমেদ | BK-0036, BK-0306 | 1, 1 |
| বিসর্জন | রবীন্দ্রনাথ ঠাকুর | BK-0612, BK-2393 | 1, 1 |
| বৃষ্টির ঠিকানা | মুহম্মদ জাফর ইকবাল | BK-0134, BK-0435 | 1, 1 |
| বেজি | মুহম্মদ জাফর ইকবাল | BK-0439, BK-0831 | 1, 1 |
| ভয় | হুমায়ূন আহমেদ | BK-0097, BK-0219 | 1, 1 |
| মজার ভূত | হুমায়ূন আহমেদ | BK-0002, BK-0170 | 1, 1 |
| মহাকাল | সার্জিল খান | BK-0812, BK-2529 | 1, 1 |
| মিসির আলি! আপনি কোথায়? | হুমায়ূন আহমেদ | BK-0062, BK-0169 | 1, 1 |
| মিসির আলির চশমা | হুমায়ূন আহমেদ | BK-0029, BK-0167 | 2, 1 |
| মৃণ্ময়ী | হুমায়ূন আহমেদ | BK-0061, BK-0164 | 1, 1 |
| মৃণ্ময়ীর মন ভালো নেই | হুমায়ূন আহমেদ | BK-0089, BK-0211 | 1, 1 |
| মেঘ বলেছে যাব যাব | হুমায়ূন আহমেদ | BK-0087, BK-0263 | 1, 1 |
| মেট্রোপলিটন গল্পগুচ্ছ ৯ | সার্জিল খান | BK-0149, BK-2236 | 2, 1 |
| মেতসিস | মুহম্মদ জাফর ইকবাল | BK-0133, BK-0451 | 1, 1 |
| মেয়েটির নাম নারীনা | মুহম্মদ জাফর ইকবাল | BK-0128, BK-0394 | 1, 1 |
| ম্যাটিল্ডা | রোআল্ড ডাল | BK-1405, BK-2051 | 1, 1 |
| যখন গিয়েছে ডুবে পঞ্চমীর চাঁদ | হুমায়ূন আহমেদ | BK-0066, BK-0341 | 1, 1 |
| যখন নামিবে আঁধার | হুমায়ূন আহমেদ | BK-0045, BK-0339 | 2, 1 |
| যশোহা বৃক্ষের দেশে | হুমায়ূন আহমেদ | BK-0078, BK-0340 | 1, 1 |
| রবোনিশি | মুহম্মদ জাফর ইকবাল | BK-0129, BK-0395 | 1, 1 |
| রূপবন্ধ | (blank) | BK-0145, BK-1792 | 1, 1 |
| লিটু বৃত্তান্ত | মুহম্মদ জাফর ইকবাল | BK-0135, BK-0453 | 1, 1 |
| লিভিং হিস্ট্রি | হিলারি রডহ্যাম ক্লিনটন | BK-0974, BK-1211 | 1, 1 |
| লিলুয়া বাতাস | হুমায়ূন আহমেদ | BK-0096, BK-0100 | 1, 2 |
| লীলাবতীর মৃত্যু | হুমায়ূন আহমেদ | BK-0024, BK-0261 | 1, 1 |
| শত হামদ শত নাত | সাবির আহমেদ চৌধুরী | BK-2865, BK-2912 | 1, 1 |
| শুকনো ফুল রঙিন ফুল | মুহম্মদ জাফর ইকবাল | BK-0137, BK-0357 | 1, 1 |
| শূন্য | হুমায়ূন আহমেদ | BK-0031, BK-0331 | 1, 1 |
| শেষের কবিতা | রবীন্দ্রনাথ ঠাকুর | BK-2375, BK-2591 | 1, 1 |
| শ্রেষ্ঠ উপন্যাস সমগ্র | রবীন্দ্রনাথ ঠাকুর | BK-2750, BK-2751 | 1, 1 |
| সবুজ ভেলভেট | মুহম্মদ জাফর ইকবাল | BK-0136, BK-0464 | 1, 1 |
| সাজঘর | হুমায়ূন আহমেদ | BK-0032, BK-0324 | 1, 1 |
| সাদাসিধে কথা | মুহম্মদ জাফর ইকবাল | BK-0358, BK-0466 | 1, 1 |
| সিলেটে বঙ্গবন্ধু | সৈয়দ আব্দুল্লাহ | BK-0147, BK-0866 | 1, 1 |
| সূর্যের দিন | হুমায়ূন আহমেদ | BK-0004, BK-0329 | 1, 1 |
| সে আসে ধীরে | হুমায়ূন আহমেদ | BK-0038, BK-0236 | 1, 1 |
| সে ও নর্তকী | হুমায়ূন আহমেদ | BK-0083, BK-0209 | 1, 1 |
| সেদিন চৈত্রমাস | হুমায়ূন আহমেদ | BK-0005, BK-0208 | 1, 1 |
| সোনার হরিণ চাই | সানাউল্লাহ নূরী | BK-0727, BK-2268 | 1, 1 |
| হরতন ইশকাপন | হুমায়ূন আহমেদ | BK-0049, BK-0918 | 1, 1 |
| হলুদ হিমু কালো র‌্যাব | হুমায়ূন আহমেদ | BK-0052, BK-0230 | 1, 1 |
| হিমু | হুমায়ূন আহমেদ | BK-0027, BK-0315 | 1, 1 |
| হিমু এবং হার্ভার্ড Ph. D. বল্টুভাই | হুমায়ূন আহমেদ | BK-0051, BK-0231 | 1, 1 |
| হিমু রিমান্ডে | হুমায়ূন আহমেদ | BK-0006, BK-0313 | 1, 1 |
| হিমুর নীল জোছনা | হুমায়ূন আহমেদ | BK-0001, BK-0264 | 1, 1 |
| হিমুর মধ্যদুপুর | হুমায়ূন আহমেদ | BK-0017, BK-0314 | 1, 1 |
| হিমুর হাতে কয়েকটি নীলপদ্ম | হুমায়ূন আহমেদ | BK-0003, BK-0260 | 1, 1 |
| হ্যারি পটার অ্যান্ড দ্য হাফ-ব্লাড প্রিন্স | জে. কে. রাওলিং | BK-1254, BK-1517 | 1, 1 |
