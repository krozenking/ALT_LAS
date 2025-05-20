// ***********************************************************
// This example support/visual.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress for visual regression testing.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import '@percy/cypress';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add visual testing commands
Cypress.Commands.add('compareSnapshot', (name, options) => {
  cy.percySnapshot(name, options);
});

// Add command to compare snapshot for a specific route
Cypress.Commands.add('compareRouteSnapshot', (route, name, options) => {
  cy.visit(route);
  cy.compareSnapshot(name, options);
});

// Add command to compare snapshot for all routes
Cypress.Commands.add('compareAllRoutesSnapshot', (routes, options) => {
  routes.forEach((route) => {
    cy.compareRouteSnapshot(route.path, route.name, options);
  });
});

// Add command to compare snapshot for a specific component
Cypress.Commands.add('compareComponentSnapshot', (selector, name, options) => {
  cy.get(selector).should('exist');
  cy.compareSnapshot(name, options);
});

// Add command to compare snapshot for all components
Cypress.Commands.add('compareAllComponentsSnapshot', (components, options) => {
  components.forEach((component) => {
    cy.compareComponentSnapshot(component.selector, component.name, options);
  });
});

// Add command to compare snapshot for a specific page
Cypress.Commands.add('comparePageSnapshot', (name, options) => {
  cy.compareSnapshot(name, options);
});

// Add command to compare snapshot for all pages
Cypress.Commands.add('compareAllPagesSnapshot', (pages, options) => {
  pages.forEach((page) => {
    cy.visit(page.route);
    cy.comparePageSnapshot(page.name, options);
  });
});

// Add command to compare snapshot for a specific user flow
Cypress.Commands.add('compareUserFlowSnapshot', (flow, options) => {
  flow.steps.forEach((step, index) => {
    step.action();
    cy.compareSnapshot(`${flow.name}-step-${index + 1}`, options);
  });
});

// Add command to compare snapshot for all user flows
Cypress.Commands.add('compareAllUserFlowsSnapshot', (flows, options) => {
  flows.forEach((flow) => {
    cy.compareUserFlowSnapshot(flow, options);
  });
});

// Add command to compare snapshot for a specific state
Cypress.Commands.add('compareStateSnapshot', (state, options) => {
  state.setup();
  cy.compareSnapshot(state.name, options);
});

// Add command to compare snapshot for all states
Cypress.Commands.add('compareAllStatesSnapshot', (states, options) => {
  states.forEach((state) => {
    cy.compareStateSnapshot(state, options);
  });
});

// Add command to compare snapshot for a specific interaction
Cypress.Commands.add('compareInteractionSnapshot', (interaction, options) => {
  interaction.setup();
  cy.compareSnapshot(`${interaction.name}-before`, options);
  interaction.action();
  cy.compareSnapshot(`${interaction.name}-after`, options);
});

// Add command to compare snapshot for all interactions
Cypress.Commands.add('compareAllInteractionsSnapshot', (interactions, options) => {
  interactions.forEach((interaction) => {
    cy.compareInteractionSnapshot(interaction, options);
  });
});

// Add command to compare snapshot for a specific form
Cypress.Commands.add('compareFormSnapshot', (form, options) => {
  form.setup();
  cy.compareComponentSnapshot(form.selector, form.name, options);
});

// Add command to compare snapshot for all forms
Cypress.Commands.add('compareAllFormsSnapshot', (forms, options) => {
  forms.forEach((form) => {
    cy.compareFormSnapshot(form, options);
  });
});

// Add command to compare snapshot for a specific modal
Cypress.Commands.add('compareModalSnapshot', (modal, options) => {
  modal.open();
  cy.compareComponentSnapshot(modal.selector, modal.name, options);
  modal.close();
});

// Add command to compare snapshot for all modals
Cypress.Commands.add('compareAllModalsSnapshot', (modals, options) => {
  modals.forEach((modal) => {
    cy.compareModalSnapshot(modal, options);
  });
});

// Add command to compare snapshot for a specific notification
Cypress.Commands.add('compareNotificationSnapshot', (notification, options) => {
  notification.show();
  cy.compareComponentSnapshot(notification.selector, notification.name, options);
  notification.hide();
});

// Add command to compare snapshot for all notifications
Cypress.Commands.add('compareAllNotificationsSnapshot', (notifications, options) => {
  notifications.forEach((notification) => {
    cy.compareNotificationSnapshot(notification, options);
  });
});

// Add command to compare snapshot for a specific menu
Cypress.Commands.add('compareMenuSnapshot', (menu, options) => {
  menu.open();
  cy.compareComponentSnapshot(menu.selector, menu.name, options);
  menu.close();
});

// Add command to compare snapshot for all menus
Cypress.Commands.add('compareAllMenusSnapshot', (menus, options) => {
  menus.forEach((menu) => {
    cy.compareMenuSnapshot(menu, options);
  });
});

// Add command to compare snapshot for a specific dialog
Cypress.Commands.add('compareDialogSnapshot', (dialog, options) => {
  dialog.open();
  cy.compareComponentSnapshot(dialog.selector, dialog.name, options);
  dialog.close();
});

// Add command to compare snapshot for all dialogs
Cypress.Commands.add('compareAllDialogsSnapshot', (dialogs, options) => {
  dialogs.forEach((dialog) => {
    cy.compareDialogSnapshot(dialog, options);
  });
});

// Add command to compare snapshot for a specific tooltip
Cypress.Commands.add('compareTooltipSnapshot', (tooltip, options) => {
  tooltip.show();
  cy.compareComponentSnapshot(tooltip.selector, tooltip.name, options);
  tooltip.hide();
});

// Add command to compare snapshot for all tooltips
Cypress.Commands.add('compareAllTooltipsSnapshot', (tooltips, options) => {
  tooltips.forEach((tooltip) => {
    cy.compareTooltipSnapshot(tooltip, options);
  });
});

// Add command to compare snapshot for a specific popover
Cypress.Commands.add('comparePopoverSnapshot', (popover, options) => {
  popover.show();
  cy.compareComponentSnapshot(popover.selector, popover.name, options);
  popover.hide();
});

// Add command to compare snapshot for all popovers
Cypress.Commands.add('compareAllPopoversSnapshot', (popovers, options) => {
  popovers.forEach((popover) => {
    cy.comparePopoverSnapshot(popover, options);
  });
});

// Add command to compare snapshot for a specific drawer
Cypress.Commands.add('compareDrawerSnapshot', (drawer, options) => {
  drawer.open();
  cy.compareComponentSnapshot(drawer.selector, drawer.name, options);
  drawer.close();
});

// Add command to compare snapshot for all drawers
Cypress.Commands.add('compareAllDrawersSnapshot', (drawers, options) => {
  drawers.forEach((drawer) => {
    cy.compareDrawerSnapshot(drawer, options);
  });
});

// Add command to compare snapshot for a specific accordion
Cypress.Commands.add('compareAccordionSnapshot', (accordion, options) => {
  accordion.expand();
  cy.compareComponentSnapshot(accordion.selector, accordion.name, options);
  accordion.collapse();
});

// Add command to compare snapshot for all accordions
Cypress.Commands.add('compareAllAccordionsSnapshot', (accordions, options) => {
  accordions.forEach((accordion) => {
    cy.compareAccordionSnapshot(accordion, options);
  });
});

// Add command to compare snapshot for a specific tab
Cypress.Commands.add('compareTabSnapshot', (tab, options) => {
  tab.select();
  cy.compareComponentSnapshot(tab.selector, tab.name, options);
});

// Add command to compare snapshot for all tabs
Cypress.Commands.add('compareAllTabsSnapshot', (tabs, options) => {
  tabs.forEach((tab) => {
    cy.compareTabSnapshot(tab, options);
  });
});

// Add command to compare snapshot for a specific carousel
Cypress.Commands.add('compareCarouselSnapshot', (carousel, options) => {
  carousel.navigate();
  cy.compareComponentSnapshot(carousel.selector, carousel.name, options);
});

// Add command to compare snapshot for all carousels
Cypress.Commands.add('compareAllCarouselsSnapshot', (carousels, options) => {
  carousels.forEach((carousel) => {
    cy.compareCarouselSnapshot(carousel, options);
  });
});

// Add command to compare snapshot for a specific dropdown
Cypress.Commands.add('compareDropdownSnapshot', (dropdown, options) => {
  dropdown.open();
  cy.compareComponentSnapshot(dropdown.selector, dropdown.name, options);
  dropdown.close();
});

// Add command to compare snapshot for all dropdowns
Cypress.Commands.add('compareAllDropdownsSnapshot', (dropdowns, options) => {
  dropdowns.forEach((dropdown) => {
    cy.compareDropdownSnapshot(dropdown, options);
  });
});

// Add command to compare snapshot for a specific combobox
Cypress.Commands.add('compareComboboxSnapshot', (combobox, options) => {
  combobox.open();
  cy.compareComponentSnapshot(combobox.selector, combobox.name, options);
  combobox.close();
});

// Add command to compare snapshot for all comboboxes
Cypress.Commands.add('compareAllComboboxesSnapshot', (comboboxes, options) => {
  comboboxes.forEach((combobox) => {
    cy.compareComboboxSnapshot(combobox, options);
  });
});

// Add command to compare snapshot for a specific listbox
Cypress.Commands.add('compareListboxSnapshot', (listbox, options) => {
  listbox.open();
  cy.compareComponentSnapshot(listbox.selector, listbox.name, options);
  listbox.close();
});

// Add command to compare snapshot for all listboxes
Cypress.Commands.add('compareAllListboxesSnapshot', (listboxes, options) => {
  listboxes.forEach((listbox) => {
    cy.compareListboxSnapshot(listbox, options);
  });
});

// Add command to compare snapshot for a specific tree
Cypress.Commands.add('compareTreeSnapshot', (tree, options) => {
  tree.expand();
  cy.compareComponentSnapshot(tree.selector, tree.name, options);
  tree.collapse();
});

// Add command to compare snapshot for all trees
Cypress.Commands.add('compareAllTreesSnapshot', (trees, options) => {
  trees.forEach((tree) => {
    cy.compareTreeSnapshot(tree, options);
  });
});

// Add command to compare snapshot for a specific grid
Cypress.Commands.add('compareGridSnapshot', (grid, options) => {
  grid.navigate();
  cy.compareComponentSnapshot(grid.selector, grid.name, options);
});

// Add command to compare snapshot for all grids
Cypress.Commands.add('compareAllGridsSnapshot', (grids, options) => {
  grids.forEach((grid) => {
    cy.compareGridSnapshot(grid, options);
  });
});

// Add command to compare snapshot for a specific table
Cypress.Commands.add('compareTableSnapshot', (table, options) => {
  table.navigate();
  cy.compareComponentSnapshot(table.selector, table.name, options);
});

// Add command to compare snapshot for all tables
Cypress.Commands.add('compareAllTablesSnapshot', (tables, options) => {
  tables.forEach((table) => {
    cy.compareTableSnapshot(table, options);
  });
});

// Add command to compare snapshot for a specific dialog
Cypress.Commands.add('compareDialogSnapshot', (dialog, options) => {
  dialog.open();
  cy.compareComponentSnapshot(dialog.selector, dialog.name, options);
  dialog.close();
});

// Add command to compare snapshot for all dialogs
Cypress.Commands.add('compareAllDialogsSnapshot', (dialogs, options) => {
  dialogs.forEach((dialog) => {
    cy.compareDialogSnapshot(dialog, options);
  });
});

// Add command to compare snapshot for a specific alert
Cypress.Commands.add('compareAlertSnapshot', (alert, options) => {
  alert.show();
  cy.compareComponentSnapshot(alert.selector, alert.name, options);
  alert.hide();
});

// Add command to compare snapshot for all alerts
Cypress.Commands.add('compareAllAlertsSnapshot', (alerts, options) => {
  alerts.forEach((alert) => {
    cy.compareAlertSnapshot(alert, options);
  });
});

// Add command to compare snapshot for a specific toast
Cypress.Commands.add('compareToastSnapshot', (toast, options) => {
  toast.show();
  cy.compareComponentSnapshot(toast.selector, toast.name, options);
  toast.hide();
});

// Add command to compare snapshot for all toasts
Cypress.Commands.add('compareAllToastsSnapshot', (toasts, options) => {
  toasts.forEach((toast) => {
    cy.compareToastSnapshot(toast, options);
  });
});

// Add command to compare snapshot for a specific snackbar
Cypress.Commands.add('compareSnackbarSnapshot', (snackbar, options) => {
  snackbar.show();
  cy.compareComponentSnapshot(snackbar.selector, snackbar.name, options);
  snackbar.hide();
});

// Add command to compare snapshot for all snackbars
Cypress.Commands.add('compareAllSnackbarsSnapshot', (snackbars, options) => {
  snackbars.forEach((snackbar) => {
    cy.compareSnackbarSnapshot(snackbar, options);
  });
});

// Add command to compare snapshot for a specific banner
Cypress.Commands.add('compareBannerSnapshot', (banner, options) => {
  banner.show();
  cy.compareComponentSnapshot(banner.selector, banner.name, options);
  banner.hide();
});

// Add command to compare snapshot for all banners
Cypress.Commands.add('compareAllBannersSnapshot', (banners, options) => {
  banners.forEach((banner) => {
    cy.compareBannerSnapshot(banner, options);
  });
});

// Add command to compare snapshot for a specific badge
Cypress.Commands.add('compareBadgeSnapshot', (badge, options) => {
  badge.show();
  cy.compareComponentSnapshot(badge.selector, badge.name, options);
  badge.hide();
});

// Add command to compare snapshot for all badges
Cypress.Commands.add('compareAllBadgesSnapshot', (badges, options) => {
  badges.forEach((badge) => {
    cy.compareBadgeSnapshot(badge, options);
  });
});
