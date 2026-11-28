import Link from '../Link';

export interface Props {
    className?: string;
    href: string | null | undefined;
    /** Such as "View All Field Reports" */
    children: React.ReactNode;
}

/** The link from a short list to the full list, with the chevron */
function ViewAllLink(props: Props) {
    const { className, href, children } = props;
    return (
        <Link className={className} href={href} variant="underline" withLinkIcon>
            {children}
        </Link>
    );
}

export default ViewAllLink;
