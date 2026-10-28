import { useMemo } from "react";
import { ACTIONS } from "../../../../data/actionsCatalog";
import { getTabById } from "../../../../data/spellbookTabs";
import { SPELLBOOK_TABS, SPELLBOOK_TIER_ORDER } from "./spellbookConfig";

export const useSpellbookData = ({ activeSpellbookTab, preparedSpellIds }) => {
  const spellbookActions = useMemo(
    () =>
      ACTIONS.filter(
        (action) =>
          action.category === "paladin" ||
          (typeof action.iconKey === "string" &&
            action.iconKey.startsWith("spells/")),
      ),
    [],
  );

  const spellbookActionsByTab = useMemo(() => {
    const map = {};

    SPELLBOOK_TABS.forEach((tab) => {
      map[tab.id] = tab.getItems(spellbookActions);
    });

    return map;
  }, [spellbookActions]);

  const activeSpellbookActions = useMemo(
    () =>
      spellbookActionsByTab[activeSpellbookTab] ??
      spellbookActionsByTab.paladin ??
      [],
    [spellbookActionsByTab, activeSpellbookTab],
  );

  const spellbookActionRows = useMemo(() => {
    const classActions = activeSpellbookActions.filter(
      (action) => action.kind === "action",
    );
    const spellActions = activeSpellbookActions.filter(
      (action) => action.kind !== "action",
    );
    const preparedActions = activeSpellbookActions.slice(0, 18);
    const tierRows = SPELLBOOK_TIER_ORDER.map((tierId) => ({
      tierId,
      actions: activeSpellbookActions.filter(
        (action) => action.tier === tierId,
      ),
    })).filter((row) => row.actions.length > 0);

    return {
      classActions,
      spellActions,
      preparedActions,
      tierRows,
    };
  }, [activeSpellbookActions]);

  const activeSpellbookConfig = useMemo(
    () => getTabById(activeSpellbookTab),
    [activeSpellbookTab],
  );

  const spellbookSectionItems = useMemo(() => {
    if (!activeSpellbookConfig) {
      return {};
    }

    const classActions = ACTIONS.filter(
      (action) => action.class === activeSpellbookConfig.id,
    );
    const map = {};

    activeSpellbookConfig.sections.forEach((section) => {
      if (section.source === "prepared") {
        const preparedIds = preparedSpellIds[activeSpellbookConfig.id] ?? [];
        const actionsById = new Map(
          classActions
            .filter((action) => action.spellbookRow !== "class-action")
            .map((action) => [action.id, action]),
        );
        map[section.id] = preparedIds
          .map((actionId) => actionsById.get(actionId))
          .filter(Boolean);
        return;
      }

      if (section.source === "metamagic") {
        map[section.id] = [];
        return;
      }

      const allowedRowKeys = Array.isArray(section.rowKeys)
        ? section.rowKeys
        : section.rowKey
          ? [section.rowKey]
          : [];

      map[section.id] = classActions.filter((action) =>
        allowedRowKeys.includes(action.spellbookRow),
      );
    });

    return map;
  }, [activeSpellbookConfig, preparedSpellIds]);

  return {
    spellbookActionsByTab,
    spellbookActionRows,
    activeSpellbookConfig,
    spellbookSectionItems,
  };
};
