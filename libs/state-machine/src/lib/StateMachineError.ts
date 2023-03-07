export enum StateMachineErrorCode {
	NoSuchStep,
	NoSuchButton,
	StorageAccessError,
	StepMethodFailed,
}

export class StateMachineError extends Error {
	code: StateMachineErrorCode;
	isFatal: boolean;
	constructor(message: string, code: StateMachineErrorCode, isFatal = false) {
		super(message);
		this.code = code;
		this.isFatal = isFatal;
	}
}
