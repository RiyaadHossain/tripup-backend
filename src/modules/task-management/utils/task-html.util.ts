import { BadRequestException } from '@nestjs/common';

export const ALLOWED_HTML_TAGS = new Set([
  'p', 'br', 'b', 'i', 'strong', 'em', 'strike', 's', 'u',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code', 'hr',
  'a', 'span',
]);

export interface ExtractedMention {
  userId: string;
  label: string;
}

/**
 * Validates a standard UUID string.
 */
export function isValidUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Escapes characters for HTML attributes.
 */
function escapeHtmlAttr(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sanitizes rich HTML content with a strict allowlist without any external dependencies.
 * Discards dangerous tags (script, style, iframe, etc.) and dangerous event handlers (onerror, onclick, etc.).
 * Preserves mention spans (<span data-type="mention" data-id="..." data-label="...">).
 */
export function sanitizeRichContent(rawHtml: string): string {
  if (!rawHtml) return '';

  // 1. Completely strip dangerous tags and any content inside them
  let cleaned = rawHtml.replace(
    /<(script|style|iframe|object|embed|applet|noscript|svg|form|input|button|textarea|select)\b[^>]*>[\s\S]*?<\/\1>/gi,
    '',
  );
  cleaned = cleaned.replace(
    /<(script|style|iframe|object|embed|applet|noscript|svg|form|input|button|textarea|select)\b[^>]*\/?>/gi,
    '',
  );

  // 2. Tokenize and filter all remaining tags
  const tagRegex = /<(\/)?([a-zA-Z0-9_-]+)((?:\s+[^>]*?)?)\s*(\/?)>/g;

  return cleaned.replace(tagRegex, (_match, isClosing, rawTagName, rawAttrs) => {
    const tagName = rawTagName.toLowerCase();

    // If tag is not in allowlist, discard the tag markup
    if (!ALLOWED_HTML_TAGS.has(tagName)) {
      return '';
    }

    if (isClosing) {
      return `</${tagName}>`;
    }

    if (tagName === 'br' || tagName === 'hr') {
      return `<${tagName} />`;
    }

    // Parse attributes
    const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attrMatch: RegExpExecArray | null;
    const allowedAttrs: string[] = [];
    let hrefVal: string | null = null;

    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue =
        attrMatch[2] !== undefined
          ? attrMatch[2]
          : attrMatch[3] !== undefined
          ? attrMatch[3]
          : attrMatch[4] || '';

      // Disallow all on* event handlers (e.g. onerror, onclick, onmouseover)
      if (attrName.startsWith('on')) continue;

      if (tagName === 'a') {
        if (attrName === 'href') {
          hrefVal = attrValue;
        } else if (attrName === 'name') {
          allowedAttrs.push(`name="${escapeHtmlAttr(attrValue)}"`);
        }
      } else if (tagName === 'span') {
        if (['data-type', 'data-id', 'data-label', 'class'].includes(attrName)) {
          allowedAttrs.push(`${attrName}="${escapeHtmlAttr(attrValue)}"`);
        }
      }
    }

    // Enforce safe link protocol and target/rel for anchors
    if (tagName === 'a') {
      if (hrefVal) {
        const cleanHref = hrefVal.trim();
        if (/^(https?:|mailto:|\/|#)/i.test(cleanHref) && !/^javascript:/i.test(cleanHref)) {
          allowedAttrs.push(`href="${escapeHtmlAttr(cleanHref)}"`);
          allowedAttrs.push('target="_blank"');
          allowedAttrs.push('rel="noopener noreferrer"');
        }
      }
    }

    const attrsString = allowedAttrs.length > 0 ? ' ' + allowedAttrs.join(' ') : '';
    return `<${tagName}${attrsString}>`;
  });
}

/**
 * Checks whether content contains visible characters or verified mentions.
 * Rejects empty tags like <p><br></p>, <p>&nbsp;</p>, etc.
 */
export function hasVisibleContent(htmlOrText: string): boolean {
  if (!htmlOrText || !htmlOrText.trim()) return false;
  const mentions = extractMentionsFromHtml(htmlOrText);
  if (mentions.length > 0) return true;

  const textOnly = htmlOrText
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return textOnly.length > 0;
}

/**
 * Extracts structured mention nodes from HTML (<span data-type="mention" data-id="..." data-label="...">).
 */
export function extractMentionsFromHtml(html: string): ExtractedMention[] {
  if (!html) return [];
  const mentions: ExtractedMention[] = [];
  const seenIds = new Set<string>();

  const regex = /<span\b[^>]*\bdata-type=["']mention["'][^>]*>(.*?)<\/span>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const fullTag = match[0];
    const innerText = match[1] ? match[1].replace(/<[^>]*>/g, '').trim() : '';

    const idMatch = /data-id=["']([^"']+)["']/i.exec(fullTag);
    const labelMatch = /data-label=["']([^"']+)["']/i.exec(fullTag);

    if (idMatch && idMatch[1]) {
      const userId = idMatch[1].trim();
      const label =
        (labelMatch && labelMatch[1] ? labelMatch[1].trim() : innerText.replace(/^@/, '')) || 'User';

      if (!seenIds.has(userId)) {
        seenIds.add(userId);
        mentions.push({ userId, label });
      }
    }
  }

  return mentions;
}

/**
 * Verifies that the declared `mentionedUserIds` strictly correspond to the structured HTML mention nodes.
 */
export function validateMentionCorrespondence(
  declaredIds: string[] | undefined,
  htmlMentions: ExtractedMention[],
): string[] {
  const nodeIds = htmlMentions.map((m) => m.userId);

  for (const id of nodeIds) {
    if (!isValidUuid(id)) {
      throw new BadRequestException(`Invalid mention target UUID: ${id}`);
    }
  }

  if (declaredIds !== undefined) {
    for (const id of declaredIds) {
      if (!isValidUuid(id)) {
        throw new BadRequestException(`Invalid mention target UUID: ${id}`);
      }
    }

    const declaredSet = new Set(declaredIds);
    const nodeSet = new Set(nodeIds);

    if (declaredSet.size !== nodeSet.size) {
      throw new BadRequestException(
        'Declared mentionedUserIds must match structured mention spans in content',
      );
    }

    for (const id of declaredSet) {
      if (!nodeSet.has(id)) {
        throw new BadRequestException(
          'Declared mentionedUserIds must match structured mention spans in content',
        );
      }
    }
  }

  return Array.from(new Set(nodeIds));
}
