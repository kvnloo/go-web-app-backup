import SpinnerLayout from '#next/base/Spinner';

export interface Props {
    className?: string;
}

/** A small loading indicator, announced as busy */
function Spinner(props: Props) {
    const { className } = props;
    return <SpinnerLayout className={className} />;
}

export default Spinner;
