import React, {ChangeEvent} from 'react';
import {InlineField, Input, Stack} from '@grafana/ui';
import {QueryEditorProps} from '@grafana/data';
import {DataSource} from '../datasource';
import {MyDataSourceOptions, MyQuery} from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export function MyQueryEditor({query, onChange, onRunQuery}: Props) {
    const onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange({...query, queryText: event.target.value});
    };

    const onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange({...query, constant: parseFloat(event.target.value)});
        // executes the query
        onRunQuery();
    };
    const onPathFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange({...query, pathFilter: event.target.value});
        // executes the query
        onRunQuery();
    };
    const {queryText, constant,pathFilter} = query;

    return (
        <Stack gap={0}>
            <InlineField label="Constant">
                <Input
                    id="query-editor-constant"
                    onChange={onConstantChange}
                    value={constant}
                    width={8}
                    type="number"
                    step="0.1"
                />
            </InlineField>
            <InlineField label="Query Text" labelWidth={16} >
                <Input
                    id="query-editor-query-text"
                    onChange={onQueryTextChange}
                    value={queryText || ''}
                    required
                    placeholder="Enter a query"
                />
            </InlineField>
            <InlineField label="Pathfilter" labelWidth={16} >
                <Input
                    id="query-editor-query-pathfilter"
                    onChange={onPathFilterChange}
                    value={pathFilter || ''}

                />
            </InlineField>
        </Stack>
    );
}
