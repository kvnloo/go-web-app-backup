import { useEffect } from 'react';
import { type Language } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Page as PageBase,
    type PageProps as PageBaseProps,
    TopBanner,
} from '@ifrc-go/ui/next';
import {
    languageNameMapEn,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { type components } from '#generated/types';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';

import i18n from './i18n.json';

type TranslationModuleOriginalLanguageEnum = components<'read'>['schemas']['TranslationModuleOriginalLanguageEnum'];

type Props = PageBaseProps & {
    /** The document title */
    title?: string;
    /** Warns when the content was machine translated from this language */
    contentOriginalLanguage?: TranslationModuleOriginalLanguageEnum;
    /** Shown in place of the whole page, such as a message that it is unavailable */
    blockingContent?: React.ReactNode;
};

/**
 * The library Page with the app's page concerns: the document title, the
 * machine translation warning and blocking content
 */
function Page(props: Props) {
    const {
        title,
        contentOriginalLanguage,
        blockingContent,
        banner,
        ...pageProps
    } = props;

    const strings = useTranslation(i18n);
    const currentLanguage = useCurrentLanguage();

    useEffect(() => {
        if (isDefined(title)) {
            document.title = title;
        }
    }, [title]);

    if (isDefined(blockingContent)) {
        return blockingContent;
    }

    const machineTranslated = isDefined(contentOriginalLanguage)
        && contentOriginalLanguage !== currentLanguage;

    return (
        <PageBase
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...pageProps}
            banner={(machineTranslated || banner) && (
                <>
                    {machineTranslated && (
                        <TopBanner status="warning">
                            {resolveToString(
                                strings.pageMachineTranslatedContentWarning,
                                {
                                    contentOriginalLanguage: languageNameMapEn[
                                        contentOriginalLanguage as Language
                                    ],
                                },
                            )}
                        </TopBanner>
                    )}
                    {banner}
                </>
            )}
        />
    );
}

export default Page;
