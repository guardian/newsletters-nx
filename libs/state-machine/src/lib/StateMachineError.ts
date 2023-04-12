export enum StateMachineErrorCode {
	NoSuchStep,
	NoSuchButton,
	StorageAccessError,
	StepMethodFailed,
	NoSuchItem,
	Unhandled,
}

export class StateMachineError extends Error {
	code: StateMachineErrorCode;
	isPersistant: boolean;
	constructor(
		message: string,
		code: StateMachineErrorCode,
		isPersistent = false,
	) {
		super(message);
		this.code = code;
		this.isPersistant = isPersistent;
	}
}
