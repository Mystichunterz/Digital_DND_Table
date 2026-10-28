import { useMemo } from "react";
import { ACTION_LIBRARY } from "../../../../data/actionsCatalog";
import { SECTION_CONFIG, SECTION_IDS } from "./sectionLayout";

const FILTER_KIND_TABS = ["action", "bonus", "reaction", "utility"];

export const useActionsCatalog = (activeFilter) => {
  const actionsBySection = useMemo(() => {
    const map = {};

    SECTION_CONFIG.forEach((section) => {
      map[section.id] = ACTION_LIBRARY[section.categoryId] ?? [];
    });

    return map;
  }, []);

  const actionBySection = useMemo(() => {
    const map = {};

    SECTION_IDS.forEach((sectionId) => {
      const actions = actionsBySection[sectionId] ?? [];
      map[sectionId] = Object.fromEntries(
        actions.map((item) => [item.id, item]),
      );
    });

    return map;
  }, [actionsBySection]);

  const filteredActionIdsBySection = useMemo(() => {
    const map = {};

    SECTION_IDS.forEach((sectionId) => {
      const actions = actionsBySection[sectionId] ?? [];
      let filteredActions = actions;

      if (activeFilter !== "all") {
        filteredActions = FILTER_KIND_TABS.includes(activeFilter)
          ? actions.filter((item) => item.kind === activeFilter)
          : actions.filter((item) => item.tier === activeFilter);
      }

      map[sectionId] = new Set(filteredActions.map((item) => item.id));
    });

    return map;
  }, [actionsBySection, activeFilter]);

  return { actionBySection, filteredActionIdsBySection };
};
