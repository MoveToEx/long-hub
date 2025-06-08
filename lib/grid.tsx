import { GridFilterInputValueProps, GridFilterOperator } from "@mui/x-data-grid";
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { ComponentType, useMemo } from "react";
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';

function StringInput(props: GridFilterInputValueProps) {
    const { item, applyValue } = props;
    return (
        <Box className='inline-flex flex-row items-center'>
            <TextField
                size='small'
                placeholder='value'
                type='text'
                value={item.value ?? ''}
                onChange={(event) => {
                    applyValue({ ...item, value: event.currentTarget.value });
                }}
            />
        </Box>
    )
}

function NumberInput(props: GridFilterInputValueProps) {
    const { item, applyValue } = props;
    return (
        <Box className='inline-flex flex-row items-center'>
            <TextField
                size='small'
                type='number'
                value={item.value ?? ''}
                onChange={(event) => {
                    applyValue({ ...item, value: Number(event.currentTarget.value) });
                }}
            />
        </Box>
    )
}

function BooleanInput(props: GridFilterInputValueProps) {
    const { item, applyValue } = props;
    return (
        <Box className='inline-flex flex-row items-center'>
            <Checkbox
                checked={item.value ?? ''}
                onChange={(_, value) => applyValue({ ...item, value })}
            />
        </Box>
    )
}


function DateInput(props: GridFilterInputValueProps) {
    const { item, applyValue } = props;
    const display = useMemo(() => {
        const date = item.value as Date;
        if (!date) {
            return '';
        }
        return date.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }, [item]);
    return (
        <Box className='inline-flex flex-row items-center'>
            <TextField
                size='small'
                type='date'
                value={display}
                onChange={(event) => {
                    applyValue({ ...item, value: (event.currentTarget as HTMLInputElement).valueAsDate });
                }}
            />
        </Box>
    )
}


function getEqualFilterOperator(InputComponent: ComponentType<any>): GridFilterOperator<any, any>[] {
    return [
        {
            label: '==',
            value: 'equals',
            getApplyFilterFn: (item) => {
                if (!item.field || !item.value) return null;
                return val => val === item.value;
            },
            getValueAsString: val => `equals ${val}`,
            InputComponent
        },
        {
            label: '!=',
            value: 'not',
            getApplyFilterFn: (item) => {
                if (!item.field || !item.value) return null;
                return val => val !== item.value;
            },
            getValueAsString: val => `does not equal ${val}`,
            InputComponent
        },
    ];
}

function getNullableFilterOperator(): GridFilterOperator<any, any>[] {
    return [
        {
            label: 'is null',
            value: '$null',
            requiresFilterValue: false,
            getApplyFilterFn: (item) => {
                if (!item.field) return null;
                return val => val === null;
            },
            getValueAsString: () => 'is null'
        },
        {
            label: 'is not null',
            value: '$not_null',
            requiresFilterValue: false,
            getApplyFilterFn: (item) => {
                if (!item.field) return null;
                return val => val !== null;
            },
            getValueAsString: () => 'is not null'
        },
    ];
}

function getComparableFilterOperator(InputComponent: ComponentType<any>): GridFilterOperator<any, any>[] {
    return [
        {
            label: '<',
            value: 'lt',
            getApplyFilterFn: item => {
                if (!item.field || !item.value) return null;
                return val => val < item.value;
            },
            InputComponent
        },
        {
            label: '<=',
            value: 'lte',
            getApplyFilterFn: item => {
                if (!item.field || !item.value) return null;
                return val => val <= item.value;
            },
            InputComponent
        },
        {
            label: '>',
            value: 'gt',
            getApplyFilterFn: item => {
                if (!item.field || !item.value) return null;
                return val => val > item.value;
            },
            InputComponent
        },
        {
            label: '>=',
            value: 'gte',
            getApplyFilterFn: item => {
                if (!item.field || !item.value) return null;
                return val => val > item.value;
            },
            InputComponent
        }
    ]
}

export function getNumberFilterOperator(nullable: boolean): GridFilterOperator<any, Date>[] {
    return [
        ...getEqualFilterOperator(NumberInput),
        ...getComparableFilterOperator(NumberInput),
        ...(nullable ? getNullableFilterOperator() : [])
    ];
}

export function getBooleanFilterOperator(nullable: boolean): GridFilterOperator<any, boolean>[] {
    return [
        ...getEqualFilterOperator(BooleanInput),
        ...(nullable ? getNullableFilterOperator() : [])
    ];
}

export function getSelectFilterOperator(nullable: boolean, select: string[]): GridFilterOperator<any, string>[] {
    const SelectInput = (props: GridFilterInputValueProps) => {
        const { item, applyValue } = props;

        if (!item.value) {
            applyValue({ ...item, value: select[0] });
        }

        return (
            <FormControl fullWidth>
                <Select
                    size='small'
                    value={item.value ?? select[0]}
                    onChange={(event) => {
                        applyValue({ ...item, value: event.target.value });
                    }}>
                    {select.map(val => (
                        <MenuItem value={val} key={val}>{val}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        )
    };

    return [
        {
            label: '==',
            value: 'equals',
            getApplyFilterFn: (item) => {
                if (!item.field || !item.value) return null;
                return val => val === item.value;
            },
            InputComponent: SelectInput,
        },
        {
            label: '!=',
            value: 'not',
            getApplyFilterFn: (item) => {
                if (!item.field || !item.value) return null;
                return val => val !== item.value;
            },
            InputComponent: SelectInput
        },
        ...(nullable ? getNullableFilterOperator() : [])
    ]
}

export function getDateFilterOperator(nullable: boolean): GridFilterOperator<any, number>[] {
    return [
        ...getEqualFilterOperator(DateInput),
        ...getComparableFilterOperator(DateInput),
        ...(nullable ? getNullableFilterOperator() : [])
    ];
}

export function getStringFilterOperator(nullable: boolean): GridFilterOperator<any, string>[] {
    return [
        ...getEqualFilterOperator(StringInput),
        ...(nullable ? getNullableFilterOperator() : []),
        {
            label: 'contains',
            value: 'contains',
            requiresFilterValue: true,
            getApplyFilterFn: (item) => {
                if (!item.field || !item.value) return null;
                return val => val.indexOf(item.value) != -1;
            },
            InputComponent: StringInput
        },
        {
            label: 'starts with',
            value: 'startsWith',
            requiresFilterValue: true,
            getApplyFilterFn: item => {
                if (!item.field || !item.value) return null;
                return val => val.startsWith(item.value);
            },
            InputComponent: StringInput
        },
        {
            label: 'ends with',
            value: 'endsWith',
            requiresFilterValue: true,
            getApplyFilterFn: item => {
                if (!item.field || !item.value) return null;
                return val => val.endsWith(item.value);
            },
            InputComponent: StringInput
        }
    ];
}
