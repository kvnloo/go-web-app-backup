import { useState } from 'react';
import {
    BooleanInput,
    Checkbox,
    Checklist,
    DateInput,
    FileInputButton,
    ListView,
    NumberInput,
    PasswordInput,
    RadioInput,
    RemovableItem,
    RepeatableList,
    SegmentInput,
    SelectInput,
    Switch,
    TextArea,
    TextInput,
    useRepeatableList,
} from '@ifrc-go/ui/next';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

const meta = {
    title: 'Next/Inputs/TextInput',
    component: TextInput,
    tags: ['autodocs'],
    args: {
        name: 'title',
        label: 'Title',
        value: 'Nepal Floods',
        onChange: fn(),
    },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

interface Option {
    key: string;
    label: string;
}

const hazards: Option[] = [
    { key: 'flood', label: 'Flood' },
    { key: 'cyclone', label: 'Cyclone' },
    { key: 'drought', label: 'Drought' },
];

function keySelector(option: Option) {
    return option.key;
}

function labelSelector(option: Option) {
    return option.label;
}

function TextLikeInputs() {
    const [notes, setNotes] = useState<string | undefined>('one two');
    const [people, setPeople] = useState<number | undefined>(1200);
    return (
        <ListView layout="block">
            <TextInput name="t" label="Title" required value="Floods" onChange={fn()} hint="As shown in the list" />
            <TextInput name="r" label="Read-only" readOnly value="Floods" onChange={fn()} />
            <NumberInput name="n" label="People" value={people} onChange={setPeople} />
            <TextArea name="a" label="Notes" value={notes} onChange={setNotes} maxWords={50} />
            <DateInput name="d" label="Start date" value="2026-01-05" onChange={fn()} error="Required" />
            <PasswordInput name="p" label="Password" value="secret" onChange={fn()} />
            <TextInput name="x" label="With diff" value="New title" onChange={fn()} withDiffView prevValue="Old title" />
        </ListView>
    );
}

export const TextLike: Story = { render: () => <TextLikeInputs /> };

function OptionInputs() {
    const [hazard, setHazard] = useState<string>('cyclone');
    const [many, setMany] = useState<string[]>(['flood']);
    const [ok, setOk] = useState<boolean | undefined>(true);
    return (
        <ListView layout="block">
            <Checkbox name="c" label="I agree" value={ok} onChange={setOk} />
            <Switch name="s" label="Notify me" value={ok} onChange={setOk} />
            <RadioInput name="r" label="Hazard" options={hazards} keySelector={keySelector} labelSelector={labelSelector} value={hazard} onChange={setHazard} />
            <Checklist name="l" label="Hazards" options={hazards} keySelector={keySelector} labelSelector={labelSelector} value={many} onChange={setMany} />
            <BooleanInput name="b" label="Imminent?" value={ok} onChange={setOk} />
            <SegmentInput name="v" label="View" options={hazards} keySelector={keySelector} labelSelector={labelSelector} value={hazard} onChange={setHazard} />
        </ListView>
    );
}

export const Options: Story = { render: () => <OptionInputs /> };

function Selects() {
    const [one, setOne] = useState<string | undefined>('flood');
    const [many, setMany] = useState<string[]>(['flood', 'drought']);
    return (
        <ListView layout="block">
            <SelectInput name="s" label="Hazard" options={hazards} keySelector={keySelector} labelSelector={labelSelector} value={one} onChange={setOne} />
            <SelectInput name="m" label="Hazards" options={hazards} keySelector={keySelector} labelSelector={labelSelector} multiple withSelectAllButton value={many} onChange={setMany} />
        </ListView>
    );
}

export const Select: Story = { render: () => <Selects /> };

interface Source {
    client_id: string;
    name?: string;
}

function Rows() {
    const [sources, setSources] = useState<Source[]>([{ client_id: '1', name: 'ReliefWeb' }]);
    const { add, update, remove } = useRepeatableList('sources', sources, setSources);
    return (
        <ListView layout="block">
            <RepeatableList addLabel="Add source" onAdd={() => add()}>
                {sources.map((source, index) => (
                    <RemovableItem key={source.client_id} name={source.client_id} onRemove={remove} removeLabel="Remove source" removeAriaLabel={`Remove source ${index + 1}`}>
                        <TextInput name="name" label="Name" value={source.name} onChange={(name) => update(source.client_id, { ...source, name })} />
                    </RemovableItem>
                ))}
            </RepeatableList>
            <FileInputButton name="file" onChange={fn()}>Upload document</FileInputButton>
        </ListView>
    );
}

export const Repeatable: Story = { render: () => <Rows /> };
