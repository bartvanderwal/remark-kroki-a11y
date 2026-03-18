/**
 * Domain Story (PlantUML macro) Parser
 *
 * Parses DomainStory-PlantUML macro syntax and generates an ordered
 * natural-language activity list.
 */

const i18n = {
  nl: {
    title: 'Domeinverhaal',
    withActivities: 'met {count} activiteiten',
    activities: 'Activiteiten',
  },
  en: {
    title: 'Domain story',
    withActivities: 'with {count} activities',
    activities: 'Activities',
  }
};

function stripQuotes(value) {
  const trimmed = String(value || '').trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function splitArgs(rawArgs) {
  const args = [];
  let current = '';
  let quote = null;

  for (let i = 0; i < rawArgs.length; i += 1) {
    const ch = rawArgs[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      }
      current += ch;
      continue;
    }
    if (ch === '"' || ch === '\'') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === ',') {
      args.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }

  if (current.trim() !== '') {
    args.push(current.trim());
  }
  return args;
}

function parseObjectToken(rawObject, aliases) {
  const token = stripQuotes(rawObject);
  if (!token || token === '_') return '';

  const colonIndex = token.indexOf(':');
  if (colonIndex >= 0) {
    const right = token.slice(colonIndex + 1).trim();
    if (!right) return '';
    return aliases.get(right) || right;
  }

  return aliases.get(token) || token;
}

function parseActorToken(rawActor, aliases) {
  const token = stripQuotes(rawActor);
  if (!token || token === '_') return '';
  return aliases.get(token) || token;
}

function parseDomainStory(code) {
  const lines = code.split('\n');
  const aliases = new Map();
  const activities = [];

  const elementRegex = /^\s*(Person|Group|System|Document|Folder|Call|Email|Conversation|Info)\s*\((.+)\)\s*$/;
  const activityRegex = /^\s*activity\s*\((.+)\)\s*$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('@') || trimmed.startsWith('!') || trimmed.startsWith('\'')) {
      continue;
    }

    const elementMatch = trimmed.match(elementRegex);
    if (elementMatch) {
      const args = splitArgs(elementMatch[2]);
      if (args.length >= 1) {
        const id = stripQuotes(args[0]);
        const label = args.length >= 2 ? stripQuotes(args[1]) : id;
        if (id) aliases.set(id, label || id);
      }
      continue;
    }

    const activityMatch = trimmed.match(activityRegex);
    if (!activityMatch) continue;

    const args = splitArgs(activityMatch[1]);
    if (args.length < 4) continue;

    const stepRaw = stripQuotes(args[0]);
    const subject = parseActorToken(args[1], aliases);
    const predicate = stripQuotes(args[2]);
    const object = parseObjectToken(args[3], aliases);
    const post = args.length >= 5 ? stripQuotes(args[4]) : '';
    const target = args.length >= 6 ? parseActorToken(args[5], aliases) : '';

    activities.push({
      step: stepRaw,
      subject,
      predicate,
      object,
      post,
      target,
    });
  }

  return { activities };
}

function buildSentence(activity, index) {
  const number = activity.step && activity.step !== '_' && activity.step !== '.'
    ? activity.step
    : String(index + 1);

  const parts = [
    activity.subject,
    activity.predicate,
    activity.object,
  ].filter(Boolean);

  if (activity.post && activity.post !== '_' && activity.target) {
    parts.push(activity.post, activity.target);
  } else if (activity.target) {
    parts.push(activity.target);
  }

  const sentence = parts.join(' ').replace(/\s+/g, ' ').trim();
  return `${number}. ${sentence}.`;
}

function generateAccessibleDescription(parsed, locale = 'nl') {
  const t = i18n[locale] || i18n.nl;
  const count = parsed.activities.length;
  const lines = [];

  lines.push(`${t.title} ${t.withActivities.replace('{count}', count)}.`);

  if (count > 0) {
    lines.push('');
    lines.push(`${t.activities}:`);
    parsed.activities.forEach((activity, index) => {
      lines.push(buildSentence(activity, index));
    });
  }

  return lines.join('\n');
}

module.exports = {
  parseDomainStory,
  generateAccessibleDescription,
  i18n,
};
