import catalog from '../../../design-system/bootstrap-catalog.json' with { type: 'json' };

export const figmaUrl = catalog.figmaUrl;
const normalize = (value) => value.trim().toLowerCase();
const byKey = new Map(catalog.components.map((component) => [component.figmaKey, component]));
const byName = new Map(
  catalog.components.map((component) => [normalize(component.figmaName), component]),
);

/** Возвращает каноническую привязку по ключу опубликованного компонента или точному имени. */
export function resolveComponent(identifier) {
  const query = normalize(identifier);
  return byKey.get(query) ?? byName.get(query) ?? null;
}

/** Ищет по ключу, имени Figma, UI-роли и классу Bootstrap. */
export function searchComponents(query) {
  const phrase = normalize(query);
  return catalog.components.filter((component) =>
    [component.figmaKey, component.figmaName, component.role, component.implementation].some(
      (field) => field && normalize(field).includes(phrase),
    ),
  );
}
