import { ParsedInputs, TaskResult, MessageIntent } from "../../../../shared/types";

export interface ITaskModule {
    readonly intent: MessageIntent;
    canHandle(inputs: ParsedInputs): boolean;
    execute(inputs: ParsedInputs): Promise<TaskResult>;
}
