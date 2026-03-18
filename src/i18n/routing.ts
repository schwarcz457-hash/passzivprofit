import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['hu', 'en', 'de', 'fr', 'ro', 'es', 'it', 'sk', 'pl'],
  defaultLocale: 'hu',
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/gold': '/gold',
    '/privacy': '/privacy',
    '/details': '/details'
  }
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
