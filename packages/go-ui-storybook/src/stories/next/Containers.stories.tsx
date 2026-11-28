import {
    Button,
    Card,
    Dialog,
    ExpandableSection,
    FieldGroup,
    FormSection,
    KeyFigureCard,
    Page,
    Section,
    Text,
    TextInput,
    useDialogState,
} from '@ifrc-go/ui/next';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

const meta = {
    title: 'Next/Containers/Section',
    component: Section,
    tags: ['autodocs'],
    args: {
        heading: 'Operations',
        children: <Text>Section content</Text>,
    },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
    args: {
        heading: 'Field reports',
        empty: true,
        messages: { empty: 'No field reports yet.' },
    },
};

export const Surfaces: Story = {
    render: () => (
        <>
            <Section heading="Contrast" surface="contrast"><Text>On the opposite surface</Text></Section>
            <Section heading="Dark" surface="dark">
                <Text>Text, links and buttons switch to their on-dark colours.</Text>
                <Card heading="A card stays white"><Text variant="light">Light text inside</Text></Card>
            </Section>
        </>
    ),
};

export const Cards: Story = {
    render: () => (
        <Section heading="Key figures" layout="grid" layoutOptions={{ numPreferredColumns: 3 }}>
            <KeyFigureCard value={1240000} format="compact" label="People targeted" progress={{ value: 66, heading: 'Funding coverage' }} />
            <Card heading="Funding" footerActions={<Button name="d" onClick={fn()}>Donate</Button>}>
                <Text>Card content</Text>
            </Card>
            <Card heading="Reports" empty />
        </Section>
    ),
};

export const PageLayout: Story = {
    render: () => (
        <Page overline="Emergency" heading="Nepal Floods 2026" description="Monsoon floods across the Terai region." backLink={{ href: '/emergencies/', label: 'All emergencies' }}>
            <Section heading="Overview"><Text>Content</Text></Section>
        </Page>
    ),
};

export const Form: Story = {
    render: () => (
        <Page heading="EAP Application" variant="form">
            <FormSection heading="Overview" description="Basic details of the plan.">
                <FieldGroup heading="Contacts" description="Who to contact about the plan." required layoutOptions={{ numPreferredColumns: 2 }}>
                    <TextInput name="name" label="Name" value="" onChange={fn()} />
                    <TextInput name="email" label="Email" type="email" value="" onChange={fn()} />
                </FieldGroup>
            </FormSection>
        </Page>
    ),
};

export const Disclosure: Story = {
    render: () => (
        <Section heading="FAQ">
            <ExpandableSection heading="What is a DREF?" name="faq" initiallyExpanded>The Disaster Response Emergency Fund.</ExpandableSection>
            <ExpandableSection heading="Who can apply?" name="faq">National Societies.</ExpandableSection>
        </Section>
    ),
};

function DialogExample() {
    const { isOpen, open, close } = useDialogState();
    return (
        <>
            <Button name="open" onClick={open}>Open dialog</Button>
            {isOpen && (
                <Dialog heading="Edit field report" onClose={close} footerActions={<Button name="save" variant="primary" onClick={close}>Save</Button>}>
                    <Text>Dialog content</Text>
                </Dialog>
            )}
        </>
    );
}

export const DialogStory: Story = {
    name: 'Dialog',
    render: () => <DialogExample />,
};
