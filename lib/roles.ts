export type Permission = "galerie" | "shop" | "blog" | "texte" | "benutzer" | "newsletter";

export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  const roles = role.split(",").map((r) => r.trim());
  if (permission === "benutzer") return false; // only admin
  if (permission === "newsletter") return false; // only admin
  return roles.includes(permission);
}

export function getAllowedTabs(role: string | undefined): Permission[] {
  if (!role) return [];
  if (role === "admin") return ["galerie", "shop", "blog", "texte", "benutzer", "newsletter"];
  return (role.split(",").map((r) => r.trim()) as Permission[]).filter(
    (r): r is Permission => ["galerie", "shop", "blog", "texte"].includes(r)
  );
}

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin (Vollzugriff)" },
  { value: "blog", label: "Blog" },
  { value: "shop", label: "Shop" },
  { value: "galerie", label: "Galerie" },
  { value: "blog,shop", label: "Blog + Shop" },
  { value: "blog,galerie", label: "Blog + Galerie" },
  { value: "shop,galerie", label: "Shop + Galerie" },
  { value: "blog,shop,galerie", label: "Blog + Shop + Galerie" },
  { value: "blog,shop,galerie,texte", label: "Alles außer Benutzerverwaltung" },
];
