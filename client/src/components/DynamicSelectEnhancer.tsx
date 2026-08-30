import { useEffect, useRef, type RefObject } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SearchableSelect, type SelectOption } from './SearchableSelect';

type Mount = { root: Root; host: HTMLDivElement; select: HTMLSelectElement };

function readOptions(select: HTMLSelectElement): SelectOption[] {
  return Array.from(select.options).map((opt) => ({
    value: opt.value,
    label: opt.textContent?.trim() || opt.value,
    disabled: opt.disabled,
  }));
}

function shouldEnhance(select: HTMLSelectElement) {
  if (select.dataset.searchable === 'false') return false;
  if (select.multiple) return false;
  if (select.dataset.searchableEnhanced === 'true') return false;
  return true;
}

function enhanceSelect(select: HTMLSelectElement): Mount {
  select.dataset.searchableEnhanced = 'true';
  select.classList.add('sr-only');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  const host = document.createElement('div');
  host.className = 'dynamic-searchable-select';
  select.insertAdjacentElement('afterend', host);

  const root = createRoot(host);

  const render = () => {
    const options = readOptions(select);
    root.render(
      <SearchableSelect
        value={select.value}
        onChange={(value) => {
          select.value = value;
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
          render();
        }}
        options={options}
        placeholder={select.getAttribute('data-placeholder') || undefined}
        searchPlaceholder={select.getAttribute('data-search-placeholder') || 'Type to search...'}
        disabled={select.disabled}
        required={select.required}
        name={select.name || undefined}
        className={select.getAttribute('data-select-class') || 'w-full'}
      />
    );
  };

  render();

  const observer = new MutationObserver(() => render());
  observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['value', 'disabled'] });

  (select as HTMLSelectElement & { __ssObserver?: MutationObserver }).__ssObserver = observer;

  return { root, host, select };
}

function cleanup(mount: Mount) {
  const obs = (mount.select as HTMLSelectElement & { __ssObserver?: MutationObserver }).__ssObserver;
  obs?.disconnect();
  mount.root.unmount();
  mount.host.remove();
  mount.select.classList.remove('sr-only');
  mount.select.tabIndex = 0;
  mount.select.removeAttribute('aria-hidden');
  delete mount.select.dataset.searchableEnhanced;
}

/**
 * Layout-level enhancer: upgrades native <select> elements to searchable Select2-style dropdowns.
 * Works with React controlled selects via dispatched change events.
 */
export function DynamicSelectEnhancer({ scope }: { scope: RefObject<HTMLElement | null> }) {
  const mountsRef = useRef<Map<HTMLSelectElement, Mount>>(new Map());

  useEffect(() => {
    const scopeEl = scope.current;
    if (!scopeEl) return;

    function scan() {
      const mounts = mountsRef.current;
      const live = new Set<HTMLSelectElement>();

      scopeEl!.querySelectorAll('select').forEach((node) => {
        const select = node as HTMLSelectElement;
        if (!shouldEnhance(select)) return;
        live.add(select);
        if (!mounts.has(select)) {
          mounts.set(select, enhanceSelect(select));
        }
      });

      mounts.forEach((mount, select) => {
        if (!live.has(select) || !scopeEl!.contains(select)) {
          cleanup(mount);
          mounts.delete(select);
        }
      });
    }

    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(scopeEl, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      mountsRef.current.forEach((mount) => cleanup(mount));
      mountsRef.current.clear();
    };
  }, [scope]);

  return null;
}
