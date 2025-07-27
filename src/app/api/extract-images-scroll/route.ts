import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url, scrollAttempts = 3, waitBetweenScrolls = 2000 } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let targetUrl: string;
    try {
      const urlObj = new URL(url);
      targetUrl = urlObj.href;
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const images: Array<{
      src: string;
      alt: string;
      type: string;
      source: string;
      attempt: number;
    }> = [];

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif', 'tiff', 'tif'];
    const baseUrl = new URL(targetUrl);

    const processImageUrl = (src: string, alt: string = '', source: string = 'unknown', attempt: number = 0) => {
      if (!src || src.startsWith('data:') || src.length < 4) return;
      
      try {
        let fullUrl: string;
        if (src.startsWith('//')) {
          fullUrl = `${baseUrl.protocol}${src}`;
        } else if (src.startsWith('/')) {
          fullUrl = `${baseUrl.protocol}//${baseUrl.host}${src}`;
        } else if (src.startsWith('http')) {
          fullUrl = src;
        } else {
          fullUrl = new URL(src, targetUrl).href;
        }

        const urlObj = new URL(fullUrl);
        const pathname = urlObj.pathname;
        const extension = pathname.split('.').pop()?.toLowerCase().split('?')[0] || '';
        
        const hasImagePattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff|tif)(\?|$|#)/i.test(fullUrl) ||
                               imageExtensions.includes(extension) ||
                               /\/image\//i.test(fullUrl) ||
                               /\/img\//i.test(fullUrl) ||
                               /\/photos?\//i.test(fullUrl) ||
                               /\/pictures?\//i.test(fullUrl) ||
                               /\/media\//i.test(fullUrl) ||
                               /\/assets\//i.test(fullUrl) ||
                               /\/uploads?\//i.test(fullUrl);
        
        if (hasImagePattern || imageExtensions.includes(extension)) {
          const exists = images.some(img => img.src === fullUrl);
          if (!exists) {
            images.push({
              src: fullUrl,
              alt: alt || 'Image',
              type: extension || 'unknown',
              source: source,
              attempt: attempt
            });
          }
        }
      } catch (error) {
        console.error('Error processing image URL:', src, error);
      }
    };

    // Enhanced fetch function that simulates multiple page loads
    const fetchWithScrollSimulation = async (attempt: number = 0): Promise<void> => {
      try {
        // Add different headers to simulate different scroll positions
        const headers: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': attempt === 0 ? 'no-cache' : 'max-age=0',
          'Pragma': attempt === 0 ? 'no-cache' : 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1'
        };

        // Add viewport simulation
        if (attempt > 0) {
          headers['Viewport-Width'] = '1920';
          headers['Viewport-Height'] = '1080';
        }

        const response = await fetch(targetUrl, { headers });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Comprehensive image extraction
        const extractImages = () => {
          // 1. Standard img tags with all possible lazy loading attributes
          $('img').each((_, element) => {
            const $img = $(element);
            const lazyAttributes = [
              'src', 'data-src', 'data-lazy-src', 'data-original', 'data-srcset', 
              'data-lazy', 'data-echo', 'data-img', 'data-lazy-img', 'data-defer-src',
              'data-actual', 'data-hi-res-src', 'data-low-res-src', 'data-medium-res-src',
              'data-retina-src', 'data-2x', 'data-1x', 'data-mobile-src', 'data-desktop-src',
              'data-tablet-src', 'data-phone-src', 'data-full-src', 'data-thumb-src',
              'data-preview-src', 'data-zoom-src', 'data-large-src', 'data-small-src'
            ];
            
            lazyAttributes.forEach(attr => {
              const value = $img.attr(attr);
              if (value) {
                if (attr.includes('srcset')) {
                  const srcsetUrls = value.split(',').map(s => s.trim().split(' ')[0]);
                  srcsetUrls.forEach(url => processImageUrl(url, $img.attr('alt') || '', `img-${attr}`, attempt));
                } else {
                  processImageUrl(value, $img.attr('alt') || '', `img-${attr}`, attempt);
                }
              }
            });
          });

          // 2. Background images in all elements
          $('*').each((_, element) => {
            const $el = $(element);
            const style = $el.attr('style');
            if (style && (style.includes('background') || style.includes('url('))) {
              const urlMatches = style.match(/url\s*\(['"]?([^'")]+)['"]?\)/gi);
              if (urlMatches) {
                urlMatches.forEach(match => {
                  const urlMatch = match.match(/url\s*\(['"]?([^'")]+)['"]?\)/);
                  if (urlMatch && urlMatch[1]) {
                    processImageUrl(urlMatch[1], 'Background Image', 'style-background', attempt);
                  }
                });
              }
            }

            // Check data attributes for background images
            const $element = $(element);
            const attrs: Record<string, string> = {};
            if ($element.get(0)) {
              const node = $element.get(0) as { attribs?: Record<string, string> };
              if (node.attribs) {
                Object.assign(attrs, node.attribs);
              }
            }
            Object.keys(attrs).forEach(attr => {
              if (attr.startsWith('data-') && attrs[attr]) {
                const value = attrs[attr];
                if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)($|\?|#)/i.test(value) ||
                    value.includes('/image/') || value.includes('/img/') || value.includes('/photo/')) {
                  processImageUrl(value, `Data: ${attr}`, `data-${attr}`, attempt);
                }
              }
            });
          });

          // 3. CSS in style tags
          $('style').each((_, element) => {
            const styleContent = $(element).html();
            if (styleContent) {
              const cssImagePatterns = [
                /background-image\s*:\s*url\s*\(['"]?([^'")]+)['"]?\)/gi,
                /background\s*:\s*[^;{}]*url\s*\(['"]?([^'")]+)['"]?\)/gi,
                /content\s*:\s*url\s*\(['"]?([^'")]+)['"]?\)/gi,
                /@media[^{]*\{[^{}]*background[^{}]*url\s*\(['"]?([^'")]+)['"]?\)[^{}]*\}/gi
              ];
              
              cssImagePatterns.forEach(pattern => {
                const matches = styleContent.match(pattern);
                if (matches) {
                  matches.forEach(match => {
                    const urlMatch = match.match(/url\s*\(['"]?([^'")]+)['"]?\)/);
                    if (urlMatch && urlMatch[1]) {
                      processImageUrl(urlMatch[1], 'CSS Image', 'css-style', attempt);
                    }
                  });
                }
              });
            }
          });

          // 4. JavaScript content - enhanced patterns
          $('script').each((_, element) => {
            const scriptContent = $(element).html();
            if (scriptContent) {
              const jsImagePatterns = [
                // Standard quoted URLs
                /['"]([^'"]*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^'"]*)['"](?!\s*:)/gi,
                // Object properties
                /(?:src|image|img|photo|picture|thumbnail|avatar|banner|logo|background)\s*[=:]\s*['"]([^'"]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^'"]*)['"](?!\s*:)/gi,
                // Array elements
                /\[\s*['"]([^'"]*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^'"]*)['"]\s*\]/gi,
                // URL constructors
                /new\s+URL\s*\(\s*['"]([^'"]*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^'"]*)['"](?!\s*:)/gi,
                // Template literals
                /`([^`]*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)[^`]*)`/gi
              ];
              
              jsImagePatterns.forEach(pattern => {
                const matches = scriptContent.match(pattern);
                if (matches) {
                  matches.forEach(match => {
                    const urlMatch = match.match(/['"`]([^'"`]+)['"`]/);
                    if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:')) {
                      processImageUrl(urlMatch[1], 'Script Image', 'javascript', attempt);
                    }
                  });
                }
              });
            }
          });

          // 5. Picture and source elements
          $('picture source, source').each((_, element) => {
            const $source = $(element);
            ['srcset', 'src', 'data-srcset', 'data-src'].forEach(attr => {
              const value = $source.attr(attr);
              if (value) {
                if (attr.includes('srcset')) {
                  const srcsetUrls = value.split(',').map(s => s.trim().split(' ')[0]);
                  srcsetUrls.forEach(url => processImageUrl(url, 'Picture Source', `picture-${attr}`, attempt));
                } else {
                  processImageUrl(value, 'Picture Source', `picture-${attr}`, attempt);
                }
              }
            });
          });

          // 6. Video posters
          $('video').each((_, element) => {
            const $video = $(element);
            ['poster', 'data-poster'].forEach(attr => {
              const value = $video.attr(attr);
              if (value) {
                processImageUrl(value, 'Video Poster', `video-${attr}`, attempt);
              }
            });
          });

          // 7. Meta tags
          $('meta[property*="image"], meta[name*="image"], meta[itemprop*="image"]').each((_, element) => {
            const content = $(element).attr('content');
            if (content) {
              processImageUrl(content, 'Meta Image', 'meta-tag', attempt);
            }
          });

          // 8. Link icons
          $('link[rel*="icon"], link[rel*="apple-touch-icon"]').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
              processImageUrl(href, 'Icon', 'link-icon', attempt);
            }
          });

          // 9. Noscript fallbacks
          $('noscript').each((_, element) => {
            const noscriptContent = $(element).html();
            if (noscriptContent) {
              const $noscript = cheerio.load(noscriptContent);
              $noscript('img').each((_, img) => {
                const src = $noscript(img).attr('src');
                if (src) {
                  processImageUrl(src, $noscript(img).attr('alt') || 'Noscript Image', 'noscript', attempt);
                }
              });
            }
          });
        };

        extractImages();

      } catch (error) {
        console.error(`Error in fetch attempt ${attempt}:`, error);
      }
    };

    // Perform multiple fetch attempts to simulate scrolling
    for (let i = 0; i < scrollAttempts; i++) {
      await fetchWithScrollSimulation(i);
      
      // Wait between attempts to simulate scroll delay
      if (i < scrollAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, waitBetweenScrolls));
      }
    }

    // Group images by attempt to show scroll simulation results
    const attemptStats = images.reduce((acc: Record<number, number>, img) => {
      acc[img.attempt] = (acc[img.attempt] || 0) + 1;
      return acc;
    }, {});

    // Group by source
    const sourceStats = images.reduce((acc: Record<string, number>, img) => {
      acc[img.source] = (acc[img.source] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ 
      images: images,
      total: images.length,
      url: targetUrl,
      scrollAttempts: scrollAttempts,
      waitBetweenScrolls: waitBetweenScrolls,
      attemptStats: attemptStats,
      sourceStats: sourceStats
    });

  } catch (error) {
    console.error('Error extracting images:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: 'Failed to extract images from the provided URL'
    }, { status: 500 });
  }
}
