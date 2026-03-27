import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['hu', 'en', 'de', 'fr', 'ro', 'es', 'it', 'sk', 'pl'],
  defaultLocale: 'en',
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/gold': '/gold',
    '/privacy': {
      hu: '/adatvedelem',
      en: '/privacy-policy',
      de: '/datenschutz',
      fr: '/politique-de-confidentialite',
      ro: '/politica-de-confidentialitate',
      es: '/politica-de-privacidad',
      it: '/informativa-sulla-privacy',
      sk: '/zasady-ochrany-osobnych-udajov',
      pl: '/polityka-prywatnosci'
    },
    '/details': '/details',
    '/mobilpiac': '/mobilpiac'
  }
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
