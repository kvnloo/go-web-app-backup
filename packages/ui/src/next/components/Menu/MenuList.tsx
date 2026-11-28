import {
    useEffect,
    useRef,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';

const TYPE_AHEAD_RESET_MS = 500;

/** The enabled menu items in DOM order */
function getMenuItems(container: HTMLElement | null): HTMLElement[] {
    if (isNotDefined(container)) {
        return [];
    }
    return Array.from(
        container.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ).filter((item) => (
        !item.hasAttribute('disabled')
        && item.getAttribute('aria-disabled') !== 'true'
    ));
}

function focusItem(items: HTMLElement[], index: number) {
    if (items.length === 0) {
        return;
    }
    const next = ((index % items.length) + items.length) % items.length;
    items.forEach((item, i) => {
        // eslint-disable-next-line no-param-reassign
        item.tabIndex = i === next ? 0 : -1;
    });
    items[next]?.focus();
}

interface Props {
    className?: string;
    children: React.ReactNode;
    /** Closes the menu, leaving focus where it moved (Tab out) */
    onRequestClose: () => void;
    focusTrigger: () => void;
}

/**
 * The role="menu" popup content with the APG menu keyboard model: the first
 * item takes focus on open; arrows, Home and End move; typing jumps to a
 * matching item; Escape closes and returns focus to the trigger; focus
 * leaving the menu closes it.
 */
function MenuList(props: Props) {
    const {
        className,
        children,
        onRequestClose,
        focusTrigger,
    } = props;

    const menuRef = useRef<HTMLDivElement>(null);
    const typeAheadRef = useRef<{ buffer: string; timer: number | undefined }>({
        buffer: '',
        timer: undefined,
    });

    useEffect(() => {
        focusItem(getMenuItems(menuRef.current), 0);
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            focusTrigger();
            onRequestClose();
            return;
        }

        const items = getMenuItems(menuRef.current);
        const currentIndex = items.findIndex((item) => item === document.activeElement);

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusItem(items, currentIndex + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            focusItem(items, currentIndex < 0 ? items.length - 1 : currentIndex - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            focusItem(items, 0);
        } else if (event.key === 'End') {
            event.preventDefault();
            focusItem(items, items.length - 1);
        } else if (event.key.length === 1 && /\S/.test(event.key)) {
            // NOTE: Space is whitespace, so it still activates the item
            const typeAhead = typeAheadRef.current;
            typeAhead.buffer += event.key.toLowerCase();
            window.clearTimeout(typeAhead.timer);
            typeAhead.timer = window.setTimeout(() => {
                typeAheadRef.current.buffer = '';
            }, TYPE_AHEAD_RESET_MS);

            const start = currentIndex + 1;
            const ordered = [...items.slice(start), ...items.slice(0, start)];
            const match = ordered.find((item) => (
                (item.textContent ?? '').trim().toLowerCase().startsWith(typeAhead.buffer)
            ));
            if (match) {
                focusItem(items, items.indexOf(match));
            }
        }
    };

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        if (!menuRef.current?.contains(event.relatedTarget as Node | null)) {
            onRequestClose();
        }
    };

    return (
        <div
            role="menu"
            tabIndex={-1}
            ref={menuRef}
            className={className}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        >
            {children}
        </div>
    );
}

export default MenuList;
