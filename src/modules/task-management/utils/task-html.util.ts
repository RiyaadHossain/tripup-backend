import sanitizeHtml from 'sanitize-html';
import { BadRequestException } from '@nestjs/common';

export const ALLOWED_HTML_TAGS = [
  'p', 'br', 'b', 'i', 'strong', 'em', 'strike', 's', 'u',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code', 'hr',
  'a', 'span',
];

export const ALLOWED_HTML_ATTRIBUTES = {
  a: ['href', 'name', 'target', 'rel'],
  span: ['data-type', 'data-id', 'data-label', 'class'],
};

export const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_HTML_TAGS,
  allowedAttributes: ALLOWED_HTML_ATTRIBUTES,
  allowedSchemes: ['http', 'https', 'mailto'],
  disallowedTagsMode: 'discard',
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      target: '_blank',
      rel: 'noopener noreferrer',
    }),
  },
};

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
 * Sanitizes rich HTML content with the strict allowlist, preserving mention spans.
 */
export function sanitizeRichContent(rawHtml: string): string {
  if (!rawHtml) return '';
  return sanitizeHtml(rawHtml, SANITIZE_OPTIONS);
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

  // Regex to match span tags with data-type="mention"
  const regex = /<span\b[^>]*\bdata-type=["']mention["'][^>]*>(.*?)<\/span>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const fullTag = match[0];
    const innerText = match[1] ? match[1].replace(/<[^>]*>/g, '').trim() : '';

    const idMatch = /data-id=["']([^"']+)["']/i.exec(fullTag);
    const labelMatch = /data-label=["']([^"']+)["']/i.exec(fullTag);

    if (idMatch && idMatch[1]) {
      const userId = idMatch[1].trim();
      const label = (labelMatch && labelMatch[1] ? labelMatch[1].trim() : innerText.replace(/^@/, '')) || 'User';

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

  // Validate UUID formats
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

    // Check if every declared ID exists in nodeSet and vice versa
    if (declaredSet.size !== nodeSet.size) {
      throw new BadRequestException('Declared mentionedUserIds must match structured mention spans in content');
    }

    for (const id of declaredSet) {
      if (!nodeSet.has(id)) {
        throw new BadRequestException('Declared mentionedUserIds must match structured mention spans in content');
      }
    }
  }

  // Deduplicate and return verified IDs
  return Array.from(new Set(nodeIds));
}
