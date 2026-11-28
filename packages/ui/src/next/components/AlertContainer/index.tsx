import {
    useCallback,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import AlertContext, { type AlertType } from '#contexts/alert';
import Portal from '#next/base/Portal';
import type { StatusType } from '#utils/style';

import Alert from '../Alert';

import styles from './styles.module.css';

const DEFAULT_DISMISS_DURATION = 5000;

// NOTE: the shared alert context still uses the v2 names
const alertTypeToStatus: Record<AlertType, StatusType> = {
    success: 'positive',
    info: 'information',
    warning: 'warning',
    danger: 'negative',
};

export interface Props {
    className?: string;
}

/**
 * Shows the alerts from the alert context as toasts at the top of the
 * window and dismisses each after its duration. Mount it once in the app.
 */
function AlertContainer(props: Props) {
    const { className } = props;
    const { alerts, removeAlert } = useContext(AlertContext);
    const timeouts = useRef<Record<string, number>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    // NOTE: toasts live in the top layer, re-raised on every change, so they
    // show above an open modal dialog too
    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof container.showPopover !== 'function') {
            return;
        }
        if (container.matches(':popover-open')) {
            container.hidePopover();
        }
        container.showPopover();
    }, [alerts]);

    useEffect(() => {
        alerts.filter((alert) => !alert.nonDismissable).forEach((alert) => {
            if (timeouts.current[alert.name]) {
                return;
            }
            timeouts.current[alert.name] = window.setTimeout(() => {
                removeAlert(alert.name);
                delete timeouts.current[alert.name];
            }, alert.duration ?? DEFAULT_DISMISS_DURATION);
        });
    }, [alerts, removeAlert]);

    const handleClose = useCallback((name: string) => {
        window.clearTimeout(timeouts.current[name]);
        delete timeouts.current[name];
        removeAlert(name);
    }, [removeAlert]);

    if (alerts.length === 0) {
        return null;
    }

    return (
        <Portal>
            <div
                ref={containerRef}
                popover="manual"
                className={_cs(styles.alertContainer, className)}
            >
                {alerts.map((alert) => (
                    alert.nonDismissable ? (
                        <Alert
                            key={alert.name}
                            name={alert.name}
                            variant="toast"
                            status={alertTypeToStatus[alert.variant]}
                            heading={alert.title}
                            description={alert.description}
                            debugMessage={alert.debugMessage}
                            withoutCloseButton
                        />
                    ) : (
                        <Alert
                            key={alert.name}
                            name={alert.name}
                            variant="toast"
                            status={alertTypeToStatus[alert.variant]}
                            heading={alert.title}
                            description={alert.description}
                            debugMessage={alert.debugMessage}
                            onClose={handleClose}
                        />
                    )
                ))}
            </div>
        </Portal>
    );
}

export default AlertContainer;
