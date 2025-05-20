// ***********************************************************
// This example support/a11y.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress for accessibility testing.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-axe';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add accessibility testing commands
Cypress.Commands.add('checkA11y', (context, options) => {
  cy.injectAxe();
  cy.checkA11y(context, options);
});

// Configure aXe
Cypress.Commands.add('configureAxe', (options) => {
  cy.window().then((win) => {
    win.axe.configure(options);
  });
});

// Log accessibility violations
Cypress.Commands.add('logA11yViolations', (violations) => {
  cy.task('log', `${violations.length} accessibility violation(s) detected`);
  
  // Organize violations by impact
  const violationsByImpact = violations.reduce((acc, violation) => {
    const impact = violation.impact || 'unknown';
    if (!acc[impact]) {
      acc[impact] = [];
    }
    acc[impact].push(violation);
    return acc;
  }, {});
  
  // Log violations by impact
  Object.entries(violationsByImpact).forEach(([impact, violations]) => {
    cy.task('log', `${violations.length} ${impact} impact violation(s):`);
    violations.forEach((violation) => {
      cy.task('log', `- ${violation.id}: ${violation.description}`);
      cy.task('log', `  Help: ${violation.help}`);
      cy.task('log', `  URL: ${violation.helpUrl}`);
      cy.task('log', '  Affected elements:');
      violation.nodes.forEach((node) => {
        cy.task('log', `    ${node.html}`);
      });
    });
  });
});

// Add command to check accessibility and log violations
Cypress.Commands.add('checkAndLogA11y', (context, options) => {
  cy.checkA11y(context, options, null, (violations) => {
    cy.logA11yViolations(violations);
  });
});

// Add command to check accessibility for a specific route
Cypress.Commands.add('checkRouteA11y', (route, options) => {
  cy.visit(route);
  cy.checkAndLogA11y(null, options);
});

// Add command to check accessibility for all routes
Cypress.Commands.add('checkAllRoutesA11y', (routes, options) => {
  routes.forEach((route) => {
    cy.checkRouteA11y(route, options);
  });
});

// Add command to check accessibility for a specific component
Cypress.Commands.add('checkComponentA11y', (selector, options) => {
  cy.get(selector).should('exist');
  cy.checkAndLogA11y(selector, options);
});

// Add command to check accessibility for all components
Cypress.Commands.add('checkAllComponentsA11y', (selectors, options) => {
  selectors.forEach((selector) => {
    cy.checkComponentA11y(selector, options);
  });
});

// Add command to check accessibility for a specific page
Cypress.Commands.add('checkPageA11y', (options) => {
  cy.checkAndLogA11y(null, options);
});

// Add command to check accessibility for all pages
Cypress.Commands.add('checkAllPagesA11y', (pages, options) => {
  pages.forEach((page) => {
    cy.visit(page.route);
    cy.checkPageA11y(options);
  });
});

// Add command to check accessibility for a specific user flow
Cypress.Commands.add('checkUserFlowA11y', (flow, options) => {
  flow.steps.forEach((step) => {
    step.action();
    cy.checkPageA11y(options);
  });
});

// Add command to check accessibility for all user flows
Cypress.Commands.add('checkAllUserFlowsA11y', (flows, options) => {
  flows.forEach((flow) => {
    cy.checkUserFlowA11y(flow, options);
  });
});

// Add command to check accessibility for a specific state
Cypress.Commands.add('checkStateA11y', (state, options) => {
  state.setup();
  cy.checkPageA11y(options);
});

// Add command to check accessibility for all states
Cypress.Commands.add('checkAllStatesA11y', (states, options) => {
  states.forEach((state) => {
    cy.checkStateA11y(state, options);
  });
});

// Add command to check accessibility for a specific interaction
Cypress.Commands.add('checkInteractionA11y', (interaction, options) => {
  interaction.setup();
  interaction.action();
  cy.checkPageA11y(options);
});

// Add command to check accessibility for all interactions
Cypress.Commands.add('checkAllInteractionsA11y', (interactions, options) => {
  interactions.forEach((interaction) => {
    cy.checkInteractionA11y(interaction, options);
  });
});

// Add command to check accessibility for a specific form
Cypress.Commands.add('checkFormA11y', (form, options) => {
  form.setup();
  cy.checkComponentA11y(form.selector, options);
});

// Add command to check accessibility for all forms
Cypress.Commands.add('checkAllFormsA11y', (forms, options) => {
  forms.forEach((form) => {
    cy.checkFormA11y(form, options);
  });
});

// Add command to check accessibility for a specific modal
Cypress.Commands.add('checkModalA11y', (modal, options) => {
  modal.open();
  cy.checkComponentA11y(modal.selector, options);
  modal.close();
});

// Add command to check accessibility for all modals
Cypress.Commands.add('checkAllModalsA11y', (modals, options) => {
  modals.forEach((modal) => {
    cy.checkModalA11y(modal, options);
  });
});

// Add command to check accessibility for a specific notification
Cypress.Commands.add('checkNotificationA11y', (notification, options) => {
  notification.show();
  cy.checkComponentA11y(notification.selector, options);
  notification.hide();
});

// Add command to check accessibility for all notifications
Cypress.Commands.add('checkAllNotificationsA11y', (notifications, options) => {
  notifications.forEach((notification) => {
    cy.checkNotificationA11y(notification, options);
  });
});

// Add command to check accessibility for a specific menu
Cypress.Commands.add('checkMenuA11y', (menu, options) => {
  menu.open();
  cy.checkComponentA11y(menu.selector, options);
  menu.close();
});

// Add command to check accessibility for all menus
Cypress.Commands.add('checkAllMenusA11y', (menus, options) => {
  menus.forEach((menu) => {
    cy.checkMenuA11y(menu, options);
  });
});

// Add command to check accessibility for a specific dialog
Cypress.Commands.add('checkDialogA11y', (dialog, options) => {
  dialog.open();
  cy.checkComponentA11y(dialog.selector, options);
  dialog.close();
});

// Add command to check accessibility for all dialogs
Cypress.Commands.add('checkAllDialogsA11y', (dialogs, options) => {
  dialogs.forEach((dialog) => {
    cy.checkDialogA11y(dialog, options);
  });
});

// Add command to check accessibility for a specific tooltip
Cypress.Commands.add('checkTooltipA11y', (tooltip, options) => {
  tooltip.show();
  cy.checkComponentA11y(tooltip.selector, options);
  tooltip.hide();
});

// Add command to check accessibility for all tooltips
Cypress.Commands.add('checkAllTooltipsA11y', (tooltips, options) => {
  tooltips.forEach((tooltip) => {
    cy.checkTooltipA11y(tooltip, options);
  });
});

// Add command to check accessibility for a specific popover
Cypress.Commands.add('checkPopoverA11y', (popover, options) => {
  popover.show();
  cy.checkComponentA11y(popover.selector, options);
  popover.hide();
});

// Add command to check accessibility for all popovers
Cypress.Commands.add('checkAllPopoversA11y', (popovers, options) => {
  popovers.forEach((popover) => {
    cy.checkPopoverA11y(popover, options);
  });
});

// Add command to check accessibility for a specific drawer
Cypress.Commands.add('checkDrawerA11y', (drawer, options) => {
  drawer.open();
  cy.checkComponentA11y(drawer.selector, options);
  drawer.close();
});

// Add command to check accessibility for all drawers
Cypress.Commands.add('checkAllDrawersA11y', (drawers, options) => {
  drawers.forEach((drawer) => {
    cy.checkDrawerA11y(drawer, options);
  });
});

// Add command to check accessibility for a specific accordion
Cypress.Commands.add('checkAccordionA11y', (accordion, options) => {
  accordion.expand();
  cy.checkComponentA11y(accordion.selector, options);
  accordion.collapse();
});

// Add command to check accessibility for all accordions
Cypress.Commands.add('checkAllAccordionsA11y', (accordions, options) => {
  accordions.forEach((accordion) => {
    cy.checkAccordionA11y(accordion, options);
  });
});

// Add command to check accessibility for a specific tab
Cypress.Commands.add('checkTabA11y', (tab, options) => {
  tab.select();
  cy.checkComponentA11y(tab.selector, options);
});

// Add command to check accessibility for all tabs
Cypress.Commands.add('checkAllTabsA11y', (tabs, options) => {
  tabs.forEach((tab) => {
    cy.checkTabA11y(tab, options);
  });
});

// Add command to check accessibility for a specific carousel
Cypress.Commands.add('checkCarouselA11y', (carousel, options) => {
  carousel.navigate();
  cy.checkComponentA11y(carousel.selector, options);
});

// Add command to check accessibility for all carousels
Cypress.Commands.add('checkAllCarouselsA11y', (carousels, options) => {
  carousels.forEach((carousel) => {
    cy.checkCarouselA11y(carousel, options);
  });
});

// Add command to check accessibility for a specific dropdown
Cypress.Commands.add('checkDropdownA11y', (dropdown, options) => {
  dropdown.open();
  cy.checkComponentA11y(dropdown.selector, options);
  dropdown.close();
});

// Add command to check accessibility for all dropdowns
Cypress.Commands.add('checkAllDropdownsA11y', (dropdowns, options) => {
  dropdowns.forEach((dropdown) => {
    cy.checkDropdownA11y(dropdown, options);
  });
});

// Add command to check accessibility for a specific combobox
Cypress.Commands.add('checkComboboxA11y', (combobox, options) => {
  combobox.open();
  cy.checkComponentA11y(combobox.selector, options);
  combobox.close();
});

// Add command to check accessibility for all comboboxes
Cypress.Commands.add('checkAllComboboxesA11y', (comboboxes, options) => {
  comboboxes.forEach((combobox) => {
    cy.checkComboboxA11y(combobox, options);
  });
});

// Add command to check accessibility for a specific listbox
Cypress.Commands.add('checkListboxA11y', (listbox, options) => {
  listbox.open();
  cy.checkComponentA11y(listbox.selector, options);
  listbox.close();
});

// Add command to check accessibility for all listboxes
Cypress.Commands.add('checkAllListboxesA11y', (listboxes, options) => {
  listboxes.forEach((listbox) => {
    cy.checkListboxA11y(listbox, options);
  });
});

// Add command to check accessibility for a specific tree
Cypress.Commands.add('checkTreeA11y', (tree, options) => {
  tree.expand();
  cy.checkComponentA11y(tree.selector, options);
  tree.collapse();
});

// Add command to check accessibility for all trees
Cypress.Commands.add('checkAllTreesA11y', (trees, options) => {
  trees.forEach((tree) => {
    cy.checkTreeA11y(tree, options);
  });
});

// Add command to check accessibility for a specific grid
Cypress.Commands.add('checkGridA11y', (grid, options) => {
  grid.navigate();
  cy.checkComponentA11y(grid.selector, options);
});

// Add command to check accessibility for all grids
Cypress.Commands.add('checkAllGridsA11y', (grids, options) => {
  grids.forEach((grid) => {
    cy.checkGridA11y(grid, options);
  });
});

// Add command to check accessibility for a specific table
Cypress.Commands.add('checkTableA11y', (table, options) => {
  table.navigate();
  cy.checkComponentA11y(table.selector, options);
});

// Add command to check accessibility for all tables
Cypress.Commands.add('checkAllTablesA11y', (tables, options) => {
  tables.forEach((table) => {
    cy.checkTableA11y(table, options);
  });
});

// Add command to check accessibility for a specific dialog
Cypress.Commands.add('checkDialogA11y', (dialog, options) => {
  dialog.open();
  cy.checkComponentA11y(dialog.selector, options);
  dialog.close();
});

// Add command to check accessibility for all dialogs
Cypress.Commands.add('checkAllDialogsA11y', (dialogs, options) => {
  dialogs.forEach((dialog) => {
    cy.checkDialogA11y(dialog, options);
  });
});

// Add command to check accessibility for a specific alert
Cypress.Commands.add('checkAlertA11y', (alert, options) => {
  alert.show();
  cy.checkComponentA11y(alert.selector, options);
  alert.hide();
});

// Add command to check accessibility for all alerts
Cypress.Commands.add('checkAllAlertsA11y', (alerts, options) => {
  alerts.forEach((alert) => {
    cy.checkAlertA11y(alert, options);
  });
});

// Add command to check accessibility for a specific toast
Cypress.Commands.add('checkToastA11y', (toast, options) => {
  toast.show();
  cy.checkComponentA11y(toast.selector, options);
  toast.hide();
});

// Add command to check accessibility for all toasts
Cypress.Commands.add('checkAllToastsA11y', (toasts, options) => {
  toasts.forEach((toast) => {
    cy.checkToastA11y(toast, options);
  });
});

// Add command to check accessibility for a specific snackbar
Cypress.Commands.add('checkSnackbarA11y', (snackbar, options) => {
  snackbar.show();
  cy.checkComponentA11y(snackbar.selector, options);
  snackbar.hide();
});

// Add command to check accessibility for all snackbars
Cypress.Commands.add('checkAllSnackbarsA11y', (snackbars, options) => {
  snackbars.forEach((snackbar) => {
    cy.checkSnackbarA11y(snackbar, options);
  });
});

// Add command to check accessibility for a specific banner
Cypress.Commands.add('checkBannerA11y', (banner, options) => {
  banner.show();
  cy.checkComponentA11y(banner.selector, options);
  banner.hide();
});

// Add command to check accessibility for all banners
Cypress.Commands.add('checkAllBannersA11y', (banners, options) => {
  banners.forEach((banner) => {
    cy.checkBannerA11y(banner, options);
  });
});

// Add command to check accessibility for a specific badge
Cypress.Commands.add('checkBadgeA11y', (badge, options) => {
  badge.show();
  cy.checkComponentA11y(badge.selector, options);
  badge.hide();
});

// Add command to check accessibility for all badges
Cypress.Commands.add('checkAllBadgesA11y', (badges, options) => {
  badges.forEach((badge) => {
    cy.checkBadgeA11y(badge, options);
  });
});

// Add command to check accessibility for a specific tooltip
Cypress.Commands.add('checkTooltipA11y', (tooltip, options) => {
  tooltip.show();
  cy.checkComponentA11y(tooltip.selector, options);
  tooltip.hide();
});

// Add command to check accessibility for all tooltips
Cypress.Commands.add('checkAllTooltipsA11y', (tooltips, options) => {
  tooltips.forEach((tooltip) => {
    cy.checkTooltipA11y(tooltip, options);
  });
});

// Add command to check accessibility for a specific popover
Cypress.Commands.add('checkPopoverA11y', (popover, options) => {
  popover.show();
  cy.checkComponentA11y(popover.selector, options);
  popover.hide();
});

// Add command to check accessibility for all popovers
Cypress.Commands.add('checkAllPopoversA11y', (popovers, options) => {
  popovers.forEach((popover) => {
    cy.checkPopoverA11y(popover, options);
  });
});

// Add command to check accessibility for a specific drawer
Cypress.Commands.add('checkDrawerA11y', (drawer, options) => {
  drawer.open();
  cy.checkComponentA11y(drawer.selector, options);
  drawer.close();
});

// Add command to check accessibility for all drawers
Cypress.Commands.add('checkAllDrawersA11y', (drawers, options) => {
  drawers.forEach((drawer) => {
    cy.checkDrawerA11y(drawer, options);
  });
});

// Add command to check accessibility for a specific accordion
Cypress.Commands.add('checkAccordionA11y', (accordion, options) => {
  accordion.expand();
  cy.checkComponentA11y(accordion.selector, options);
  accordion.collapse();
});

// Add command to check accessibility for all accordions
Cypress.Commands.add('checkAllAccordionsA11y', (accordions, options) => {
  accordions.forEach((accordion) => {
    cy.checkAccordionA11y(accordion, options);
  });
});

// Add command to check accessibility for a specific tab
Cypress.Commands.add('checkTabA11y', (tab, options) => {
  tab.select();
  cy.checkComponentA11y(tab.selector, options);
});

// Add command to check accessibility for all tabs
Cypress.Commands.add('checkAllTabsA11y', (tabs, options) => {
  tabs.forEach((tab) => {
    cy.checkTabA11y(tab, options);
  });
});

// Add command to check accessibility for a specific carousel
Cypress.Commands.add('checkCarouselA11y', (carousel, options) => {
  carousel.navigate();
  cy.checkComponentA11y(carousel.selector, options);
});

// Add command to check accessibility for all carousels
Cypress.Commands.add('checkAllCarouselsA11y', (carousels, options) => {
  carousels.forEach((carousel) => {
    cy.checkCarouselA11y(carousel, options);
  });
});

// Add command to check accessibility for a specific dropdown
Cypress.Commands.add('checkDropdownA11y', (dropdown, options) => {
  dropdown.open();
  cy.checkComponentA11y(dropdown.selector, options);
  dropdown.close();
});

// Add command to check accessibility for all dropdowns
Cypress.Commands.add('checkAllDropdownsA11y', (dropdowns, options) => {
  dropdowns.forEach((dropdown) => {
    cy.checkDropdownA11y(dropdown, options);
  });
});

// Add command to check accessibility for a specific combobox
Cypress.Commands.add('checkComboboxA11y', (combobox, options) => {
  combobox.open();
  cy.checkComponentA11y(combobox.selector, options);
  combobox.close();
});

// Add command to check accessibility for all comboboxes
Cypress.Commands.add('checkAllComboboxesA11y', (comboboxes, options) => {
  comboboxes.forEach((combobox) => {
    cy.checkComboboxA11y(combobox, options);
  });
});

// Add command to check accessibility for a specific listbox
Cypress.Commands.add('checkListboxA11y', (listbox, options) => {
  listbox.open();
  cy.checkComponentA11y(listbox.selector, options);
  listbox.close();
});

// Add command to check accessibility for all listboxes
Cypress.Commands.add('checkAllListboxesA11y', (listboxes, options) => {
  listboxes.forEach((listbox) => {
    cy.checkListboxA11y(listbox, options);
  });
});

// Add command to check accessibility for a specific tree
Cypress.Commands.add('checkTreeA11y', (tree, options) => {
  tree.expand();
  cy.checkComponentA11y(tree.selector, options);
  tree.collapse();
});

// Add command to check accessibility for all trees
Cypress.Commands.add('checkAllTreesA11y', (trees, options) => {
  trees.forEach((tree) => {
    cy.checkTreeA11y(tree, options);
  });
});

// Add command to check accessibility for a specific grid
Cypress.Commands.add('checkGridA11y', (grid, options) => {
  grid.navigate();
  cy.checkComponentA11y(grid.selector, options);
});

// Add command to check accessibility for all grids
Cypress.Commands.add('checkAllGridsA11y', (grids, options) => {
  grids.forEach((grid) => {
    cy.checkGridA11y(grid, options);
  });
});

// Add command to check accessibility for a specific table
Cypress.Commands.add('checkTableA11y', (table, options) => {
  table.navigate();
  cy.checkComponentA11y(table.selector, options);
});

// Add command to check accessibility for all tables
Cypress.Commands.add('checkAllTablesA11y', (tables, options) => {
  tables.forEach((table) => {
    cy.checkTableA11y(table, options);
  });
});

// Add command to check accessibility for a specific dialog
Cypress.Commands.add('checkDialogA11y', (dialog, options) => {
  dialog.open();
  cy.checkComponentA11y(dialog.selector, options);
  dialog.close();
});

// Add command to check accessibility for all dialogs
Cypress.Commands.add('checkAllDialogsA11y', (dialogs, options) => {
  dialogs.forEach((dialog) => {
    cy.checkDialogA11y(dialog, options);
  });
});

// Add command to check accessibility for a specific alert
Cypress.Commands.add('checkAlertA11y', (alert, options) => {
  alert.show();
  cy.checkComponentA11y(alert.selector, options);
  alert.hide();
});

// Add command to check accessibility for all alerts
Cypress.Commands.add('checkAllAlertsA11y', (alerts, options) => {
  alerts.forEach((alert) => {
    cy.checkAlertA11y(alert, options);
  });
});

// Add command to check accessibility for a specific toast
Cypress.Commands.add('checkToastA11y', (toast, options) => {
  toast.show();
  cy.checkComponentA11y(toast.selector, options);
  toast.hide();
});

// Add command to check accessibility for all toasts
Cypress.Commands.add('checkAllToastsA11y', (toasts, options) => {
  toasts.forEach((toast) => {
    cy.checkToastA11y(toast, options);
  });
});

// Add command to check accessibility for a specific snackbar
Cypress.Commands.add('checkSnackbarA11y', (snackbar, options) => {
  snackbar.show();
  cy.checkComponentA11y(snackbar.selector, options);
  snackbar.hide();
});

// Add command to check accessibility for all snackbars
Cypress.Commands.add('checkAllSnackbarsA11y', (snackbars, options) => {
  snackbars.forEach((snackbar) => {
    cy.checkSnackbarA11y(snackbar, options);
  });
});

// Add command to check accessibility for a specific banner
Cypress.Commands.add('checkBannerA11y', (banner, options) => {
  banner.show();
  cy.checkComponentA11y(banner.selector, options);
  banner.hide();
});

// Add command to check accessibility for all banners
Cypress.Commands.add('checkAllBannersA11y', (banners, options) => {
  banners.forEach((banner) => {
    cy.checkBannerA11y(banner, options);
  });
});

// Add command to check accessibility for a specific badge
Cypress.Commands.add('checkBadgeA11y', (badge, options) => {
  badge.show();
  cy.checkComponentA11y(badge.selector, options);
  badge.hide();
});

// Add command to check accessibility for all badges
Cypress.Commands.add('checkAllBadgesA11y', (badges, options) => {
  badges.forEach((badge) => {
    cy.checkBadgeA11y(badge, options);
  });
});
