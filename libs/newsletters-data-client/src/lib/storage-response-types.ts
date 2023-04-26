export enum StorageRequestFailureReason {
	NotFound,
	InvalidDataInput,
	DataInStoreNotValid,
	S3Failure,
	NoCredentials,
}

export type SuccessfulStorageResponse<T> = {
	ok: true;
	data: T;
};

export type UnsuccessfulStorageResponse = {
	ok: false;
	message: string;
	reason?: StorageRequestFailureReason;
};
