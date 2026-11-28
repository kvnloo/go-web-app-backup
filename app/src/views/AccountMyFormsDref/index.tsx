import { useState } from 'react';
import {
    ChevronLeftLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Button,
    ListView,
} from '@ifrc-go/ui/next';

import Link from '#components/next/Link';

import ActiveDrefTable from './ActiveDrefTable';
import CompletedDrefTable from './CompletedDrefTable';
import DownloadImportTemplateButton from './DownloadImportTemplateButton';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [currentView, setCurrentView] = useState<'active' | 'completed'>('active');
    const strings = useTranslation(i18n);

    return (
        <ListView layout="block">
            <ListView
                layout="block"
                layoutOptions={{ align: 'center' }}
            >
                <DownloadImportTemplateButton />
                <Link
                    href="https://forms.office.com/e/wFQsu0V7Zb"
                    variant="underline"
                >
                    {strings.drefFeedbackForm}
                </Link>
            </ListView>
            {currentView === 'active' && (
                <ActiveDrefTable
                    actions={(
                        <Button
                            name="completed"
                            onClick={setCurrentView}
                            variant="tertiary"
                            after={<ChevronRightLineIcon />}
                        >
                            {strings.showCompletedButtonLabel}
                        </Button>
                    )}
                />
            )}
            {currentView === 'completed' && (
                <CompletedDrefTable
                    actions={(
                        <Button
                            name="active"
                            onClick={setCurrentView}
                            variant="tertiary"
                            before={<ChevronLeftLineIcon />}
                        >
                            {strings.backToActiveButtonLabel}
                        </Button>
                    )}
                />
            )}
        </ListView>
    );
}

Component.displayName = 'AccountDREFApplications';
