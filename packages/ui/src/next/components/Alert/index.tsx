import {
    CheckboxCircleLineIcon,
    CloseLineIcon,
    ErrorWarningLineIcon,
    InformationLineIcon,
    QuestionLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

// NOTE: shares the v2 strings (same "common" namespace keys); the file moves
// here when v2 is removed
import i18n from '#components/Alert/i18n.json';
import useTranslation from '#hooks/useTranslation';
import ContainerLayout from '#next/base/ContainerLayout';
import TextLayout from '#next/base/TextLayout';
import type { StatusType } from '#utils/style';

import Button from '../Button';
import IconButton from '../IconButton';

import styles from './styles.module.css';

/** inline: a tinted notice in the page (the default); toast: a solid, raised notification */
export type AlertVariant = 'inline' | 'toast';

interface BaseProps<NAME> {
    className?: string;
    name: NAME;
    /** Defaults to information */
    status?: StatusType;
    variant?: AlertVariant;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    /** Technical details the user can copy for a support request */
    debugMessage?: string;
}

/** A closable alert needs its close handler */
type CloseProps<NAME> =
    | { withoutCloseButton?: never; onClose: (name: NAME) => void }
    | { withoutCloseButton: true; onClose?: never };

export type Props<NAME> = BaseProps<NAME> & CloseProps<NAME>;

const statusToIcon: Record<StatusType, React.ReactNode> = {
    positive: <CheckboxCircleLineIcon />,
    negative: <ErrorWarningLineIcon />,
    information: <InformationLineIcon />,
    warning: <QuestionLineIcon />,
};

const statusToClassName: Record<StatusType, string> = {
    positive: styles.positive,
    negative: styles.negative,
    information: styles.information,
    warning: styles.warning,
};

/**
 * Tells the user about the result of an action or a state that needs
 * attention, as an alert region. Toasts are shown through AlertContainer.
 */
function Alert<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        status = 'information',
        variant = 'inline',
        heading,
        description,
        debugMessage,
        withoutCloseButton,
        onClose,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <ContainerLayout
            role="alert"
            className={_cs(
                styles.alert,
                statusToClassName[status],
                variant === 'toast' && styles.toast,
                className,
            )}
            surface={variant === 'toast' ? 'dark' : undefined}
            boxShadow={variant === 'toast' ? 'md' : undefined}
            withPadding
            spacing="sm"
            icon={<span className={styles.icon}>{statusToIcon[status]}</span>}
            heading={heading && (
                <TextLayout as="div" fontWeight="semibold">
                    {heading}
                </TextLayout>
            )}
            headerWrapBreakpoint="none"
            actions={!withoutCloseButton && (
                <IconButton
                    name={name}
                    onClick={onClose}
                    label={strings.closeButtonTitle}
                >
                    <CloseLineIcon />
                </IconButton>
            )}
            footerActions={debugMessage && (
                <Button
                    name={undefined}
                    variant="tertiary"
                    onClick={() => navigator.clipboard.writeText(debugMessage)}
                >
                    {strings.alertCopyErrorDetails}
                </Button>
            )}
            footerWrapBreakpoint="none"
        >
            {description}
        </ContainerLayout>
    );
}

export default Alert;
