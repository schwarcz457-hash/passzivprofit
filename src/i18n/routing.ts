import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'hu', 'de', 'fr', 'ro', 'es', 'it', 'sk', 'pl'],
  defaultLocale: 'hu'
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
