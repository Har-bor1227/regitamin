export async function extractJsonLdFromUrl(wpUrl: string): Promise<object[]> {
  try {
    const res = await fetch(wpUrl);
    if (!res.ok) return [];
    const html = await res.text();
    const jsonLd: object[] = [];

    // استخراج تمام تگ‌های JSON‑LD
    const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed) jsonLd.push(parsed);
      } catch {}
    }
    return jsonLd;
  } catch {
    return [];
  }
}