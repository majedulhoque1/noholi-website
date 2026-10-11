// Fixed-geometry artwork (drawn book covers, the leaning-books illustration, the split
// "STORIES" headline…) is laid out with absolute positions straight from Figma, so it cannot
// reflow. Below the 1280px design each such box is scaled as a whole (CSS zoom) to fit:
//  - a lone box shrinks to its container's width;
//  - a wrapping row of 3+ such boxes (e.g. the featured book covers) shows two per line on phones.

const isArtBox = (el) => {
  const kids = el.children;
  return getComputedStyle(el).position === 'relative'
    && getComputedStyle(el).display !== 'flex'
    && kids.length > 0
    && [...kids].every((k) => getComputedStyle(k).position === 'absolute');
};

function naturalWidth(el) {
  if (!el.dataset.fitW) el.dataset.fitW = String(el.offsetWidth);
  return Number(el.dataset.fitW);
}

function contentWidth(el) {
  const cs = getComputedStyle(el);
  return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
}

const setZoom = (el, z) => { el.style.zoom = z < 0.999 ? String(Math.round(z * 1000) / 1000) : ''; };

export function fitBoxes(root = document.querySelector('main')) {
  if (!root) return;
  const vw = window.innerWidth;
  const handled = new Set();

  // wrapping rows of artwork cards: two per line on phones
  for (const row of root.querySelectorAll('*')) {
    const cs = getComputedStyle(row);
    if (cs.flexWrap !== 'wrap' || row.children.length < 3) continue;
    const cards = [...row.children];
    if (!cards.every(isArtBox)) continue;
    const gap = parseFloat(cs.columnGap) || 0;
    const perLine = vw < 600 ? 2 : 0;
    for (const c of cards) {
      handled.add(c);
      if (!perLine || vw >= 1280) { setZoom(c, 1); continue; }
      setZoom(c, Math.min(1, (contentWidth(row) - gap * (perLine - 1)) / perLine / naturalWidth(c)));
    }
  }

  // any other artwork box: shrink to fit its container
  for (const el of root.querySelectorAll('*')) {
    if (handled.has(el) || !isArtBox(el)) continue;
    if (vw >= 1280) { setZoom(el, 1); continue; }
    const avail = contentWidth(el.parentElement);
    const w = naturalWidth(el);
    setZoom(el, w > avail && avail > 0 ? avail / w : 1);
  }
}
