"use client";

import { createContext, useContext, useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Locale, LOCALES, isLocale } from "@/lib/types";
import { translate, UIKey } from "@/lib/i18n";

const STORAGE_KEY = "wtb.locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Chaîne d'interface dans la langue courante. */
  t: (key: UIKey) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "fr",
  setLocale: () => {},
  t: (key) => translate("fr", key),
});

export function useLocale() {
  return useContext(LocaleContext);
}

/**
 * Langue choisie une fois pour tout le blog.
 *
 * Priorité : ?lang= dans l'URL (un lien partagé impose sa langue) > choix mémorisé >
 * langue du navigateur si on la sert > français.
 *
 * Le site est un export statique : il n'y a ni middleware ni négociation de contenu
 * côté serveur. La résolution se fait donc au premier rendu client, et le français
 * reste la valeur initiale pour que le HTML pré-rendu et la première passe React
 * concordent — sinon React signale une divergence d'hydratation.
 */
function LocaleProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const urlLang = searchParams.get("lang");
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    if (isLocale(urlLang)) {
      setLocaleState(urlLang);
      try {
        localStorage.setItem(STORAGE_KEY, urlLang);
      } catch {
        // navigation privée ou stockage bloqué : le choix ne survivra pas à la session
      }
      return;
    }
    let next: Locale = "fr";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLocale(saved)) next = saved;
      else {
        const nav = navigator.language?.slice(0, 2);
        if (isLocale(nav)) next = nav;
      }
    } catch {
      // idem : on reste en français
    }
    setLocaleState(next);
  }, [urlLang]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    if (!LOCALES.includes(l)) return;
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // sans stockage, le choix vaut pour la page courante
    }
    // On reflète le choix dans l'URL sans recharger : le lien reste partageable
    // et l'historique ne se remplit pas d'entrées inutiles.
    const url = new URL(window.location.href);
    if (l === "fr") url.searchParams.delete("lang");
    else url.searchParams.set("lang", l);
    window.history.replaceState({}, "", url.toString());
  }, []);

  const t = useCallback((key: UIKey) => translate(locale, key), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  );
}

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  // useSearchParams impose une frontière Suspense dans un export statique.
  return (
    <Suspense fallback={<LocaleContext.Provider value={{ locale: "fr", setLocale: () => {}, t: (k) => translate("fr", k) }}>{children}</LocaleContext.Provider>}>
      <LocaleProviderInner>{children}</LocaleProviderInner>
    </Suspense>
  );
}
