/**
 * Utilities for implementing ARIA (Accessible Rich Internet Applications) attributes
 */
import React, { useRef, useEffect, useCallback } from 'react';

/**
 * ARIA roles
 */
export enum AriaRole {
  /**
   * A section containing alert information
   */
  Alert = 'alert',
  
  /**
   * A dialog that requires a response from the user
   */
  AlertDialog = 'alertdialog',
  
  /**
   * A section of a page that serves as a landmark
   */
  Application = 'application',
  
  /**
   * A section of a page that contains an article
   */
  Article = 'article',
  
  /**
   * A section of a page that serves as a banner
   */
  Banner = 'banner',
  
  /**
   * A button element
   */
  Button = 'button',
  
  /**
   * A checkbox element
   */
  Checkbox = 'checkbox',
  
  /**
   * A cell in a table
   */
  Cell = 'cell',
  
  /**
   * A section of a page that serves as complementary information
   */
  Complementary = 'complementary',
  
  /**
   * A combobox element
   */
  Combobox = 'combobox',
  
  /**
   * A section of a page that serves as a content info
   */
  ContentInfo = 'contentinfo',
  
  /**
   * A definition element
   */
  Definition = 'definition',
  
  /**
   * A dialog element
   */
  Dialog = 'dialog',
  
  /**
   * A directory element
   */
  Directory = 'directory',
  
  /**
   * A document element
   */
  Document = 'document',
  
  /**
   * A form element
   */
  Form = 'form',
  
  /**
   * A grid element
   */
  Grid = 'grid',
  
  /**
   * A gridcell element
   */
  GridCell = 'gridcell',
  
  /**
   * A group element
   */
  Group = 'group',
  
  /**
   * A heading element
   */
  Heading = 'heading',
  
  /**
   * An img element
   */
  Img = 'img',
  
  /**
   * A link element
   */
  Link = 'link',
  
  /**
   * A list element
   */
  List = 'list',
  
  /**
   * A listbox element
   */
  Listbox = 'listbox',
  
  /**
   * A listitem element
   */
  ListItem = 'listitem',
  
  /**
   * A log element
   */
  Log = 'log',
  
  /**
   * A main element
   */
  Main = 'main',
  
  /**
   * A marquee element
   */
  Marquee = 'marquee',
  
  /**
   * A math element
   */
  Math = 'math',
  
  /**
   * A menu element
   */
  Menu = 'menu',
  
  /**
   * A menubar element
   */
  Menubar = 'menubar',
  
  /**
   * A menuitem element
   */
  MenuItem = 'menuitem',
  
  /**
   * A menuitemcheckbox element
   */
  MenuItemCheckbox = 'menuitemcheckbox',
  
  /**
   * A menuitemradio element
   */
  MenuItemRadio = 'menuitemradio',
  
  /**
   * A navigation element
   */
  Navigation = 'navigation',
  
  /**
   * A note element
   */
  Note = 'note',
  
  /**
   * An option element
   */
  Option = 'option',
  
  /**
   * A presentation element
   */
  Presentation = 'presentation',
  
  /**
   * A progressbar element
   */
  ProgressBar = 'progressbar',
  
  /**
   * A radio element
   */
  Radio = 'radio',
  
  /**
   * A radiogroup element
   */
  RadioGroup = 'radiogroup',
  
  /**
   * A region element
   */
  Region = 'region',
  
  /**
   * A row element
   */
  Row = 'row',
  
  /**
   * A rowgroup element
   */
  RowGroup = 'rowgroup',
  
  /**
   * A rowheader element
   */
  RowHeader = 'rowheader',
  
  /**
   * A scrollbar element
   */
  Scrollbar = 'scrollbar',
  
  /**
   * A search element
   */
  Search = 'search',
  
  /**
   * A searchbox element
   */
  Searchbox = 'searchbox',
  
  /**
   * A separator element
   */
  Separator = 'separator',
  
  /**
   * A slider element
   */
  Slider = 'slider',
  
  /**
   * A spinbutton element
   */
  SpinButton = 'spinbutton',
  
  /**
   * A status element
   */
  Status = 'status',
  
  /**
   * A switch element
   */
  Switch = 'switch',
  
  /**
   * A tab element
   */
  Tab = 'tab',
  
  /**
   * A table element
   */
  Table = 'table',
  
  /**
   * A tablist element
   */
  TabList = 'tablist',
  
  /**
   * A tabpanel element
   */
  TabPanel = 'tabpanel',
  
  /**
   * A term element
   */
  Term = 'term',
  
  /**
   * A textbox element
   */
  Textbox = 'textbox',
  
  /**
   * A timer element
   */
  Timer = 'timer',
  
  /**
   * A toolbar element
   */
  Toolbar = 'toolbar',
  
  /**
   * A tooltip element
   */
  Tooltip = 'tooltip',
  
  /**
   * A tree element
   */
  Tree = 'tree',
  
  /**
   * A treegrid element
   */
  TreeGrid = 'treegrid',
  
  /**
   * A treeitem element
   */
  TreeItem = 'treeitem',
}

/**
 * ARIA properties for different roles
 */
export const ariaPropertiesForRole: Record<AriaRole, string[]> = {
  [AriaRole.Alert]: ['aria-atomic', 'aria-live'],
  [AriaRole.AlertDialog]: ['aria-modal', 'aria-labelledby', 'aria-describedby'],
  [AriaRole.Application]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Article]: ['aria-label', 'aria-labelledby', 'aria-posinset', 'aria-setsize'],
  [AriaRole.Banner]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Button]: ['aria-pressed', 'aria-expanded', 'aria-disabled'],
  [AriaRole.Checkbox]: ['aria-checked', 'aria-disabled', 'aria-readonly'],
  [AriaRole.Cell]: ['aria-colindex', 'aria-colspan', 'aria-rowindex', 'aria-rowspan'],
  [AriaRole.Complementary]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Combobox]: ['aria-expanded', 'aria-controls', 'aria-autocomplete', 'aria-required', 'aria-activedescendant'],
  [AriaRole.ContentInfo]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Definition]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Dialog]: ['aria-modal', 'aria-labelledby', 'aria-describedby'],
  [AriaRole.Directory]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Document]: ['aria-label', 'aria-labelledby', 'aria-expanded'],
  [AriaRole.Form]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Grid]: ['aria-level', 'aria-multiselectable', 'aria-readonly', 'aria-activedescendant', 'aria-colcount', 'aria-rowcount'],
  [AriaRole.GridCell]: ['aria-colindex', 'aria-colspan', 'aria-rowindex', 'aria-rowspan', 'aria-selected'],
  [AriaRole.Group]: ['aria-label', 'aria-labelledby', 'aria-activedescendant'],
  [AriaRole.Heading]: ['aria-level'],
  [AriaRole.Img]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Link]: ['aria-expanded', 'aria-disabled'],
  [AriaRole.List]: ['aria-label', 'aria-labelledby', 'aria-multiselectable'],
  [AriaRole.Listbox]: ['aria-multiselectable', 'aria-required', 'aria-activedescendant', 'aria-expanded'],
  [AriaRole.ListItem]: ['aria-level', 'aria-posinset', 'aria-setsize'],
  [AriaRole.Log]: ['aria-label', 'aria-labelledby', 'aria-live', 'aria-atomic'],
  [AriaRole.Main]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Marquee]: ['aria-label', 'aria-labelledby', 'aria-live', 'aria-atomic'],
  [AriaRole.Math]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Menu]: ['aria-label', 'aria-labelledby', 'aria-activedescendant', 'aria-expanded'],
  [AriaRole.Menubar]: ['aria-label', 'aria-labelledby', 'aria-activedescendant', 'aria-expanded'],
  [AriaRole.MenuItem]: ['aria-disabled', 'aria-posinset', 'aria-setsize'],
  [AriaRole.MenuItemCheckbox]: ['aria-checked', 'aria-disabled', 'aria-posinset', 'aria-setsize'],
  [AriaRole.MenuItemRadio]: ['aria-checked', 'aria-disabled', 'aria-posinset', 'aria-setsize'],
  [AriaRole.Navigation]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Note]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Option]: ['aria-selected', 'aria-disabled', 'aria-posinset', 'aria-setsize'],
  [AriaRole.Presentation]: [],
  [AriaRole.ProgressBar]: ['aria-label', 'aria-labelledby', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext'],
  [AriaRole.Radio]: ['aria-checked', 'aria-disabled', 'aria-posinset', 'aria-setsize'],
  [AriaRole.RadioGroup]: ['aria-label', 'aria-labelledby', 'aria-required'],
  [AriaRole.Region]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Row]: ['aria-level', 'aria-selected', 'aria-activedescendant', 'aria-colindex', 'aria-rowindex'],
  [AriaRole.RowGroup]: ['aria-activedescendant'],
  [AriaRole.RowHeader]: ['aria-colindex', 'aria-colspan', 'aria-rowindex', 'aria-rowspan', 'aria-sort'],
  [AriaRole.Scrollbar]: ['aria-controls', 'aria-orientation', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow'],
  [AriaRole.Search]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Searchbox]: ['aria-activedescendant', 'aria-autocomplete', 'aria-multiline', 'aria-placeholder', 'aria-readonly', 'aria-required'],
  [AriaRole.Separator]: ['aria-orientation', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow'],
  [AriaRole.Slider]: ['aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'aria-orientation'],
  [AriaRole.SpinButton]: ['aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'aria-required'],
  [AriaRole.Status]: ['aria-label', 'aria-labelledby', 'aria-live', 'aria-atomic'],
  [AriaRole.Switch]: ['aria-checked', 'aria-disabled', 'aria-readonly'],
  [AriaRole.Tab]: ['aria-selected', 'aria-disabled', 'aria-expanded', 'aria-posinset', 'aria-setsize'],
  [AriaRole.Table]: ['aria-colcount', 'aria-rowcount'],
  [AriaRole.TabList]: ['aria-label', 'aria-labelledby', 'aria-activedescendant', 'aria-multiselectable'],
  [AriaRole.TabPanel]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Term]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Textbox]: ['aria-activedescendant', 'aria-autocomplete', 'aria-multiline', 'aria-placeholder', 'aria-readonly', 'aria-required'],
  [AriaRole.Timer]: ['aria-label', 'aria-labelledby', 'aria-live', 'aria-atomic'],
  [AriaRole.Toolbar]: ['aria-label', 'aria-labelledby', 'aria-activedescendant', 'aria-orientation'],
  [AriaRole.Tooltip]: ['aria-label', 'aria-labelledby'],
  [AriaRole.Tree]: ['aria-multiselectable', 'aria-required', 'aria-activedescendant', 'aria-expanded'],
  [AriaRole.TreeGrid]: ['aria-level', 'aria-multiselectable', 'aria-readonly', 'aria-activedescendant', 'aria-colcount', 'aria-rowcount'],
  [AriaRole.TreeItem]: ['aria-level', 'aria-posinset', 'aria-setsize', 'aria-expanded', 'aria-selected'],
};

/**
 * A class for implementing ARIA attributes
 */
export class AriaUtils {
  /**
   * Gets the required ARIA properties for a role
   * @param role The ARIA role
   * @returns The required ARIA properties
   */
  getRequiredPropertiesForRole(role: AriaRole): string[] {
    return ariaPropertiesForRole[role] || [];
  }
  
  /**
   * Checks if an element has the required ARIA properties for its role
   * @param element The element to check
   * @returns An array of missing properties
   */
  checkRequiredProperties(element: Element): string[] {
    const role = element.getAttribute('role') as AriaRole | null;
    
    if (!role || !ariaPropertiesForRole[role]) {
      return [];
    }
    
    const requiredProperties = ariaPropertiesForRole[role];
    const missingProperties: string[] = [];
    
    for (const property of requiredProperties) {
      if (!element.hasAttribute(property)) {
        missingProperties.push(property);
      }
    }
    
    return missingProperties;
  }
  
  /**
   * Adds ARIA attributes to an element
   * @param element The element to add attributes to
   * @param attributes The attributes to add
   */
  addAriaAttributes(element: Element, attributes: Record<string, string>): void {
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
  }
  
  /**
   * Creates an element with ARIA attributes
   * @param tagName The tag name of the element
   * @param attributes The attributes to add
   * @returns The created element
   */
  createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes: Record<string, string> = {}
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    this.addAriaAttributes(element, attributes);
    return element;
  }
  
  /**
   * Gets the ARIA label for an element
   * @param element The element to get the label for
   * @returns The ARIA label
   */
  getAriaLabel(element: Element): string | null {
    // Check for aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return ariaLabel;
    }
    
    // Check for aria-labelledby
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElements = ariaLabelledBy
        .split(' ')
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      
      if (labelElements.length > 0) {
        return labelElements.map((el) => el?.textContent || '').join(' ');
      }
    }
    
    // Check for label element (for form controls)
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
      const id = element.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
          return label.textContent;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Gets the ARIA description for an element
   * @param element The element to get the description for
   * @returns The ARIA description
   */
  getAriaDescription(element: Element): string | null {
    // Check for aria-describedby
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      const descriptionElements = ariaDescribedBy
        .split(' ')
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      
      if (descriptionElements.length > 0) {
        return descriptionElements.map((el) => el?.textContent || '').join(' ');
      }
    }
    
    return null;
  }
}

// Create a singleton instance
export const ariaUtils = new AriaUtils();

/**
 * A hook for adding ARIA attributes to an element
 * @param role The ARIA role
 * @param attributes The ARIA attributes
 * @returns A ref to attach to the element
 */
export function useAria(
  role: AriaRole,
  attributes: Record<string, string> = {}
): React.RefObject<HTMLElement> {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      // Set role
      ref.current.setAttribute('role', role);
      
      // Set attributes
      for (const [key, value] of Object.entries(attributes)) {
        ref.current.setAttribute(key, value);
      }
    }
  }, [role, attributes]);
  
  return ref;
}

/**
 * A hook for implementing an accessible button
 * @param options Options for the button
 * @returns An object with the ref and event handlers
 */
export function useAriaButton(
  options: {
    pressed?: boolean;
    expanded?: boolean;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  } = {}
): {
  ref: React.RefObject<HTMLElement>;
  buttonProps: {
    role: string;
    tabIndex: number;
    'aria-pressed'?: string;
    'aria-expanded'?: string;
    'aria-disabled'?: string;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  };
} {
  const { pressed, expanded, disabled, onClick } = options;
  
  const ref = useRef<HTMLElement>(null);
  
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      
      onClick?.(event);
    },
    [disabled, onClick]
  );
  
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) {
        return;
      }
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event as unknown as React.MouseEvent<HTMLElement>);
      }
    },
    [disabled, onClick]
  );
  
  return {
    ref,
    buttonProps: {
      role: 'button',
      tabIndex: disabled ? -1 : 0,
      ...(pressed !== undefined && { 'aria-pressed': pressed.toString() }),
      ...(expanded !== undefined && { 'aria-expanded': expanded.toString() }),
      ...(disabled && { 'aria-disabled': 'true' }),
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    },
  };
}

export default {
  ariaUtils,
  useAria,
  useAriaButton,
};
