import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link/router — respects routing.localePrefix ("as-needed"),
// so linking to the default locale (en) never emits a "/en" prefix while
// "/ar/..." is kept for the other locale. Use these instead of next/link's
// Link + manual `/${locale}/path` string-building.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
