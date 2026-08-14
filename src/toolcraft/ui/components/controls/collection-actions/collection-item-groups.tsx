"use client";

import * as React from "react";

export type CollectionItemGroupsProps = {
  children: React.ReactNode;
};

export function CollectionItemGroups({
  children,
}: CollectionItemGroupsProps): React.JSX.Element {
  const groups = React.Children.toArray(children);

  return (
    <div className="min-w-0" data-slot="collection-item-groups">
      {groups.map((group, index) => {
        const key =
          React.isValidElement(group) && group.key !== null ? group.key : index;

        return (
          <div
            className={
              index === 0
                ? "min-w-0"
                : "mt-[18px] min-w-0 border-t border-[color:color-mix(in_oklab,var(--border)_5%,transparent)] pt-[18px]"
            }
            data-slot="collection-item-group"
            key={key}
          >
            {group}
          </div>
        );
      })}
    </div>
  );
}
