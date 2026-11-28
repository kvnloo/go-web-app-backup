import { CheckboxMultipleBlankFillIcon } from '@ifrc-go/icons';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Button,
    Dialog,
    useDialogState,
} from '@ifrc-go/ui/next';

import i18n from './i18n.json';

interface Props {
    content: React.ReactNode;
    heading: string;
}

/** The quality criteria of an EAP form section, opened in a dialog */
function SectionQualityCriteria(props: Props) {
    const {
        content,
        heading,
    } = props;

    const strings = useTranslation(i18n);
    const dialog = useDialogState();

    return (
        <>
            <Button
                name={undefined}
                onClick={dialog.open}
                after={<CheckboxMultipleBlankFillIcon />}
            >
                {strings.sectionQualityCriteriaLabel}
            </Button>
            {dialog.isOpen && (
                <Dialog
                    heading={heading}
                    onClose={dialog.close}
                >
                    {content}
                </Dialog>
            )}
        </>
    );
}

export default SectionQualityCriteria;
