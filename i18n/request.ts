import { getRequestConfig } from "next-intl/server";
import fs from "fs";
import path from "path";

export default getRequestConfig(async ({ requestLocale }) => {
  const locales = ["en", "ar"];
  let resolvedLocale;
  if (
    typeof requestLocale === "object" &&
    typeof requestLocale.then === "function"
  ) {
    const awaited = await requestLocale;
    resolvedLocale = typeof awaited === "string" ? awaited : undefined;
  } else {
    resolvedLocale =
      typeof requestLocale === "string" ? requestLocale : undefined;
  }
  const locale =
    resolvedLocale && locales.includes(resolvedLocale) ? resolvedLocale : "en";

  // Dynamically load all JSON files in the locale directory as namespaces
  const localeDir = path.join(process.cwd(), "app", "locales", locale);
  let messages: Record<string, any> = {};
  try {
    const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const ns = path.basename(file, ".json");
      const content = JSON.parse(
        fs.readFileSync(path.join(localeDir, file), "utf-8"),
      );
      messages[ns] = content;
    }
  } catch (err) {
    // fallback to empty messages
    messages = {};
  }
  return {
    locale,
    messages,
    timeZone: "UTC",
  };
});
