import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Button,
    useDialogState,
} from '@ifrc-go/ui/next';

import DownloadImportTemplateModal from './DownloadImportTemplateModal';

import i18n from './i18n.json';

function DownloadImportTemplateButton() {
    const templateDialog = useDialogState();
    const strings = useTranslation(i18n);

    return (
        <>
            <Button
                name={undefined}
                onClick={templateDialog.open}
            >
                {strings.downloadImportTemplateButtonLabel}
            </Button>
            {templateDialog.isOpen && (
                <DownloadImportTemplateModal
                    onComplete={templateDialog.close}
                />
            )}
        </>
    );
}

export default DownloadImportTemplateButton;
