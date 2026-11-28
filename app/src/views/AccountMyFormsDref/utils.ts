// NOTE: DREFs, operational updates and final reports have their own ids,
// which can repeat across the three
// eslint-disable-next-line import/prefer-default-export
export function getStageKey(stage: { id: number, application_type: string }) {
    return `${stage.application_type}-${stage.id}`;
}
