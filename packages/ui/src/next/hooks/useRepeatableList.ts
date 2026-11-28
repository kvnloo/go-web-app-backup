import { randomString } from '@togglecorp/fujs';

interface Row {
    client_id: string;
}

/**
 * Add, update and remove rows of an array field. Rows are matched by
 * `client_id`, and new rows get one. Works with toggle-form: pass the field
 * value and `setFieldValue`, which takes (value, name).
 */
function useRepeatableList<ROW extends Row, NAME>(
    name: NAME,
    value: ROW[] | null | undefined,
    onChange: (value: ROW[], name: NAME) => void,
) {
    const rows = value ?? [];

    const add = (initial?: Omit<ROW, 'client_id'>) => {
        onChange([...rows, { ...initial, client_id: randomString() } as ROW], name);
    };

    const update = (clientId: string, row: ROW) => {
        onChange(rows.map((item) => (item.client_id === clientId ? row : item)), name);
    };

    const remove = (clientId: string) => {
        onChange(rows.filter((item) => item.client_id !== clientId), name);
    };

    return { add, update, remove };
}

export default useRepeatableList;
