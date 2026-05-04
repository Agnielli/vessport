import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('NEON_DATABASE_URL environment variable is required');
  process.exit(1);
}

const client = neon(DATABASE_URL);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseFrontmatter(content: string): { data: Record<string, any>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const frontmatter: Record<string, any> = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.+)/);
    if (kv) {
      const key = kv[1];
      let value = kv[2].trim();
      value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      frontmatter[key] = value;
    }
  }

  return { data: frontmatter, body: match[2].trim() };
}

async function main() {
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.md'));

  console.log(`Found ${files.length} markdown files to migrate.`);

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseFrontmatter(raw);

    const slug = slugify(parsed.data.title || file.replace('.md', ''));
    const title = parsed.data.title || '';
    const excerpt = parsed.data.excerpt || '';
    const date = parsed.data.date || '';
    const image = parsed.data.image || '';
    const category = parsed.data.category || 'Noticias';
    const author = parsed.data.author || 'Ves Sport';
    const readTime = parsed.data.readTime || '5 min';
    const featured = parsed.data.featured === 'true' || parsed.data.featured === true;
    const content = parsed.body;

    try {
      await client`
        INSERT INTO posts (slug, title, excerpt, date, image, category, author, read_time, featured, content)
        VALUES (${slug}, ${title}, ${excerpt}, ${date}, ${image}, ${category}, ${author}, ${readTime}, ${featured}, ${content})
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          date = EXCLUDED.date,
          image = EXCLUDED.image,
          category = EXCLUDED.category,
          author = EXCLUDED.author,
          read_time = EXCLUDED.read_time,
          featured = EXCLUDED.featured,
          content = EXCLUDED.content,
          updated_at = NOW()
      `;
      console.log(`  Migrated: ${title}`);
    } catch (err) {
      console.error(`  Failed: ${title}`, err);
    }
  }

  console.log('Seed complete!');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
