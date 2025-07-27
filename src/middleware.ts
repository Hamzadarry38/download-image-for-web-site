import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /ar, /en, /fr)
  const pathname = request.nextUrl.pathname;
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = ['/ar', '/en', '/fr'].every(
    (locale) => !pathname.startsWith(locale)
  );

  // If there's no locale in the pathname and it's the root path
  if (pathnameIsMissingLocale && pathname === '/') {
    // Get the user's preferred language from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    
    // Determine the best matching language
    let locale = 'ar'; // Default to Arabic
    
    if (acceptLanguage.includes('fr')) {
      locale = 'fr';
    } else if (acceptLanguage.includes('en')) {
      locale = 'en';
    } else if (acceptLanguage.includes('ar')) {
      locale = 'ar';
    }
    
    // Also check for country-specific locales
    if (acceptLanguage.includes('fr-FR') || acceptLanguage.includes('fr-CA')) {
      locale = 'fr';
    } else if (acceptLanguage.includes('en-US') || acceptLanguage.includes('en-GB')) {
      locale = 'en';
    } else if (acceptLanguage.includes('ar-SA') || acceptLanguage.includes('ar-EG')) {
      locale = 'ar';
    }

    // Redirect to the appropriate language version
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // For all other requests, continue normally
  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)']
};
