import {
    expect,
    test,
} from 'vitest';

import useRepeatableList from './useRepeatableList';

interface Source {
    client_id: string;
    name?: string;
}

test('rows are added with a client id, updated and removed by it', () => {
    let value: Source[] = [{ client_id: 'a', name: 'A' }];
    const onChange = (newValue: Source[]) => { value = newValue; };

    useRepeatableList('sources', value, onChange).add({ name: 'B' });
    expect(value).toHaveLength(2);
    const added = value[1]!;
    expect(added.client_id).toBeTruthy();
    expect(added.name).toBe('B');

    useRepeatableList('sources', value, onChange).update('a', { client_id: 'a', name: 'A2' });
    expect(value[0]?.name).toBe('A2');

    useRepeatableList('sources', value, onChange).remove('a');
    expect(value.map((row) => row.client_id)).toEqual([added.client_id]);
});
