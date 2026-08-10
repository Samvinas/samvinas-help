/*
 * tabs.js — progressive enhancement for the tool-page tabs build.js emits.
 *
 * Static form: a [data-tabs] div holding .tab-panel sections, each headed by
 * its own h2 (Samvinas / Paper and pen / When & why). Without this script the
 * page is those sections stacked — complete and readable. With it, the group
 * becomes a WAI-ARIA tablist (APG pattern, automatic activation):
 *
 *   - one tab per panel, labelled from the panel's h2 (which is then
 *     visually hidden — the tab replaces it on screen, the heading stays in
 *     the accessibility tree for document structure)
 *   - Left/Right arrows move and activate (wrapping); Home/End jump
 *   - a URL hash naming a panel's h2 (#paper-and-pen) opens that tab, so
 *     section-rail links and shared deep links land on the right panel
 *
 * Print is handled in CSS: all panels render, tabs hidden.
 */
(function () {
  'use strict';
  document.querySelectorAll('[data-tabs]').forEach(init);

  function init(root) {
    var panels = [].slice.call(root.querySelectorAll(':scope > .tab-panel'));
    if (panels.length < 2) return;

    var list = document.createElement('div');
    list.className = 'tablist';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Ways to use this tool');

    var tabs = panels.map(function (panel, i) {
      var h = panel.querySelector('h2');
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.id = 'tab-' + (h ? h.id : panel.id);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      tab.textContent = h ? h.textContent : 'Section ' + (i + 1);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      if (h) h.classList.add('visually-hidden');
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (e) { onKey(e, i); });
      list.appendChild(tab);
      return tab;
    });

    root.insertBefore(list, root.firstChild);
    root.classList.add('tabs--ready');

    function select(i, focus) {
      tabs.forEach(function (tab, j) {
        var on = i === j;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }

    function onKey(e, i) {
      var n = tabs.length, to = null;
      if (e.key === 'ArrowRight') to = (i + 1) % n;
      else if (e.key === 'ArrowLeft') to = (i - 1 + n) % n;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = n - 1;
      if (to === null) return;
      e.preventDefault();
      select(to, true);
    }

    // #<h2-id> in the URL → that panel's tab. Runs at load and on hashchange
    // (the section rail's "on this page" links navigate by hash).
    function fromHash(focus) {
      var id = location.hash.slice(1);
      if (!id) return false;
      for (var i = 0; i < panels.length; i++) {
        var h = panels[i].querySelector('h2');
        if ((h && h.id === id) || panels[i].id === id ||
            panels[i].querySelector('[id="' + CSS.escape(id) + '"]')) {
          select(i, focus);
          list.scrollIntoView({ block: 'nearest' });
          return true;
        }
      }
      return false;
    }

    if (!fromHash(false)) select(0, false);
    window.addEventListener('hashchange', function () { fromHash(true); });
  }
})();
