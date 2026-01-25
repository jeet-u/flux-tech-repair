/**
 * useHeadingClickHandler Hook
 *
 * Reusable hook to handle TOC heading clicks.
 * Scrolls to the target heading and manages accordion expansion state.
 *
 * @example
 * ```tsx
 * function TableOfContents() {
 *   const headings = useHeadingTree();
 *   const { expandedIds, setExpandedIds } = useExpandedState({ headings, activeId });
 *
 *   const handleHeadingClick = useHeadingClickHandler({
 *     headings,
 *     setExpandedIds,
 *   });
 *
 *   return <HeadingList onHeadingClick={handleHeadingClick} />;
 * }
 * ```
 */

import { useCallback } from 'react';
import { findHeadingById, getParentIds, getSiblingIds, type Heading } from './useHeadingTree';

export interface UseHeadingClickHandlerOptions {
  /** Hierarchical heading tree */
  headings: Heading[];
  /** Setter for expansion state */
  setExpandedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

/**
 * Handle heading clicks, scroll to target, and update accordion expansion state.
 *
 * @param options - Options
 * @returns Heading click handler
 */
export function useHeadingClickHandler({ headings, setExpandedIds }: UseHeadingClickHandlerOptions): (id: string) => void {
  return useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;

      element.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Get the clicked heading node
      const clickedHeading = findHeadingById(headings, id);
      if (!clickedHeading) return;

      // Collect parent IDs that should be expanded
      const parentIds = getParentIds(clickedHeading);
      // If the clicked heading has children, include it in the expansion list
      if (clickedHeading.children.length > 0) {
        parentIds.unshift(id);
      }

      if (parentIds.length === 0) return;

      setExpandedIds((prev) => {
        const newSet = new Set(prev);

        // Group parents by level to achieve accordion behavior
        const parentsByLevel: { [level: number]: string[] } = {};

        parentIds.forEach((parentId) => {
          const parentHeading = findHeadingById(headings, parentId);
          if (parentHeading) {
            if (!parentsByLevel[parentHeading.level]) {
              parentsByLevel[parentHeading.level] = [];
            }
            parentsByLevel[parentHeading.level].push(parentId);
          }
        });

        // For each level, close siblings and expand nodes on the current path
        Object.keys(parentsByLevel).forEach((levelStr) => {
          const level = parseInt(levelStr, 10);
          const parentsAtLevel = parentsByLevel[level];

          parentsAtLevel.forEach((parentId) => {
            const parentHeading = findHeadingById(headings, parentId);
            if (parentHeading) {
              // Close siblings at the same level
              const siblingIds = getSiblingIds(parentHeading, headings);
              siblingIds.forEach((siblingId) => {
                newSet.delete(siblingId);
              });

              // Expand current node
              newSet.add(parentId);
            }
          });
        });

        return newSet;
      });
    },
    [headings, setExpandedIds],
  );
}
